<template>
  <div id="ride">
    <b-card :title="$t('phrases.yourGallery')" />

    <vueper-slides
      fixed-height="650px"
      autoplay
      slide-image-inside
      :dragging-distance="70"
    >
      <vueper-slide
        v-for="(slide, i) in slides"
        :key="i"
        :image="slide.image"
      />
    </vueper-slides>
  </div>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { VueperSlides, VueperSlide } from 'vueperslides';
import 'vueperslides/dist/vueperslides.css';

export default {
  name: 'PhotoGallery',
  components: {
    VueperSlides,
    VueperSlide,
  },
  computed: {
    slides() {
      let slides = [];
      this.$store.getters.getPhotos.map(url => {
        slides.push({
          image: url,
          title: '',
        });
      });
      return slides;
    },
  },
};
</script>
