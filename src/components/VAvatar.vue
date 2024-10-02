<script setup>
const props = defineProps({
  src: {type: String, default: null},
  alt: { type: String, default: 'Profile avatar'}
})
</script>

<template>
    <img v-if="props?.src" class="inline-block rounded-full" :src="props?.src" alt="" />
</template>