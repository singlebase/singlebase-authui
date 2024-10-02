
<script setup>

import { computed } from 'vue';
import VFormField from '../components/VFormField.vue';
import app from '../app';

import Validator, { validatePasswordPolicy } from '../lib/vvalidator';

const $config = computed(() => app.$.config)
const $settings = app.$.settings
const $t = app.translate

const validations = {
  "password": ["required", "sameAs(password2)", "validateWithPasswordPolicy"],
  "password2": ["required"],
}
const fieldNames = {
    "password": "Password",
    "password2": "The password below"
}

const $validator = new Validator({validations, fieldNames}, app.$.form)
$validator.addCustomValidation('validateWithPasswordPolicy', (value) => validatePasswordPolicy(value, $settings.password_policy));


async function validateAndContinue() {
  const [validated, errors] = $validator.validate()
  if (validated) {
    await app.submitResetPassword()
  } else {
    console.log("Error", validated, errors)
  }
}

</script>
<template>
  <div singlebase-auth-ui-otp-view>
    <form @submit.prevent="validateAndContinue">
      <div>
        <VFormField :label="$t('newPassword')" :error="$validator?.get('password')">
          <input class="v-form-input" type="password" v-model="app.$.form.password">
        </VFormField>
        <VFormField :label="$t('reEnterPassword')">
          <input class="v-form-input" type="password" v-model="app.$.form.password2">
        </VFormField>
      </div>

      <div>
        <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
      </div>
    </form>
  </div>
</template>../app-01