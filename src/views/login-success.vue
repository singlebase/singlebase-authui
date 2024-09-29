
<script setup>
/**
 * The view to show after successful login 
 */
import { computed } from 'vue';
import app from '../app';

const $locale = computed(() => ({...app.$.locale }))
const $t = app.translate

</script>

<template>
  <div class="v-heading-description mb-6 flex justify-center">
    <div class="justify-center items-center">
      <div class="text-center mb-4">{{ $locale.globals.youAreLoggedIn }}</div>
      <button class="v-btn-ghost w-full v-btn-sm block" @click="app.signout">{{ $locale.globals.logout }}</button>
      <div class="hidden text-center my-2">or</div>
      <button class="hidden v-btn-ghost w-full v-btn-sm block" @click="app.continueWithLogin">Continue with login &rarr;</button>
    </div>
  </div>
</template>