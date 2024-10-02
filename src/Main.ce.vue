<script setup lang="ts">
/**
 * Main.ce.vue
 * 
 * props
 *  - lang:str=en
 *  - theme:str=default
 *  - view:str=login
 *  - style-round-button:bool
 *  - show-back-button:bool
 *  - show-signup-button:bool
 *  - show-forgot-password-button:bool
 *  - show-social-login:bool
 * 
 * 
 * @view:
 *  - login
 *  - signup
 *  - lost-password
 * 
 */

import { computed, onMounted } from 'vue';
import app from './app';
import { toBoolean } from './lib'

//=== import components
import VSpinner from './components/VSpinner.vue'
import VError from './components/VError.vue';

//=== import views
import LoginView from './views/login.vue';
import LostPasswordView from './views/lost-password.vue';
import OtpView from './views/otp.vue';
import SignupView from './views/signup.vue';
import LoginSuccessView from './views/login-success.vue';
import ResetPasswordView from './views/reset-password.vue';
import AccountInfoView from './views/account-info.vue';
import UpdateProfileView from './views/update-profile.vue';
import ChangeProfilePhotoView from './views/change-profile-photo.vue';
import ChangeEmailView from './views/change-email.vue';
import ChangePasswordView from './views/change-password.vue';

//=== set up props
const props = defineProps({
  view: {type: String, default: 'login'},
  lang: {type: String, default: 'en'},
  theme: {type: String, default: 'default'},
  styleRoundButton: {type: Boolean, default: null},
  showBackButton: {type: Boolean, default: null},
  showSignupButton: {type: Boolean, default: null},
  showForgotPasswordButton: {type: Boolean, default: null},
  showSocialLogin: {type: Boolean, default: null},
})

const VALID_ENTRY_POINTS = ["login", "signup", "lost-password", "update-profile", "account-info", "change-email", "change-password", "change-profile-photo"]

const $view = computed(() => app.$.view) 
const $config = computed(() => app.$.config)
const $t = app.translate

/**
 * Translate the current view component under $Locales#__components__
 * @param word 
 * @returns string
 */
function $t_viewComponent(word) {
  const view = $view.value
  return $t(`__components__.${view}.${word}`)
}

/**
 * Setup function
 */
async function setup() {
  // Setup config
  const config = {}

  // config with boolean attrs
  const boolAttrs = ["styleRoundButton", "showBackButton", "showSignupButton", "showForgotPasswordButton", "showSocialLogin"]
  for (const c of boolAttrs) {
    if (props?.[c] !== null) {
      config[c] = toBoolean(props?.[c])
    }
  }
  // other attrs
  for (const c of ["lang", "theme"]) {
    if(props?.[c]) {
      config[c] = props?.[c]
    }
  }

  //== update config
  if (Object.keys(config).length) {
    app.updateConfig(config)
  }

  //== use the entry point 
  if (props?.view && VALID_ENTRY_POINTS.includes(props?.view)) {
    app.setView(props?.view)
  }
}

function goBack() {
  const _default = 'login'
  const paths = {
    'signup': 'login',
    'account-info': '',
    'update-profile': 'account-info',
    'change-email': 'account-info',
    'change-password': 'account-info',
    'change-profile-photo': 'account-info'
  }
  const path = paths?.[$view.value] ?? _default
  app.setView(path)
}

// mounting
onMounted(async () => {

  // setup 
  await setup() 
  
  //== initialize
  await app.initialize()

})


</script>

<template>

<div>
  <button class="v-btn-ghost" @click="app.setView('login')">Login</button> - 
  <button class="v-btn-ghost" @click="app.setView('signup')">Signup</button> - 
  <button class="v-btn-ghost" @click="app.setView('otp')">Otp</button> -
  <button class="v-btn-ghost" @click="app.setView('lost-password')">Lost Password</button> - 
  <button class="v-btn-ghost" @click="app.setView('reset-password')">Reset Password</button> - 
  <button class="v-btn-ghost" @click="app.setView('account-info')">Account Info</button> - 
  <button class="v-btn-ghost" @click="app.setView('change-email')">Change Email</button> - 
  <button class="v-btn-ghost" @click="app.setView('change-password')">Change Password</button> -  
  <button class="v-btn-ghost" @click="app.setView('update-profile')">Update Profile</button> - 
  <button class="v-btn-ghost" @click="app.setView('change-profile-photo')">Change Profile Photo</button> - 

  <br>
</div>

 
  <div class="sm:w-full sm:max-w-xl ">

    <div v-if="app.$.initialized === 0" class="my-4">
        <VSpinner :text="$t('loading')"/>
    </div>

    <div v-if="app.$.initialized === -1" class="my-4">
        <VError>{{ $t('errorInitializationFailed') }}</VError>
    </div>

    <div v-if="app.$.initialized === 1"  class="p-2 mx-auto rounded-xl ">

      <!-- header -->
      <div><slot name="header" /></div>

      <!-- main -->
      <div>

        <!-- headnav -->
        <fieldset class="v-form-fieldset" :disabled="app.$.loading">
          <div v-if="$view !== 'login-success'" class="flex justify-between ">
            <div><button v-if="$config.showBackButton && $view !== 'login'"  :class="[$config.styleRoundButton ? '' : '']" class="v-btn-ghost v-btn-sm mb-4" @click="goBack">&larr; {{ $t('back') }}</button></div>
            <div><button v-if="$config.showSignupButton && $view === 'login'"  :class="[$config.styleRoundButton ? '' : '']" class="v-btn-ghost v-btn-sm mb-4" @click="app.setView('signup')">{{ $t('signup')}} &rarr; </button></div>
          </div>
        </fieldset>

        <!-- heading -->
        <div>
          <h2 v-if="$t_viewComponent('heading')" class="v-heading mb-4">{{ $t_viewComponent('heading') }}</h2>
          <h3 v-if="$t_viewComponent('subheading')" class="v-heading-description mb-4">{{ $t_viewComponent('subheading') }}</h3>
        </div>

        <!-- show spinner -->
        <div v-if="app.$.loading" class="my-20">
          <VSpinner />
        </div>

        <!-- show error -->
        <div v-if="app.$.error" class="my-4">
          <VError>{{ app.$.error }}</VError>
        </div>

        <!-- views -->
        <fieldset class="v-form-fieldset" v-show="!app.$.loading" >
            <LoginView v-if="$view == 'login'" />
            <SignupView v-else-if="$view == 'signup'" />
            <LostPasswordView v-else-if="$view == 'lost-password'" />
            <OtpView v-else-if="$view == 'otp'" />
            <LoginSuccessView v-else-if="$view == 'login-success'" />
            <ResetPasswordView v-else-if="$view == 'reset-password'" />
            <AccountInfoView v-else-if="$view == 'account-info'" />
            <UpdateProfileView v-else-if="$view == 'update-profile'" />
            <ChangeEmailView v-else-if="$view == 'change-email'" />
            <ChangePasswordView v-else-if="$view == 'change-password'" />
            <ChangeProfilePhotoView v-else-if="$view == 'change-profile-photo'" />
            <div v-else-if="$view === 'unauthorized'"><VError>{{ $t('unauthorized') }}</VError></div>              
            <div v-else><VError>{{ $t('invalidView') }}</VError></div>              
        </fieldset>

      </div>

      <!-- footer -->
      <div><slot name="footer" /></div>

    </div>

  </div>

</template>
./app-01