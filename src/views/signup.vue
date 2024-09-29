<script setup>
import { computed } from 'vue';
import VFormField from '../components/VFormField.vue';
import VSocialLogin from '../components/VSocialLogin.vue';
import Validator, { validatePasswordPolicy } from '../lib/vvalidator'
import app from '../app';

const $config = computed(() => app.$.config)
const $locale = computed(() => ({...app.$.locale }))
const $settings = app.$.settings 
const $t = app.translate

const validations = {
  "email": ["required", "email"],
  "password": ["required", "validateWithPasswordPolicy"],
  "display_name": ["required", "name"],
  "surname": ["required", "name"]
}
const fieldNames = {
  "email": "Email",
  "password": "Password",
  "display_name": "First Name",
  "surname": "Last Name"
}

const $validator = new Validator({validations, fieldNames}, app.$.form)
$validator.addCustomValidation('validateWithPasswordPolicy', (value) => validatePasswordPolicy(value, $settings.password_policy));


async function validateAndContinue() {
  const [validated, errors] = $validator.validate()
  if (validated) {
    await app.signupWithPassword()
  } else {
    console.log("Error", validated, errors)
  }
}

</script>
<template>
  <div singlebase-auth-ui-signup-view>
    <form @submit.prevent="validateAndContinue">
      <div>
          <VFormField label="Email" :error="$validator?.get('email')">
            <input class="v-form-input" type="text" v-model="app.$.form.email">
          </VFormField>

          <VFormField label="Password" :hint="$config.showPasswordHint ? $settings?.passwordHint : null" :error="$validator?.get('password')">
            <input class="v-form-input" type="password" v-model="app.$.form.password">
          </VFormField>

          <VFormField label="First Name" :error="$validator?.get('display_name')">
            <input class="v-form-input" type="text" v-model="app.$.form.display_name">
          </VFormField>

          <VFormField label="Last Name" :error="$validator?.get('surname')">
            <input class="v-form-input" type="text" v-model="app.$.form.surname">
          </VFormField>

          <p v-if="$settings.mfa" class="text-xs text-gray-600 v-text my-4">*An OTP code will be sent to your email address to verify your account.</p>

          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">Continue</button>
          </div>
      </div>
    </form>

    <VSocialLogin  v-if="$config.showSocialLogin" prefix="Signup with "/>

  </div>
</template>../model