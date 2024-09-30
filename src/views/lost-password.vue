<script setup>
import { computed } from 'vue';
import VFormField from '../components/VFormField.vue';
import Validator from '../lib/vvalidator'
import app from '../app';

const $config = computed(() => app.$.config)
const $t = app.translate

const validations = {
  "email": ["required", "email"]
}
const fieldNames = {
    "email": "Email"
}

const $validator = new Validator({validations, fieldNames}, app.$.form)

function validateAndContinue() {

  const [validated, errors] = $validator.validate()
  if (validated) {
    app.submitLostPassword()
  } else {
    console.log("Error", validated, errors)
  }
}

</script>
<template>
    <div singlebaseauthui-lostpassword-view>
      <form @submit.prevent="validateAndContinue">
        <VFormField :label="$t('email')"  :error="$validator?.get('email')">
          <input class="v-form-input" type="text" v-model="app.$.form.email">
        </VFormField>

        <div>
          <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
        </div>
    </form>

  </div>
</template>