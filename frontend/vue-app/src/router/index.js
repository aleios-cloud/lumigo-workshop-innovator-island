/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import Vue from 'vue';
import Router from 'vue-router';
import Ride from '@/components/Ride';
import PhotoGallery from '@/components/PhotoGallery';
import ParkMap from '@/components/ParkMap';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', name: 'Home', component: ParkMap },
    { path: '/ride/:rideId', name: 'Ride', component: Ride },
    { path: '/photo-gallery', name: 'PhotoGallery', component: PhotoGallery },
  ],
});
