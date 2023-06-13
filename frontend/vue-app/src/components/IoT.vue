<template>
  <div></div>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk');
const AWSIoTData = require('aws-iot-device-sdk');
const ridesTopic = 'theme-park-rides';

export default {
  name: 'IoT',
  data() {
    return {
      init: false,
    };
  },
  methods: {
    async getCreds() {
      console.log('getCreds called');
      const cognitoIdentity = new AWS.CognitoIdentity();

      return new Promise((resolve, reject) => {
        AWS.config.credentials.get(function (err) {
          if (!err) {
            console.log(
              'Retrieved identity: ' + AWS.config.credentials.identityId,
            );
            const params = {
              IdentityId: AWS.config.credentials.identityId,
            };
            cognitoIdentity.getCredentialsForIdentity(
              params,
              function (err, data) {
                console.log('Creds: ', data);
                if (!err) {
                  resolve(data);
                } else {
                  console.log('Error retrieving credentials: ' + err);
                  reject(err);
                }
              },
            );
          } else {
            console.log('Error retrieving identity:' + err);
            reject(err);
          }
        });
      });
    },
  },
  mounted: async function () {
    // For the workshop, if this isn't in the config, the user has not
    // attemped this module yet, so hide the feature.

    if (this.$appConfig.iot.poolId === '') return;
    const AWSConfiguration = this.$appConfig.iot;

    console.log('IoT mounted');
    const _store = this.$store;
    // const _t = this.$t

    const clientId =
      'theme-park-client-' + Math.floor(Math.random() * 100000 + 1);
    AWS.config.region = AWSConfiguration.region;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWSConfiguration.poolId,
    });

    const that = this;
    const creds = await this.getCreds();

    const mqttClient = AWSIoTData.device({
      region: AWS.config.region,
      host: AWSConfiguration.host,
      clientId: clientId,
      protocol: 'wss',
      maximumReconnectTimeMs: 8000,
      debug: false,
      accessKeyId: creds.Credentials.AccessKeyId,
      secretKey: creds.Credentials.SecretKey,
      sessionToken: creds.Credentials.SessionToken,
    });

    // When first connected, subscribe to the topics we are interested in.
    mqttClient.on('connect', function () {
      console.log('mqttClient connected');
      mqttClient.subscribe(ridesTopic);
    });

    // Attempt to reconnect in the event of any error
    mqttClient.on('error', async function (err) {
      console.log('mqttClient error:', err);
      // Update creds
      const data = await that.getCreds();
      mqttClient.updateWebSocketCredentials(
        data.Credentials.AccessKeyId,
        data.Credentials.SecretKey,
        data.Credentials.SessionToken,
      );
    });

    // A message has arrived - parse to determine topic
    mqttClient.on('message', function (topic, payload) {
      console.log('IoT::onMessage: ', topic);
      const payloadEnvelope = JSON.parse(payload.toString());
      console.log('Message: ', payloadEnvelope);

      if (payloadEnvelope.type === 'alert') {
        _store.commit('setParkAlert', JSON.parse(payloadEnvelope.msg));
      }
      if (payloadEnvelope.type === 'photoProcessed') {
        console.log('Photo processed: ', payloadEnvelope.message.URL);
        _store.commit('addPhoto', payloadEnvelope.message.URL);
        _store.commit('setParkAlert', {
          title: 'Photo processed',
          type: 'info',
          confirmButtonText: 'OK',
        });
      }
      // ride updates use the ridesTopic
      if (payloadEnvelope.type === 'summary') {
        _store.commit('updateRideTimes', payloadEnvelope.msg);
      }
    });
  },
};
</script>
