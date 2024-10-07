<script setup>
const props = defineProps({
  src: {type: String, default: null},
  alt: { type: String, default: 'Profile avatar'}
})
</script>

<template>
    <img v-if="props?.src" class="inline-block rounded-full ring-2 ring-secondary p-1" :src="props?.src" :alt="props?.alt" />
</template>