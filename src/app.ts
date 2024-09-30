/**
 * app.ts
 * 
 * Application logic 
 */
import { reactive } from 'vue'
import { waitUntil, merge, isPlainObject, getNestedProperty, isEmpty } from './lib'
import { generatePasswordPolicyHint } from './lib/vvalidator'
import LOCALES from './lib/locales.json'

const ERRORS = {
  GENERIC: 'Unable to continue. Please try again later.',
  REQUIRE_PASSWORD_CHANGE: "Password change is required to continue",
  INVALID_EMAIL_SIGNUP: "Unable to signup. Invalid Email/Password or Email exists already.",
  INVALID_PASSWORD: "Invalid Password",
  LOGIN_ERROR:  "Unable to login. Invalid Email/Password",
  CONFIG_ERROR: "Config Error",
  SETTINGS_ERROR: "Settings Error"
}

const initError = "SinglebaseAuthUIError: [client].initAuthUI() must be called before accessing the Authentication UI. Visit https://docs.singlebasecloud.com/sdk/javascript"
const settingsError = "SinglebaseAuthUIError: failed to load settings - [client].initAuthUI() must be called before accessing the Authentication UI. Visit https://docs.singlebasecloud.com/sdk/javascript"
const configErrorSigninCallback = "SinglebaseAuthUIError: authUIConfig.signinRedirectUrl or authUIConfig.signinCallback is invalid. Visit https://docs.singlebasecloud.com/sdk/javascript"

const LOGIN_VIEW = "login"
const LOGIN_SUCCESS_VIEW = "login-success"
const OTP_VIEW = "otp"
const SIGNUP_VIEW = "signup"
const LOST_PASSWORD_VIEW = "lost-password"
const RESET_PASSWORD_VIEW = "reset-password"
const INVITE_EMAIL_VIEW = "invite-email"
const INVITE_EMAIL_UPDATE_ACCOUNT_VIEW = "invite-email-update-account"

/** 
 * Settings
    "data": {
        "enabled": true,
        "enable_email_provider": true,
        "allow_email_signup": true,
        "enable_oauth_providers": false,
        "allow_oauth_signup": false,
        "email_settings": {
            "enabled": true,
            "authentication_method": "otp",
            "account_update_verification_method": "otp",
            "verify_email_on_signup": false,
            "password_recovery_method": "otp",
            "password_policy_name": "MEDIUM",
            "password_policy": {
                "LENGTH": [
                    8,
                    64
                ],
                "SYMBOLS": true,
                "NUMBERS": true,
                "LOWERCASE": false,
                "UPPERCASE": false
            }
        },
        "oauth_providers": {}
    },
 */

function defaultFormData() {
  return {
    display_name: null,
    name: null,
    surname: null,
    email: null,
    password: null,
    password2: null,
    otp: null,
    phone_number: null,
  }
}

function defaultConfigData() {
  return {
    // @styleRoundButton:bool - to make button round or square
    styleRoundButton: true,
    // @
    showBackButton: true,
    // @
    showSignupButton: true, 
    // @
    showForgotPasswordButton: true,
    // @
    showSocialLogin: false,
    // @showPasswordHint:bool - show the password hint based on the settings password policy
    showPasswordHint: false,
    // @signinRedirectUrl:str - url to redirect after success login, or if the page is entered
    signinRedirectUrl: null,
    // @signinCallback:Function - a function that will be triggered after success signin
    signinCallback: null, 
    // @signoutRedirectUrl:str - url to redirect after success login, or if the page is entered
    signoutRedirectUrl: null,
    // @signoutCallback:Function - a function that will be triggered after success signin
    signoutCallback: null, 
    // @locale:str - locale to use when locales is provided
    locale: "", 
    // obj locales to use
    // {[locale]: {k/v}} -> {en: {...}, es: {...}}
    locales: {} 
  }
}

function defaultLocaleData(lang="en") {
  return { ...LOCALES["en"] }
}

/**
 * Hold local data
 */
const xdata: {
  otpNextAction: Function | null,
  authClient: Object|null,
  authUIConfig: Object|null,
} = {
  otpNextAction: null,  // action can be a function or null
  authClient: null,
  authUIConfig: {}
};


/** The reactive state of the application */
const state = reactive({
  // @initialize:int - 0=pending, 1=completed, -1=failed
  initialized: 0, 
  // @loading:bool - when true, the system shows a loading spinner
  loading: false,
  // @loading:null|String - an error message to display
  error: null,
  // @view:string -  the current view
  view: null,

  // ----------------------------------------
  // @form:object
  form: defaultFormData(),

  // ----------------------------------------
  // @config:object
  config: defaultConfigData(),

  // ----------------------------------------
  // @settings:object
  settings: {
    mfa: false,
    passwordHint: ""
  },

  // ----------------------------------------
  // @locale
  locale: defaultLocaleData()

})


//-----------------------------------------------------------------------------


function initialize() {
  try {
    const sym = Symbol.for("singlebaseui");
    const xSym = window?.[sym]
    if (xSym) {
      const { auth, authUIConfig={} } = xSym
      if (auth) {
        xdata.authClient = auth
        xdata.authUIConfig = authUIConfig
        const _config = updateConfig(authUIConfig)
        if (!_config.signinRedirectUrl && !_config.signinCallback) {
          state.initialized = -1
          console.error(configErrorSigninCallback)
        } else {
          init()
        }
      } else {
        state.initialized = -1
        console.error(initError)
      }
    } else {
      state.initialized = -1
      console.error(initError)
    }
  } catch (e) {
    state.initialized = -1
    console.error(e)
  }
}


/**
 * intialize the authui 
 */
async function init() {
  try {
    state.initialized = 0
    const auth = getAuthClient()
    console.log("singlebaseauthui: initializing...")
    if (auth) {
      if (auth.settings) {
        state.initialized = 1
        loadSettings(auth.settings)

        console.log("singlebaseauthui: ready")

        // callback + change view
        const userData = await auth.getUser()
        if (userData) {
          setView(LOGIN_SUCCESS_VIEW)
          await signInSuccessCallToAction(userData)
        }

      } else  {
        console.log("singlebaseauthui: pending...")
        // polling 
        const pollInt = 250
        const pollTimeout = 5000
        if(await waitUntil({
            condition: () => auth.settings, 
            action:() => {
              state.initialized = 1
              loadSettings(auth.settings)
              console.log("singlebaseauthui: ready")
              return true
            },
            timeout: pollTimeout,
            interval: pollInt       
          })) {
          // callback + change view
          const userData = await auth.getUser()
          if (userData) {
            setView(LOGIN_SUCCESS_VIEW)
            await signInSuccessCallToAction(userData)
          }
        } else {
          console.log("singlebaseauthui: error")
          state.initialized = -1
          console.error(settingsError)
        }
      }
    } else {
      state.initialized = -1
      console.error(initError)
    } 
  } catch (e) {
    state.initialized = -1;
    console.error(initError)
  }
}


function loadSettings(settings:Object) {
  state.settings = settings

  state.settings.mfa = settings?.email_settings?.authentication_method  === 'otp'
  const passwordPolicy = settings?.email_settings?.password_policy
  const passwordHint = generatePasswordPolicyHint(passwordPolicy)
  state.settings.passwordHint = passwordHint
}

function resetConfig() {
  state.config = defaultConfigData()
}

function updateConfig(config) {

  const data = merge(state.config, config)
  // setup state.locale 
  if (isPlainObject(data?.locales) && data?.locale && getNestedProperty(data?.locales, data?.locale)) {
    const nlocale = getNestedProperty(data?.locales, data?.locale)    
    if (isEmpty(state.locale)) {
      state.locale = nlocale
    } else {
      state.locale = merge(defaultConfigData(), getNestedProperty(data?.locales, config?.locale))
    }
  }
  state.config = data

  return state.config
}

function setLoading(loading=true) {
  state.loading = loading
}

function setView(view:string) {
  state.view = view
  setErrorMessage(null)
}

function setErrorMessage(error:string|null=null) {
  state.error = error
}

function clearForm() {
  state.form = defaultFormData()
}

function resetPassword() {
  state.form.password = null
  state.form.password2 = null
  state.form.otp = null
}

function requiredFields(obj, fields) {
  const missingFields = fields.filter(field => !obj[field] || obj[field].trim() === '');
  if (missingFields.length > 0) {
    throw new Error('Missing required fields:' + missingFields)
  }
  return true;
}


function translate(path) {
  return getNestedProperty(state?.locale||{}, path)
}

//-----------------------------------------------------------------------------
// ACTIONS 

/**
 * Return the auth client
 * @returns 
 */

function getAuthClient() {
  return xdata.authClient
}


/**
 * set
 * @param action 
 */
function gotoVerifyOTPNextAction(action:Function) {
  setView(OTP_VIEW)
  xdata.otpNextAction = action
}

// === OTP
/**
 * This will be triggered the CONTINUE
 */
async function otpCallToAction() {
  if (xdata.otpNextAction) {
    xdata.otpNextAction()
  }
}

async function signout() {
  try {
    if(getAuthClient()?.isAuthenticated) {
      setLoading(true)
      await getAuthClient()?.signOut()
    }
  } catch (e) { } finally {
    setLoading(false)
  }
  setView(LOGIN_VIEW)
}

async function continueWithLogin() {
  const userData = await getAuthClient().getUser()
  if (userData) {
    await signInSuccessCallToAction(userData)
  }
}

async function signInSuccessCallToAction(userData:{}) {
  if (state.config.signinRedirectUrl) {
    window.location.href = state.config.signinRedirectUrl
  } else if (state.config.signinCallback) {
    await state.config?.signinCallback(userData)
  } else {
    console.error("SinglebaseAuthUIError: Missing #.signinCallback(returnedUserData:object) or #.signinRedirectUrl:str")
  }
}

// === LOGIN/SIGNIN
async function signinWithPassword() {
  try {
    setErrorMessage(null)
    setLoading(true)

    if (state?.settings?.mfa) {
      const data = {
          email: state.form.email, 
          intent: "signin"
      }
      const resp = await getAuthClient().sendOTP(data)
      if (resp.ok) {
        gotoVerifyOTPNextAction(submitSigninWithPassword)
        return true
      } else {
        setErrorMessage(ERRORS.GENERIC)
        resetPassword()
      }
    } else {
      return submitSigninWithPassword()
    }
  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}

async function submitSigninWithPassword() {
  try {
    setErrorMessage(null)
    setLoading(true)
    const data = {
      email: state.form.email, 
      password: state.form.password
    } 
    if (state?.settings?.mfa) {
      data.otp = state.form.otp
    }
    
    const res = await getAuthClient().signInWithPassword(data)
    resetPassword()
    if (res.ok) {
      const user = await getAuthClient().getUser()
      setView(LOGIN_SUCCESS_VIEW)
      await signInSuccessCallToAction(user)
      return true
    } else {
      const _e = res?.error?.description
      console.log("Error", _e)
      const errorMessage = _e in ERRORS ? ERRORS[_e] : LOGIN_ERROR
      setView(LOGIN_VIEW)
      setErrorMessage(errorMessage)
      return false 
    }
  } catch {
    setView(LOGIN_VIEW)
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}

// === SIGNUP
/**
 * A. If Not MFA - Enter Credentials and redirect to login view
 * B. * IF MFA
 *  1. Signup
 *  2. Send OTP for signin
 *  3. Show OTP input
 *  4. Login with OTP  
 */
async function signupWithPassword() {
  try {
    setErrorMessage(null)
    setLoading(true)

    // MFA enabled
    if (state?.settings?.mfa) {
      if (await submitSignupWithPassword()) {
        const otp_resp = await getAuthClient().sendOTP({
          email: state.form.email, 
          intent: "signin"
        })
        if (otp_resp.ok) {
          gotoVerifyOTPNextAction(submitSigninWithPassword)
          return true
        } 
      } else {
        setErrorMessage(ERRORS.GENERIC)
        return false 
      }
    } else {
      return await submitSignupWithPassword()
    }
  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    resetPassword()
    return false
  } finally {
    setLoading(false)
  }
}
  
async function submitSignupWithPassword() {
  try {
    setErrorMessage(null)
    setLoading(true)

    const creds = {
      email: state.form.email,
      password: state.form.password,
      display_name: state.form.display_name,
      name: state.form.display_name,
      surname: state.form.surname || state.form.display_name
    }
    const res = await getAuthClient().signUpWithPassword(creds)
    if (res.ok) {
      return true;
    } else {
      const _e = res?.error?.description
      const errorMessage = ERRORS?.[_e] ?? ERRORS.INVALID_EMAIL_SIGNUP
      resetPassword()
      setView(SIGNUP_VIEW)
      setErrorMessage(errorMessage)
      return false
    }
  } catch (e) {
    resetPassword()
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}


//== FORGOT PASSWORD
async function submitLostPassword() {
  try {
    setErrorMessage(null)
    setLoading(true)
  
    const resp = await getAuthClient().sendOTP({
        email: state.form.email, 
        intent: "change_password"
      })
    if (resp.ok) {
      gotoVerifyOTPNextAction(() => setView(RESET_PASSWORD_VIEW))
      return true
    } else {
      setErrorMessage(ERRORS.GENERIC)
      return false 
    }
  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }

}

async function submitResetPassword() {
  try {
    setErrorMessage(null)
    setLoading(true)

    // check fields
    requiredFields(state.form, ['email', 'otp', 'password'])

    const resp = await getAuthClient().updateAccount({
        email: state.form.email, 
        otp: state.form.otp,
        new_password: state.form.password,
        intent: "change_password"
      })
    if (resp.ok) {
      // return to login 
      resetPassword()
      setView(LOGIN_VIEW)
      return true 
    } else {
      setErrorMessage(ERRORS.GENERIC)
      return false 
    }
  } catch (e) {
    console.error("SinglebaseAuthUIError", e)
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}


//== INVITE EMAIL
async function submitInviteEmail() {
  try {
    setErrorMessage(null)
    setLoading(true)
    const resp = await getAuthClient().sendOTP({
        email: state.form.email, 
        intent: "invite"
      })
    if (resp.ok) {
      gotoVerifyOTPNextAction(() => setView(INVITE_EMAIL_UPDATE_ACCOUNT_VIEW))
      return true
    }  else {
      setErrorMessage(ERRORS.GENERIC)
      return false 
    }

  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}


async function submitInviteEmailUpdateAccount() {
  try {
    setErrorMessage(null)
    setLoading(true)

    const creds = {
      email: state.form.email,
      password: state.form.password,
      display_name: state.form.display_name,
      name: state.form?.name || state.form.display_name,
      surname: state.form?.surname,
      phone_number: state.form.phone_number,
      grant_type: 'otp',
      otp: state.form.otp
    }

    const resp = await getAuthClient().signInWithPassword(creds)
    if (resp.ok) {
      setView(LOGIN_VIEW)
      return true
    }  else {
      setErrorMessage(ERRORS.GENERIC)
      return false 
    }
  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}


export default {
  $: state, // shortcut 
  state,
  setView,
  clearForm,
  updateConfig,
  translate,

  // --- // --- // ---
  // Actions
  initialize,
  otpCallToAction,
  signout,
  continueWithLogin,
  signinWithPassword,
  submitSigninWithPassword,
  signupWithPassword,
  submitSignupWithPassword,
  submitLostPassword,
  submitResetPassword
}

