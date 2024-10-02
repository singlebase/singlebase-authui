/**
 * app.ts
 * Application Controller
 * 
 * 
 */

import { reactive } from 'vue'
import { waitUntil, merge, isPlainObject, getNestedProperty, isEmpty } from './lib'
import { generatePasswordPolicyHint } from './lib/vvalidator'
import LOCALES from './locales.json'

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

const VIEWS = {
  ERROR: "error",
  UNAUTHORIZED: "unauthorized",
  LOGIN: "login",
  LOGIN_SUCCESS: "login-success",
  OTP: "otp",
  SIGNUP: "signup",
  LOST_PASSWORD: "lost-password",
  RESET_PASSWORD: "reset-password",
  INVITE_EMAIL: "invite-email",
  EMAIL_UPDATE_ACCOUNT: "invite-email-update-account",
  ACCOUNT_INFO: "account-info",
  CHANGE_EMAIL: "change-email",
  CHANGE_PASSWORD: "change-password",
  UPDATE_PROFILE: "update-profile",
  CHANGE_PROFILE_PHOTO: "change-profile-photo"
};

const NON_AUTH_VIEWS = [VIEWS.LOGIN, VIEWS.SIGNUP, VIEWS.LOST_PASSWORD]

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

/**  */
const USER_DATA_FIELDS = ["_key", "_userkey", "display_name", "name", "surname", "email", "phone_number", "email_verified", "photo_url", "new_email"]
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
    photo_url: null,
    new_email: null
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
    // @editFullName:bool - To edit name and surname, in signup and update-profile
    editFullName: true,
    // @editProfilePhoneNumber - To edit phone number
    editPhoneNumber: true,
    // @editProfilePhoto - To edit profile photo
    editProfilePhoto: true,
    // @signinRedirectUrl:str - url to redirect after success login, or if the page is entered
    signinRedirectUrl: null,
    // @signinCallback:Function - a function that will be triggered after success signin
    signinCallback: null, 
    // @signoutRedirectUrl:str - url to redirect after success login, or if the page is entered
    signoutRedirectUrl: null,
    // @signoutCallback:Function - a function that will be triggered after success signin
    signoutCallback: null, 
    // @lang:str - lang to use when locales is provided
    lang: "en", 
    // @locales:{[lang]: {...}, ...} - Additional lang
    locales: {},
    // @theme:str - The theme
    theme: "default",

    allowUpdateProfile: true,
    allowChangeEmail: true, 
    allowChangePassword: true,
    allowChangeProfilePhoto: true
  }
}

function defaultLangData(lang="en") {
  return { ...LOCALES["en"] }
}

/**
 * Hold local data
 */
const xdata: {
  otpNextAction: Function | null,
  authClient: Object|null,
  authUIConfig: Object|null,
  useFilestore: Object|null,
} = {
  otpNextAction: null,  // action can be a function or null
  authClient: null,
  authUIConfig: {},
  useFilestore: null
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
  // @config:object - configuration provided by users
  config: defaultConfigData(),

  // ----------------------------------------
  // @settings:object - settings from SBC Auth
  settings: {
    mfa: false,
    passwordHint: ""
  },

  // ----------------------------------------
  // @lang:str - current lang
  lang: "en",

  // ----------------------------------------
  // @locales: object of all locales {en:{...}, es:{...}, ...}
  locales: LOCALES

})

//-----------------------------------------------------------------------------

function initialize() {
  try {
    const sym = Symbol.for("singlebaseui");
    const xSym = window?.[sym]
    if (xSym) {
      const { auth, authUIConfig={}, useFilestore } = xSym
      if (auth) {
        xdata.authClient = auth
        xdata.authUIConfig = authUIConfig
        xdata.useFilestore = useFilestore
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
 * initialize the authui 
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
          if (NON_AUTH_VIEWS.includes(state.view)) {
            setView(VIEWS.LOGIN_SUCCESS)
            await signInSuccessCallToAction(userData)
          }
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
            if (NON_AUTH_VIEWS.includes(state.view)) {
              setView(VIEWS.LOGIN_SUCCESS)
              await signInSuccessCallToAction(userData)
            }
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

function updateConfig(config:object) {
  // lang
  if (config?.lang) {
    state.lang = config.lang
  }

  // locales
  if (isPlainObject(config?.locales)) {
    state.locales = merge(state.locales, config?.locales)
  }

  state.config = merge(state.config, config)

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
  state.form.new_email = null 
  state.form.otp = null
}

function resetForm() {
  resetPassword()
  for (const k of USER_DATA_FIELDS) {
    state.form[k] = null 
  }
}

function requiredFields(obj, fields) {
  const missingFields = fields.filter(field => !obj[field] || obj[field].trim() === '');
  if (missingFields.length > 0) {
    throw new Error('Missing required fields:' + missingFields)
  }
  return true;
}

function translate(path) {
  return getNestedProperty(state?.locales?.[state?.lang], path)
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
  setView(VIEWS.OTP)
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

async function loadAuthState() {
  const userData = await getAuthClient()?.getUser()
  resetForm()
  if (userData) {
    for (const k of USER_DATA_FIELDS) {
      state.form[k] = userData[k]
    }
    return true
  } else {
    return false
  }
}

/**
 * To require the auth state, and load the data if authenticated
 * @returns 
 */
async function requireAuthState() {
  setLoading(true)
  if (!await getAuthClient()?.getUser()) {
    setView(VIEWS.UNAUTHORIZED)
    setLoading(false)
    return false
  } else {
    if (!await loadAuthState()) {
      setView(VIEWS.UNAUTHORIZED)
      setLoading(false)
    }
    setLoading(false)
    return true    
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
  setView(VIEWS.LOGIN)
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
      setView(VIEWS.LOGIN_SUCCESS)
      await signInSuccessCallToAction(user)
      return true
    } else {
      const _e = res?.error?.description
      console.log("Error", _e)
      const errorMessage = _e in ERRORS ? ERRORS[_e] : LOGIN_ERROR
      setView(VIEWS.LOGIN)
      setErrorMessage(errorMessage)
      return false 
    }
  } catch {
    setView(VIEWS.LOGIN)
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
      setView(VIEWS.SIGNUP)
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
      gotoVerifyOTPNextAction(() => setView(VIEWS.RESET_PASSWORD))
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
      setView(VIEWS.LOGIN)
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
      gotoVerifyOTPNextAction(() => setView(VIEWS.EMAIL_UPDATE_ACCOUNT))
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
      setView(VIEWS.LOGIN)
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

// === UPDATE PROFILE
async function updateProfile() {
  try {
    setErrorMessage(null)
    setLoading(true)

    const data = {
      display_name: state.form.display_name,
    }
    
    if (state.config.editFullName) {
      data["name"] = state?.form?.name || state?.form?.display_name
      data["surname"] = state?.form?.surname || state?.form?.display_name
    }

    if (state.config?.editPhoneNumber && state.form?.phone_number) {
      data["phone_number"] = state.form?.phone_number
    }

    const res = await getAuthClient().updateProfile(data)
    if (res.ok) {
      setView(VIEWS.ACCOUNT_INFO)
      return true;
    } else {
      const _e = res?.error?.description
      const errorMessage = ERRORS?.[_e] ?? ERRORS.GENERIC
      resetPassword()
      setView(VIEWS.UNAUTHORIZED)
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

// === CHANGE EMAIL
async function changeEmail() {
  try {
    setErrorMessage(null)
    setLoading(true)

    if (state?.settings?.mfa) {
      const data = {
          email: state.form.email, 
          intent: "change_email"
      }
      const resp = await getAuthClient().sendOTP(data)
      if (resp.ok) {
        gotoVerifyOTPNextAction(submitChangeEmail)
        return true
      } else {
        setErrorMessage(ERRORS.GENERIC)
        resetPassword()
      }
    } else {
      return submitChangeEmail()
    }
  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}

async function submitChangeEmail() {
  try {
    setErrorMessage(null)
    setLoading(true)
    const data = {
      email: state.form.email,
      new_email: state.form.new_email,
      intent: 'change_email'
    } 
    if (state?.settings?.mfa) {
      data.otp = state.form.otp
    }
    const res = await getAuthClient().updateAccount(data)
    resetPassword()
    if (res.ok) {
      const user = await getAuthClient().getUser()
      setView(VIEWS.ACCOUNT_INFO)
      await signInSuccessCallToAction(user)
      return true
    } else {
      const _e = res?.error?.description
      console.log("Error", _e)
      const errorMessage = _e in ERRORS ? ERRORS[_e] : ERRORS.GENERIC
      setView(VIEWS.ERROR)
      setErrorMessage(errorMessage)
      return false 
    }
  } catch {
    setView(VIEWS.ACCOUNT_INFO)
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}

// === CHANGE PASSWORD
async function changePassword() {
  try {
    setErrorMessage(null)
    setLoading(true)

    if (state?.settings?.mfa) {
      const data = {
          email: state.form.email, 
          intent: "change_password"
      }
      const resp = await getAuthClient().sendOTP(data)
      if (resp.ok) {
        gotoVerifyOTPNextAction(submitChangePassword)
        return true
      } else {
        setErrorMessage(ERRORS.GENERIC)
        resetPassword()
      }
    } else {
      return submitChangePassword()
    }
  } catch (e) {
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}

async function submitChangePassword() {
  try {
    setErrorMessage(null)
    setLoading(true)
    const data = {
      email: state.form.email,
      new_password: state.form.password,
      intent: 'change_password'
    } 
    if (state?.settings?.mfa) {
      data.otp = state.form.otp
    }
    const res = await getAuthClient().updateAccount(data)
    resetPassword()
    if (res.ok) {
      const user = await getAuthClient().getUser()
      setView(VIEWS.ACCOUNT_INFO)
      await signInSuccessCallToAction(user)
      return true
    } else {
      const _e = res?.error?.description
      console.log("Error", _e)
      const errorMessage = _e in ERRORS ? ERRORS[_e] : ERRORS.GENERIC
      setView(VIEWS.ERROR)
      setErrorMessage(errorMessage)
      return false 
    }
  } catch {
    setView(VIEWS.ACCOUNT_INFO)
    setErrorMessage(ERRORS.GENERIC)
    return false
  } finally {
    setLoading(false)
  }
}

// === UPLOAD PHOTO
async function uploadProfilePhoto(file) {
  setErrorMessage(null)
  setLoading(true)
  try {
    const filestore = xdata.useFilestore()
    const opts = {
      public_read: true, 
      options: {
        profilephoto: true
      }
    }
    const res = await filestore.upload(file, opts)
    if (res.ok) {
      state.form.photo_url = res?.data?.url
      await getAuthClient().refreshSession()
    }
  } catch (e) {
    console.error(e)
  } finally {
    setLoading(false)
  }
  setView(VIEWS.ACCOUNT_INFO)
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
  requireAuthState,
  otpCallToAction,
  signout,
  continueWithLogin,
  signinWithPassword,
  signupWithPassword,
  updateProfile,
  changeEmail,
  changePassword,
  uploadProfilePhoto,

  submitSigninWithPassword,
  submitSignupWithPassword,
  submitLostPassword,
  submitResetPassword,
}
