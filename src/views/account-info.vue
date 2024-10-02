<script setup>
import { computed, onMounted } from 'vue';
import VFormField from '../components/VFormField.vue';
import VSocialLogin from '../components/VSocialLogin.vue';
import VUserIcon from '../components/VUserIcon.vue';
import VAvatar from '../components/VAvatar.vue';
import app from '../app';

const $config = computed(() => app.$.config)
const $t = app.translate
const $form = app?.$.form

onMounted(async () => {
  await app?.requireAuthState()
})

</script>
<template>
  <div>
    <div class="border-t border-slate-100">
      <dl class="divide-y divide-slate-100 v-text">

        <div class="flex flex-col items-center justify-center my-4">
          <div class="flex flex-col items-center">
            <div>
              <VAvatar v-if="app?.$?.form?.photo_url" :src="app?.$?.form?.photo_url" class="h-24 w-24" aria-hidden="true" />
              <VUserIcon v-else class="h-24 w-24 text-slate-300" aria-hidden="true" />            
            </div>
            <div class="mt-2"> <!-- Added margin top for spacing -->
              <div class="text-sm v-text font-light text-slate-600">{{ app.$.form.email }}</div>
            </div>
          </div>
        </div>


        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm font-light v-text text-slate-600">{{ $t('displayName') }}</dt>
          <dd class="mt-1 text-base v-text text-slate-600 sm:col-span-2 sm:mt-0">{{ app.$.form.display_name }}</dd>
        </div>
        <div v-if="$config.editFullName" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm font-light v-text text-slate-600">{{ $t('firstName') }}</dt>
          <dd class="mt-1 text-base v-text text-slate-600 sm:col-span-2 sm:mt-0">{{ app.$.form.name }}</dd>
        </div>
        <div v-if="$config.editFullName" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm font-light v-text text-slate-600">{{ $t('lastName') }}</dt>
          <dd class="mt-1 text-base v-text text-slate-600 sm:col-span-2 sm:mt-0">{{ app.$.form.surname }}</dd>
        </div>
        <div v-if="$config.editPhoneNumber" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm font-light v-text text-slate-600">{{ $t('phoneNumber') }}</dt>
          <dd class="mt-1 text-base v-text text-slate-600 sm:col-span-2 sm:mt-0">{{ app.$.form.phone_number }}</dd>
        </div>
      </dl>
    </div>

    <div class="my-4 text-xs font-light leading-6 text-slate-500">(id: {{ app.$.form._userkey }})</div>

    <div class="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button class="v-btn-ghost w-full" @click="app?.setView('change-email')">{{ $t('changeEmail') }}</button>
      <button class="v-btn-ghost w-full" @click="app?.setView('change-password')">{{ $t('changePassword') }}</button>
      <button class="v-btn-ghost w-full" @click="app?.setView('update-profile')">{{ $t('updateProfile') }}</button>
      <button class="v-btn-ghost w-full" @click="app?.setView('change-profile-photo')">{{ $t('changeProfilePhoto') }}</button>
    </div>

  </div>
</template>../app-01