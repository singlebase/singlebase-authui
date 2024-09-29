<script setup>
import {ref} from 'vue'
const props = defineProps({
  label: {type: String, default: ""},
  hint: {type: String, default: ""},
  error: {type: String, default: null}
})
const toggleHint = ref(false)
</script>
<template>
  <div v-bind="$attrs" class="v-form-field mb-6" :class="{'v-form-field-error': error}">
      <label class="block v-form-label">
        <span class="flex items-center">
          {{ props?.label }} 
          <button type="button" v-if="hint" @click="toggleHint = !toggleHint">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="ml-2 text-slate-400 font-light stroke-current flex-shrink-0 w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
        </span>

      <div class="v-form-hint mt-2 mb-2" v-if="hint && toggleHint">{{ hint }}</div>
      <p class="block v-form-error mt-2 mb-2" v-if="error">{{ error }}</p>
      <div class="mt-1">
        <slot />
      </div>
    </label>          
  </div>
</template>