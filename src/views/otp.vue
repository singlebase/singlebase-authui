<script setup>
import { computed } from 'vue';
import VFormField from '../components/VFormField.vue';
import Validator from '../lib/vvalidator'
import app from '../app';

const $config = computed(() => app.$.config)
const $locale = computed(() => ({...app.$.locale }))
const $t = app.translate

const validations = {
  "otp": ["required"]
}
const fieldNames = {
    "otp": "OTP"
}

const $validator = new Validator({validations, fieldNames}, app.$.form)

function validateAndContinue() {

  const [validated, errors] = $validator.validate()
  if (validated) {
    app.otpCallToAction()
  } else {
    console.log("Error", validated, errors)
  }
}

</script>
<template>
  <div singlebase-auth-ui-otp-view>
    <form @submit.prevent="validateAndContinue">
      <div>
        <VFormField label="OTP" :error="$validator?.get('otp')">
          <input class="v-form-input" type="text" v-model="app.$.form.otp">
        </VFormField>
      </div>

      <div>
        <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">Continue</button>
      </div>
    </form>
  </div>
</template>../model