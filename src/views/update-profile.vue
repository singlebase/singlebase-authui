<script setup>
import { computed, onMounted } from 'vue';
import VFormField from '../components/VFormField.vue';
import VSocialLogin from '../components/VSocialLogin.vue';
import VUserIcon from '../components/VUserIcon.vue';
import Validator, { validatePasswordPolicy } from '../lib/vvalidator'
import app from '../app';

const $config = computed(() => app.$.config)
const $settings = app.$.settings 
const $t = app.translate

const validations = {
  "display_name": ["required", "name"],
}

if ($config.editFullName) {
  validations["surname"] = ["required", "name"]
  validations["name"] = ["required", "name"]
}

const fieldNames = {
  "display_name": $t('displayName'),
  "name": $t('firstName'),
  "surname": $t('lastName')
}

const $validator = new Validator({validations, fieldNames}, app.$.form)
$validator.addCustomValidation('validateWithPasswordPolicy', (value) => validatePasswordPolicy(value, $settings.password_policy));

async function validateAndContinue() {
  const [validated, errors] = $validator.validate()
  if (validated) {
    await app.updateProfile()
  } else {
    console.log("Error", validated, errors)
  }
}

onMounted(async () => {
  await app?.requireAuthState()
})

</script>
<template>
  <div singlebase-auth-ui-signup-view>
    <form @submit.prevent="validateAndContinue">
      <div>


          <VFormField :label="$t('displayName')" :error="$validator?.get('display_name')">
            <input class="v-form-input" type="text" v-model="app.$.form.display_name">
          </VFormField>

          <VFormField v-if="$config.editFullName" :label="$t('firstName')" :error="$validator?.get('name')">
            <input class="v-form-input" type="text" v-model="app.$.form.name">
          </VFormField>

          <VFormField v-if="$config.editFullName" :label="$t('lastName')" :error="$validator?.get('surname')">
            <input class="v-form-input" type="text" v-model="app.$.form.surname">
          </VFormField>


          <VFormField v-if="$config.editPhoneNumber" :label="$t('phoneNumber')" :error="$validator?.get('phone_numer')">
            <input class="v-form-input" type="text" v-model="app.$.form.phone_number">
          </VFormField>

          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
          </div>
      </div>
    </form>

  </div>
</template>../app-01