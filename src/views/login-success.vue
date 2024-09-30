
<script setup>
/**
 * The view to show after successful login 
 */
import app from '../app';

const $t = app.translate

</script>

<template>
  <div class="v-heading-description mb-6 flex justify-center">
    <div class="justify-center items-center">
      <div class="text-center mb-4">{{ $t('youAreLoggedIn') }}</div>
      <button class="v-btn-ghost w-full v-btn-sm block" @click="app.signout">{{ $t('logout') }}</button>
      <div class="hidden text-center my-2">{{ $('or') }}</div>
      <button class="hidden v-btn-ghost w-full v-btn-sm block" @click="app.continueWithLogin">{{ $t('continueWithLogin') }} &rarr;</button>
    </div>
  </div>
</template>