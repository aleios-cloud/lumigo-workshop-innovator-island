<template>
  <div></div>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */
import Swal from 'sweetalert2';

export default {
  name: 'ParkAlert',
  mounted() {
    console.log('ParkAlert::mounted');
  },
  computed: {
    parkAlert() {
      return this.$store.getters.getParkAlert;
    },
  },
  watch: {
    // expected format:
    // {
    //  "title": string,
    //  "text": string,
    //  "type": string,
    //  "confirmButtonText": string
    // }

    parkAlert(msg) {
      if (msg.level === 'info') {
        msg.title = this.$t(`${msg.type}.title`);
        msg.text = this.$t(`${msg.type}.text`);
        msg.confirmButtonText = 'OK';
        msg.confirmStyle = 'success';
        msg.type = 'success';
      }
      console.log('ParkAlert: ', msg);
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: `btn btn-${msg.confirmStyle}`,
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons.fire({
        title: msg.title,
        text: msg.text,
        type: msg.type,
        confirmButtonText: msg.confirmButtonText,
      });
    },
  },
};
</script>
