<template>
  <div id="map">
    <l-map
      ref="map"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :max-bounds="maxBounds"
      :crs="crs"
      touchExtend="false"
    >
      <!-- This is the theme park map background -->
      <l-image-overlay :url="url" :bounds="bounds" />

      <!-- List of facilities markers -->
      <l-marker
        v-for="facility in facilities"
        :lat-lng="facility"
        :key="facility.id"
      >
        <l-icon :icon-anchor="[21, 0]">
          <b-button fluid class="p-1 bg-light">
            <b-img
              width="32px"
              height="32x"
              fluid
              :src="getIconFromType(facility.type)"
            ></b-img>
          </b-button>
        </l-icon>
        <l-popup :content="facility.name" />
      </l-marker>

      <!-- List of rides markers -->
      <l-marker v-for="ride in rides" :lat-lng="ride" :key="ride.id">
        <l-icon :icon-anchor="[50, 30]">
          <div :key="ride.wait" style="text-align: center">
            <b-button variant="light" :to="`/ride/${ride.id}`">
              <b-img slot="aside" :src="ride.thumbnail" width="64"></b-img>
              <span
                v-show="ride.inService"
                class="badge"
                :class="getVariantFromWait(ride.wait)"
                >{{ ride.wait }} {{ $t('words.mins') }}</span
              >
              <span
                v-show="!ride.inService"
                class="badge bg-danger"
                :class="getVariantFromWait(ride.wait)"
                >{{ $t('phrases.outOfService') }}</span
              >
              <h6>{{ ride.name }}</h6>
            </b-button>
          </div>
        </l-icon>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */
import { CRS, Icon } from 'leaflet';
import { LMap, LImageOverlay, LMarker, LPopup, LIcon } from 'vue2-leaflet';
// import { VPopover, VTooltip } from 'v-tooltip'

// Leaflet/Webpack bug workaround - https://github.com/Leaflet/Leaflet/issues/4968
delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'ParkMap',
  components: {
    LMap,
    LImageOverlay,
    LMarker,
    LPopup,
    // LPolyline,
    LIcon,
    // VPopover,
    // VTooltip
  },
  data() {
    return {
      url: this.$appConfig.images.parkMapURL,
      bounds: [
        [0, 0],
        [4500, 2625],
      ],
      minZoom: -1,
      maxZoom: 0,
      initZoom: -1,
      maxBounds: [
        [0, 0],
        [4500, 2625],
      ],
      initLocation: [2800, 1000],
      crs: CRS.Simple,
      icons: this.$appConfig.icons,
    };
  },
  computed: {
    rides() {
      return this.$store.getters.getRides;
    },
    facilities() {
      return this.$store.getters.getFacilities;
    },
  },
  methods: {
    getIconFromType: function (type) {
      return this.$appConfig.icons[type];
    },
    // Return color-coding based upon wait time
    getVariantFromWait: wait => {
      if (wait > 100) return 'bg-danger';
      if (wait > 90) return 'bg-warning';
      if (wait > 60) return 'bg-info';
      return 'bg-success';
    },
  },
  mounted: async function () {
    this.$refs.map.mapObject.setView(this.initLocation, this.initZoom);
    // this.$refs.map.mapObject.on('click', (event) => {
    //   console.log(event)
    // })
  },
};
</script>
<style scoped>
@import '../../node_modules/leaflet/dist/leaflet.css';
#map {
  height: calc(100vh - 65px);
  width: 100%;
}
h6 {
  font-size: 0.75rem !important;
}
.btn-light {
  border-color: #28a745 !important;
}
</style>
