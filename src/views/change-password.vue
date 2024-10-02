<script setup>
/**
 * To change password it requires OTP
 * 1. Capture new password
 * 2. Send OTP
 * 3. Update and return
 */
import { computed, onMounted } from 'vue';
import VFormField from '../components/VFormField.vue';
import Validator, { validatePasswordPolicy } from '../lib/vvalidator'
import app from '../app';

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
    await app.changePassword()
  } else {
    console.log("Error", validated, errors)
  }
}

onMounted(async () => {
  await app?.requireAuthState()
})

</script>
<template>
  <div>
    <form @submit.prevent="validateAndContinue">
      <div>
          <div class="mb-10">
            <div class="v-form-label">{{ $t('currentEmail') }}</div>
            <div class="v-text mt-2 font-bold text-slate-700">{{ app?.$?.form?.email }}</div>
          </div>
          
          <VFormField :label="$t('newPassword')" :error="$validator?.get('password')">
            <input class="v-form-input" type="password" v-model="app.$.form.password">
          </VFormField>
          <VFormField :label="$t('reEnterPassword')">
            <input class="v-form-input" type="password" v-model="app.$.form.password2">
          </VFormField>


          <p v-if="$settings.mfa" class="text-xs text-gray-600 v-text my-4">{{ $t('otpCodeWillBeSentToEmail') }}</p>

          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
          </div>
      </div>
    </form>

  </div>
</template>../app-01