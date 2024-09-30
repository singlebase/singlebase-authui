<script setup lang="ts">
/**
 * Main.ce.vue
 * 
 * props
 *  - entry-point:str
 *  - show-back-button:bool
 *  - show-signup-button:bool
 *  - show-forgot-password-button:bool
 *  - show-social-login:bool
 * 
 * @entry-point:
 *  - login
 *  - signup
 *  - lost-password
 */


import { defineExpose, computed, onMounted } from 'vue';
import app from './app';
import { toBoolean } from './lib'

// components
import VSpinner from './components/VSpinner.vue'
import VError from './components/VError.vue';

// views
import LoginView from './views/login.vue';
import LostPasswordView from './views/lost-password.vue';
import OtpView from './views/otp.vue';
import SignupView from './views/signup.vue';
import LoginSuccessView from './views/login-success.vue';
import ResetPasswordView from './views/reset-password.vue';


// props
const props = defineProps({
  entryPoint: {type: String, default: 'login'},
  locale: {type: String, default: 'en'},
  theme: {type: String, default: 'default'},
  styleRoundButton: {type: Boolean, default: null},
  showBackButton: {type: Boolean, default: null},
  showSignupButton: {type: Boolean, default: null},
  showForgotPasswordButton: {type: Boolean, default: null},
  showSocialLogin: {type: Boolean, default: null},
})

const $view = computed(() => app.$.view) 
const $config = computed(() => app.$.config)
const $t = app.translate

/**
 * Translate the current view component
 * @param word 
 */
function $t_viewComponent(word) {
  const view = $view.value
  return $t(`__components__.${view}.${word}`)
}

// mounting
onMounted(async () => {

  // Setup config
  const validConfig = ["styleRoundButton", "showBackButton", "showSignupButton", "showForgotPasswordButton", "showSocialLogin"]
  const config = {}
  for (const c of validConfig) {
    if (props?.[c] !== null) {
      config[c] = toBoolean(props?.[c])
    }
  }

  // update config
  if (Object.keys(config).length) {
    app.updateConfig(config)
  }

  // use the entry point 
  const validEntryPoints = ["login", "signup", "lost-password"]
  if (props?.entryPoint && validEntryPoints.includes(props?.entryPoint)) {
    app.setView(props?.entryPoint)
  }

  // initialize
  await app.initialize()

})


</script>

<template>

<!-- <div>
  <button class="v-btn-ghost" @click="app.setView('login')">Login</button> - 
  <button class="v-btn-ghost" @click="app.setView('signup')">Signup</button> - 
  <button class="v-btn-ghost" @click="app.setView('otp')">Otp</button> -
  <button class="v-btn-ghost" @click="app.setView('lost-password')">Lost Password</button> - 
  <button class="v-btn-ghost" @click="app.setView('reset-password')">Reset Password</button> 
  <br>
</div> -->

 
  <div singlebase-authui class="sm:w-full sm:max-w-xl ">


    <div v-if="app.$.initialized === 0" class="my-4">
        <VSpinner :text="$t('loading')"/>
    </div>

    <div v-if="app.$.initialized === -1" class="my-4">
        <VError>{{ $t('errorInitializationFailed') }}</VError>
    </div>

    <div v-if="app.$.initialized === 1"  class="bg-s---late-50 p-8 mx-auto rounded-xl ">

      <!-- header -->
      <div singlebase-authui-header><slot name="header" /></div>

      <!-- main -->
      <div singlebase-authui-main>

        <!-- headnav -->
        <fieldset class="v-form-fieldset" :disabled="app.$.loading">
          <div singlebase-authui-header-nav v-if="$view !== 'login-success'" class="flex justify-between ">
            <div><button v-if="$config.showBackButton && $view !== 'login'"  :class="[$config.styleRoundButton ? '' : '']" class="v-btn-ghost v-btn-sm mb-4" @click="app.setView('login')">&larr; {{ $t('back') }}</button></div>
            <div><button v-if="$config.showSignupButton && $view === 'login'"  :class="[$config.styleRoundButton ? '' : '']" class="v-btn-ghost v-btn-sm mb-4" @click="app.setView('signup')">{{ $t('signup')}} &rarr; </button></div>
          </div>
        </fieldset>

        <!-- heading -->
        <div singlebase-authui-heading>
          <h2 v-if="$t_viewComponent('title')" class="v-heading mb-4">{{ $t_viewComponent('title') }}</h2>
          <h3 v-if="$t_viewComponent('description')" class="v-heading-description mb-4">{{ $t_viewComponent('description') }}</h3>
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
        <fieldset singlebase-authui-view class="v-form-fieldset" v-show="!app.$.loading" >
              <LoginView v-if="$view == 'login'" />
              <SignupView v-else-if="$view == 'signup'" />
              <LostPasswordView v-else-if="$view == 'lost-password'" />
              <OtpView v-else-if="$view == 'otp'" />
              <LoginSuccessView v-else-if="$view == 'login-success'" />
              <ResetPasswordView v-else-if="$view == 'reset-password'" />
              <div v-else><VError>{{ $t('invalidEntryPoint') }}</VError></div>              
        </fieldset>

      </div>

      <!-- footer -->
      <div singlebase-authui-footer><slot name="footer" /></div>

    </div>

  </div>

</template>
