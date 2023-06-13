<template>
  <div id="app">
    <navBar />
    <router-view></router-view>
    <iot />
    <parkAlert />
  </div>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import NavBar from '@/components/NavBar';
import ParkAlert from '@/components/ParkAlert';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    NavBar,
    ParkAlert,
  },
  methods: {
    initState: function (items) {
      let initRideTimes;
      items.map(item => {
        // Initial ride time valus - store until locations populaterd
        if (item.partitionKey === 'config' && item.message) {
          initRideTimes = item.message;
        }
        // Photos
        if (item.partitionKey === 'user-photo') {
          this.$store.commit('addPhoto', item.URL);
        }
        // Other data
        if (item.partitionKey !== 'locations') return;
        const key = item.sortKey.split('-')[0];
        switch (key) {
          // Facilities
          case 'facility':
            this.$store.commit('addFacility', {
              id: item.sortKey,
              name: item.name,
              lat: JSON.parse(item.map).lat.N,
              lng: JSON.parse(item.map).lng.N,
              type: item.type,
            });
            break;
          // Rides
          case 'ride':
            this.$store.commit('addRide', {
              id: item.sortKey,
              name: item.name,
              lat: JSON.parse(item.map).lat.N,
              lng: JSON.parse(item.map).lng.N,
              thumbnail: item.thumbnail,
              image: item.image,
              wait: null,
              inService: null,
            });
            break;
        }
        // Now add init ride times
        if (initRideTimes) {
          this.$store.commit('updateRideTimes', initRideTimes);
        }
        this.$store.commit('setInitialized');
      });
    },
  },
  mounted: async function () {
    try {
      // For the workshop, if this isn't in the config, the user has not
      // attemped this module yet, so don't initalize.
      if (this.$appConfig.initStateAPI === '') return;

      const response = await axios.get(`${this.$appConfig.initStateAPI}`);
      console.log('ParkMap: ', response);
      this.initState(response.data.result.Items);
    } catch (err) {
      console.error(err);
    }
  },
};
</script>
<style>
body {
  background: #00b0f3 !important;
}
</style>
