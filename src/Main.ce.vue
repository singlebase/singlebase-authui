<script setup lang="ts">
/**
 * Main.ce.vue
 * 
 * props
 * note: props with camelCase must be set as dash in the element
 * ie: showSocialLogin => show-social-login | show-social-login="true|false"
 *  - lang:str=en
 *  - theme:str=dark|light
 *  - view:str=login
 *  - style-round-button:bool
 *  - show-back-button:bool
 *  - show-signup-button:bool
 *  - show-forgot-password-button:bool
 *  - show-social-login:bool
 *  - hide-login-success-view:bool
 * 
 * 
 * @view:
 * 
 * Unauth views - They don't require login
 *  - login
 *  - signup
 *  - lost-password
 * 
 * Auth views - They will present the login if not logged in. Then redirect
 *  - account
 *  - edit-account
 *  - change-email
 *  - change-password
 *  - change-profile-photo
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
import AccountDetailsView from './views/account.vue';
import EditAccountView from './views/edit-account.vue';
import ChangeProfilePhotoView from './views/change-profile-photo.vue';
import ChangeEmailView from './views/change-email.vue';
import ChangePasswordView from './views/change-password.vue';


//=== set up props
// note: props with camelCase must be set as dash in the element
// ie: showSocialLogin => show-social-login | show-social-login="true|false"
const props = defineProps({
  view: {type: String, default: app.LOGIN_VIEW},
  lang: {type: String, default: 'en'},
  theme: {type: String, default: 'dark'},
  styleRoundButton: {type: Boolean, default: null},
  showSignupButton: {type: Boolean, default: null},
  showForgotPasswordButton: {type: Boolean, default: null},
  showSocialLogin: {type: Boolean, default: null},
  hideLoginSuccessView: {type: Boolean, default: null},
})

/**
 * Entry point that can be used
 */
const UNAUTH_ENTRYPOINTS = [
  "login", 
  "signup", 
  "lost-password"
]
const AUTH_ENTRYPOINTS = [
  "account", 
  "edit-account", 
  "change-email", 
  "change-password", 
  "change-profile-photo"
]

// config with boolean attrs
const CONFIG_BOOL_ATTRS = [
  "styleRoundButton", 
  "showSignupButton", 
  "showForgotPasswordButton", 
  "showSocialLogin",
  "hideLoginSuccessView"
]

const $view = computed(() => app.$.view)
const $config = computed(() => app.$.config)
const $t = app.translate // alias 

/**
 * Translate the current view component under $Locales#__components__
 * @param word 
 * @returns string
 */
function $t_viewComponent(word, view=null) {
  if (!view) {
    view = $view.value
  }
  return $t(`__components__.${view}.${word}`)
}



/**
 * Setup
 * 
 */
async function setup() {

  // Setup config
  const config = {}

  for (const c of CONFIG_BOOL_ATTRS) {
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
  const entrypoints = UNAUTH_ENTRYPOINTS.concat(AUTH_ENTRYPOINTS)
  if (props?.view && entrypoints.includes(props?.view)) {
    const entrypoint = props?.view
    let view = app.LOGIN_VIEW

    // Require login check
    if (AUTH_ENTRYPOINTS.includes(props?.view)) {
      if(await app.isAuthenticated()) {
        view = entrypoint
      } else {
        app.setView(app.LOGIN_VIEW)
        app.setPostLoginView(entrypoint)
      }
    } else {
      app.setView(props?.view)
    }
    
  }
}

// --- MOUNT
onMounted(async () => {

  // setup 
  await setup() 
  
  //== initialize
  await app.initialize()

})


/**
 * Hide login success view 
 */
const $hideLoginSuccessView = computed(() => {
  return $view.value === 'login-success' && $config.value.hideLoginSuccessView === true
})

</script>

<template>
  
/*  DEV_ONLY_CODE_START */
<div>
  <button class="v-btn-ghost" @click="app.setView('login')">Login</button> - 
  <button class="v-btn-ghost" @click="app.setView('signup')">Signup</button> - 
  <button class="v-btn-ghost" @click="app.setView('otp')">Otp</button> -
  <button class="v-btn-ghost" @click="app.setView('lost-password')">Lost Password</button> - 
  <button class="v-btn-ghost" @click="app.setView('reset-password')">Reset Password</button> - 
  <button class="v-btn-ghost" @click="app.setView('account')">Account Details</button> - 
  <button class="v-btn-ghost" @click="app.setView('change-email')">Change Email</button> - 
  <button class="v-btn-ghost" @click="app.setView('change-password')">Change Password</button> -  
  <button class="v-btn-ghost" @click="app.setView('edit-account')">Edit Account</button> - 
  <button class="v-btn-ghost" @click="app.setView('change-profile-photo')">Change Profile Photo</button> - 

  <br><br>
</div> 
/* DEV_ONLY_CODE_END */

<div :data-theme="$config.theme" v-if="!$hideLoginSuccessView">
  <div class="background px-6 py-8 rounded-xl sm:w-full sm:max-w-xl ">
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

        <!-- heading -->
        <div v-if="!app.$.loading">
          <div class="flex justify-between mb-4">
            <h2 v-if="$t_viewComponent('heading')" class="v-heading mb-4">{{ $t_viewComponent('heading') }}</h2>
            <div>
              <button type="button" v-if="$config.showSignupButton && $view === 'login'"  :class="[$config.styleRoundButton ? '' : '']" class="v-subheading v-btn-link" @click="app.setView('signup')">{{ $t_viewComponent('heading', 'signup')}}</button>
              <button type="button" v-if="['signup', 'otp', 'reset-password', 'lost-password'].includes($view)"  :class="[$config.styleRoundButton ? '' : '']" class="v-subheading v-btn-link" @click="app.setView('login')">{{ $t_viewComponent('heading', 'login')}}</button>
              <button type="button" v-if="['change-email', 'change-password', 'change-profile-photo', 'edit-account'].includes($view)"  :class="[$config.styleRoundButton ? '' : '']" class="v-subheading v-btn-link" @click="app.setView('account')">{{ $t_viewComponent('heading', 'account')}}</button>
            </div>
          </div>

          <h3 v-if="$t_viewComponent('subheading')" class="v-heading-description mb-4">{{ $t_viewComponent('subheading') }}</h3>
        </div>

        <!-- show spinner -->
        <div v-if="app.$.loading" class="my-20">
          <VSpinner :text="app?.$?.loadingText" />
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
            <AccountDetailsView v-else-if="$view == 'account'" />
            <EditAccountView v-else-if="$view == 'edit-account'" />
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
</div>

</template>
