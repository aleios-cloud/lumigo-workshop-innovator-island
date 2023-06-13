<template>
  <div id="ride">
    <!-- Ride details -->
    <b-card class="m-2" style="max-width: 50rem">
      <b-card-img-lazy :src="ride.image"></b-card-img-lazy>
      <b-card-text
        ><h3>{{ ride.name }}</h3></b-card-text
      >
      <b-card-text
        ><h6>{{ $t('words.description') }}</h6></b-card-text
      >
      <b-card-text>{{ $t(`rideDescriptions.${ride.id}`) }}</b-card-text>
      <img :src="image" class="mt-4" />
      <!-- This button is hidden if module 3 hasn't been started yet -->
      <div id="addPhoto" v-if="$appConfig.photoUploadURL !== ''">
        <b-button
          :disabled="image !== ''"
          @click="$refs.file.click()"
          block
          href="#"
          variant="primary"
          type="file"
          >{{ $t('phrases.addPhoto') }}</b-button
        >
      </div>
      <input
        id="file"
        accept="image/jpeg"
        type="file"
        ref="file"
        style="display: none"
        @change="onFileChange"
      />
    </b-card>
    <!-- Wait time information -->
    <div id="waitTimeCard">
      <div v-show="ride.inService === true">
        <b-card
          bg-variant="primary"
          text-variant="white"
          :header="$t('phrases.currentWaitTime')"
          class="m-2 text-center"
        >
          <h3>{{ ride.wait }} {{ $t('words.mins') }}</h3>
        </b-card>
      </div>
      <div v-show="ride.inService === false">
        <b-card
          bg-variant="danger"
          text-variant="white"
          :header="$t('phrases.currentWaitTime')"
          class="m-2 text-center"
        >
          <h3>{{ $t('phrases.outOfService') }}</h3>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const axios = require('axios');
export default {
  name: 'Ride',
  data() {
    return {
      image: '',
      ride: {
        id: null,
        name: null,
        image: 'null',
        inService: null,
        wait: 0,
      },
    };
  },
  methods: {
    refreshPage: function () {
      // Exit if the application hasn't initialized the ride list
      if (!this.$store.getters.isInitialized) return;

      const ride = this.rides.find(
        ride => ride.id === this.$route.params.rideId,
      );
      this.ride.id = ride.id;
      this.ride.name = ride.name;
      this.ride.image = ride.image;
      this.ride.inService = ride.inService;
      this.ride.wait = ride.wait;
    },
    makeToast(title, body, variant = 'success') {
      this.$bvToast.toast(body, {
        title,
        variant,
        toaster: 'b-toaster-bottom-center',
        solid: true,
      });
    },
    fileSelected() {
      console.log(this.$refs.file.files);
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      // var image = new Image()
      let reader = new FileReader();
      const MAX_IMAGE_SIZE = 20000000;
      reader.onload = e => {
        console.log('length: ', e.target.result.includes('data:image/jpeg'));
        if (!e.target.result.includes('data:image/jpeg')) {
          return alert(this.$t('errors.photoWrongType'));
        }
        if (e.target.result.length > MAX_IMAGE_SIZE) {
          return alert(this.$t('errors.photoTooLarge'));
        }
        this.image = e.target.result;
        this.uploadImage();
      };
      reader.readAsDataURL(file);
    },
    uploadImage: async function () {
      const API_ENDPOINT = this.$appConfig.photoUploadURL;
      // Get the presigned URL
      const response = await axios({
        method: 'GET',
        url: API_ENDPOINT,
      });
      console.log('Response: ', response.data);
      console.log('Uploading: ', this.image);
      let binary = atob(this.image.split(',')[1]);
      let array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      let blobData = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
      console.log('Uploading to: ', response.data.uploadURL);
      const result = await fetch(response.data.uploadURL, {
        method: 'PUT',
        body: blobData,
      });
      console.log('Result: ', result);
      // Final URL for the user doesn't need the query string params
      this.uploadURL = response.data.uploadURL.split('?')[0];
      this.image = '';
      // Alert user
      this.makeToast(
        this.$t('photoUploaded.title'),
        this.$t('photoUploaded.text'),
      );
    },
  },
  computed: {
    rides() {
      return this.$store.getters.getRides;
    },
  },
  created() {
    this.refreshPage();
  },
  watch: {
    rides() {
      this.refreshPage();
    },
  },
};
</script>

<style scoped>
img {
  width: 80%;
  margin: auto;
  display: block;
  margin-bottom: 10px;
}
.spacer {
  margin-top: 40px;
}
</style>
