// eslint-disable-next-line no-restricted-imports
import AWS from 'aws-sdk';
AWS.config.region = process.env.AWS_REGION;
const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

export const main = async event => {
  const params = {
    MetricData: [],
    Namespace: 'InnovatorIsland',
  };

  // Incoming message
  const msg = JSON.parse(event.detail.msg);

  msg.map(stat => {
    params.MetricData.push({
      MetricName: 'wait-times',
      Dimensions: [
        {
          Name: 'Type',
          Value: 'ride',
        },
        {
          Name: 'Ride',
          Value: stat.rideId,
        },
      ],
      Unit: 'Seconds',
      Value: stat.wait * 60,
    });
  });

  // Send to CloudWatch
  console.log(await cloudwatch.putMetricData(params).promise());
};
