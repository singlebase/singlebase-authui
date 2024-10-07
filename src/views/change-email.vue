<script setup>
/**
 * To change email, it requires OTP
 * 1. Capture new email
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
  "new_email": ["required", "email"],
}
const fieldNames = {
  "new_email": $t('email'),
}

const $validator = new Validator({validations, fieldNames}, app.$.form)

async function validateAndContinue() {
  const [validated, errors] = $validator.validate()
  if (validated) {
    await app.changeEmail()
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
            <div class="v-text mt-2 font-bold">{{ app?.$?.form?.email }}</div>
          </div>
          
          <VFormField :label="$t('newEmail')" :error="$validator?.get('new_email')">
            <input class="v-form-input" type="text" v-model="app.$.form.new_email">
          </VFormField>

          <p v-if="$settings.mfa" class="text-xs v-text my-4">{{ $t('otpCodeWillBeSentToEmail') }}</p>

          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
          </div>
      </div>
    </form>

  </div>
</template>