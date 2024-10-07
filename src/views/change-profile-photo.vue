<script setup>
import { useTemplateRef, computed, reactive, onMounted } from 'vue';
import VFormField from '../components/VFormField.vue';
import VSocialLogin from '../components/VSocialLogin.vue';
import VUserIcon from '../components/VUserIcon.vue';
import VAvatar from '../components/VAvatar.vue';
import Validator, { validatePasswordPolicy } from '../lib/vvalidator'
import app from '../app';

const $config = computed(() => app.$.config)
const $settings = app.$.settings 
const $t = app.translate
const $$inputImage = useTemplateRef('inputImage')

const xstate = reactive({
  error: null,
  ready: false,
  previewUrl: null,
  file: null
})

const validations = {
  "display_name": ["required"],
  "surname": ["required", "name"]
}
const fieldNames = {
  "display_name": $t('firstName'),
  "surname": $t('lastName')
}

const $validator = new Validator({validations, fieldNames}, app.$.form)
$validator.addCustomValidation('validateWithPasswordPolicy', (value) => validatePasswordPolicy(value, $settings.password_policy));

async function validateAndContinue() {
  const [validated, errors] = $validator.validate()
  if (validated) {
    if (xstate.file) {
      await app.uploadProfilePhoto(xstate.file)
    }
  } else {
    console.log("Error", validated, errors)
  }
}

function selectFile() {
  const fileInput = $$inputImage.value
  if (fileInput) {
    xstate.ready = false 
    xstate.error = null 
    xstate.previewUrl = null 

    fileInput.value = ""
    fileInput.click()
  }
}

onMounted(async () => {
  await app?.requireAuthState()
  if (app?.$.form?.photo_url) {
    xstate.previewUrl = app?.$.form?.photo_url
  }
})

onMounted(() => {
  const fileInput = $$inputImage.value
  fileInput.addEventListener('change', function(event) {
      xstate.ready = false 
      xstate.error = null 
      xstate.previewUrl = null 
      xstate.file = null

      const file = event.target.files[0];
      if (file) {
        if (file.type.startsWith('image/')) {
            xstate.file = file 
            xstate.ready = true 
            xstate.previewUrl = URL.createObjectURL(file)
        } else {
            xstate.previewUrl = null 
            xstate.error = "Invalid image file"
        }
      }
  });
})

</script>
<template>
  <div>
    <form @submit.prevent="validateAndContinue">
      <div>
          <input ref="inputImage" type="file" class="hidden" name="image" accept="image/*">
          <VFormField :label="$t('profilePhoto')">
            <div class="mt-2 flex items-center gap-x-3">
              <div class="items-center">
                <VAvatar v-if="xstate.previewUrl" :src="xstate.previewUrl" class="h-24 w-24" aria-hidden="true"/>
                <VUserIcon v-else class="h-24 w-24 v-text" aria-hidden="true" />
              </div>
              <button type="button" @click="selectFile" class="v-btn v-btn-ghost">{{ $t('change') }}</button>
            </div>
          </VFormField>

          <div v-if="xstate.ready" class="text-orange-700 animate-bounce v-text my-4">{{ $t('profilePhotoNotUploadedYet') }}</div>
          <div>
            <button type="button" :class="[$config.styleRoundButton ? 'v-btn-pill' : '']" class="v-btn-primary w-full my-4 uppercase" @click="validateAndContinue">{{ $t('continue') }}</button>
          </div>
      </div>
    </form>
  </div>
</template>