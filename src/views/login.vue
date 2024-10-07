<script setup>
import { computed } from 'vue';
import VFormField from '../components/VFormField.vue';
import VSocialLogin from '../components/VSocialLogin.vue';

import Validator, { validatePasswordPolicy } from '../lib/vvalidator';
import app from '../app';

const $config = computed(() => app.$.config)
const $settings = app.$.settings 
const $t = app.translate

const validations = {
  "email": ["required", "email"],
  "password": ["required", "validateWithPasswordPolicy"]
}

const fieldNames = {
    "email": $t('email'),
    "password": $t('password')
}

const $validator = new Validator({validations, fieldNames}, app.$.form)
$validator.addCustomValidation('validateWithPasswordPolicy', (value) => validatePasswordPolicy(value, $settings.password_policy));

async function validateAndContinue() {
  const [validated, errors] = $validator.validate()
  if (validated) {
    await app.signinWithPassword()
  } else {
    console.log("Error", validated, errors)
  }
}

</script>
<template>

  <div singlebase-auth-ui-login-view >

    <div class="mt-4"  v-if="$config.showSocialLogin">
      <VSocialLogin :prefix="$t('loginWith')"/>
    </div>

    <form @submit.prevent="validateAndContinue">
      <div class="email-login">
          <VFormField :label="$t('email')" :error="$validator?.get('email')">
            <input class="v-form-input" type="text" v-model="app.$.form.email">
          </VFormField>

          <VFormField :label="$t('password')" :hint="$config.showPasswordHint ? $settings?.passwordHint : null" :error="$validator?.get('password')">
            <input class="v-form-input" type="password"  v-model="app.$.form.password">
          </VFormField>

          <p v-if="$settings.mfa" class="text-xs text v-text my-4">{{ $t('otpCodeWillBeSentToEmail') }}</p>

          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
            
            <div v-if="$config.showForgotPasswordButton" class="flex justify-center mb-4">
              <button type="button" :class="[$config.styleRoundButton ? 'v--btn-pill' : '']" class="v-btn-ghost v-btn-sm" @click="app.setView('lost-password')">{{ $t('forgotPassword') }}</button>
            </div>

          </div>
      </div>
    </form>


  </div>
</template>../app-01