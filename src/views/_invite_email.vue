
<script setup>
/**
 * !!! TODO
 */
import VFormField from '../components/VFormField.vue';
import app from '../app';

import Validator from '../lib/vvalidator';

const validations = {
  "email": ["required", "email"],
  "password": ["required"]
}
const fieldNames = {
    "email": "Email",
    "password": "Password"
}

const $validator = new Validator({validations, fieldNames}, app.$.form)

function validateAndContinue() {

  const [validated, errors] = $validator.validate()
  if (validated) {
    console.log("OK")
  } else {
    console.log("Error", validated, errors)
  }
}

</script>
<template>
  <div singlebase-auth-ui-otp-view>
    <form @submit.prevent="validateAndContinue">
      <div>
        <div class="text-center text-sm v-text-description">
          *A One Time Password (OTP) code was sent to your email address, 
          please enter it below to continue.
        </div>

        <VFormField label="OTP">
          <input class="v-form-input" type="text" v-model="app.$.form.otp">
        </VFormField>
      </div>

      <div>
        <button class="v-btn-primary w-full my-4 uppercase">Continue</button>
      </div>
    </form>
  </div>
</template>../app-01