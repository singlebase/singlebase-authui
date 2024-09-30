<script setup>
import { computed } from 'vue';
import VFormField from '../components/VFormField.vue';
import VSocialLogin from '../components/VSocialLogin.vue';
import Validator, { validatePasswordPolicy } from '../lib/vvalidator'
import app from '../app';

const $config = computed(() => app.$.config)
const $settings = app.$.settings 
const $t = app.translate

const validations = {
  "email": ["required", "email"],
  "password": ["required", "validateWithPasswordPolicy"],
  "display_name": ["required", "name"],
  "surname": ["required", "name"]
}
const fieldNames = {
  "email": $t('email'),
  "password": $t('password'),
  "display_name": $t('firstName'),
  "surname": $t('lastName')
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
          <VFormField :label="$t('email')" :error="$validator?.get('email')">
            <input class="v-form-input" type="text" v-model="app.$.form.email">
          </VFormField>

          <VFormField :label="$t('password')" :hint="$config.showPasswordHint ? $settings?.passwordHint : null" :error="$validator?.get('password')">
            <input class="v-form-input" type="password" v-model="app.$.form.password">
          </VFormField>

          <VFormField :label="$t('firstName')" :error="$validator?.get('display_name')">
            <input class="v-form-input" type="text" v-model="app.$.form.display_name">
          </VFormField>

          <VFormField :label="$t('lastName')" :error="$validator?.get('surname')">
            <input class="v-form-input" type="text" v-model="app.$.form.surname">
          </VFormField>

          <p v-if="$settings.mfa" class="text-xs text-gray-600 v-text my-4">{{ $t('otpCodeWillBeSentToEmail') }}</p>

          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
          </div>
      </div>
    </form>

    <VSocialLogin  v-if="$config.showSocialLogin" :prefix="$t('signupWith')"/>

  </div>
</template>