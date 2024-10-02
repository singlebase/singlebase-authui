# Singlebase-AuthUI

A universal AuthUI component for authenticating users. 

It uses HTML custom element to be included in any pages and frameworks. 

## Views

Account authentication and registration:

- Login 
- Signup
- Lost password

Account management:

- Change Email
- Change Password 
- Account Info
- Update Profile 
- Update Profile Photo


## Locales/I18N

The library provides the following languages by default:

- en: English
- es: Spanish
- fr: French
- de: Deutsch
- zh: 中文 (Chinese)
- ru: Русский (Russian)

## Tag

**Singlebase-AuthUI** provides the UI via HTML Web-Component with the tag:  

`<singlebase-authui>`

```
<singlebase-authui></singlebase-authui>
```


### Config

```
const config = {
  styleRoundButton:bool 
  showBackButton:bool
  showSignupButton:bool
  showForgotPassword:bool
  showSocialLogin:bool
  showPasswordHint:bool
  signinRedirectUrl:str
  signinCallback:Function
  lang:str
  locales:Object
  theme:str
}
```

### Tag Attributes

Tag attributes to add in the html tag:

```
- lang
- theme
- view
- style-round-button
- show-back-button
- show-signup-button
- show-forgot-password-button
- show-social-login
```


### Slots

The AuthUI allows to inject a Header and a Footer

`slot="header"` or `slot="footer"`

#### - header

```
  <singlebase-authui>
    <div slot="header">Acme Login</div>
  </singlebase-authui>
```

#### - footer

```
  <singlebase-authui>
    <div slot="footer">Terms of Service - Privacy Policy</div>
  </singlebase-authui>
```


---

## Usage

To use the **Singlebase-AuthUI**, import `singlebase-js` and initialize the AuthUI using `initAuthUI()`.


### 1. Install @singlebase/singlebase-js

**NPM/Yarn Install / JS Module Install**

```
# npm
npm install @singlebase/singlebase-js 

# yarn
yarn add @singlebase/singlebase-js 

# or js module
<script type="module">
  import createClient  from 'https://cdn.jsdelivr.net/npm/@singlebase/singlebase-js/+esm'
</script>

```

### 2. Import 

In JS/TS file

```
import createClient from '@singlebase/singlebase-js'
```

or JS Module

````
<script type="module">
  import createClient  from 'https://cdn.jsdelivr.net/npm/@singlebase/singlebase-js/+esm'
</script>
````

### 3. Initialize AuthUI

```
const api_key = "your-api-key"
const singlebase = createClient({ api_key })



// config 
const authUIConfig = {
  lang: "en",
  theme: "default",

  // callback function when login is successful
  signinCallback: (user) => {
    if (user && user?._key) {
      // your code here... 
      // load to state
    }
  }
}

// when true, it will automatically import the AuthUILib 
const loadAuthUILib = true

//== Initialize AuthUI
singlebase.initAuthUI(authUIConfig, loadAuthUILib) 

```

### 5. Usage in HTML 

Inside of HTML, load the javascript 

```
<html>

<body>

  <!-- include the tag -->
  <singlebase-authui></singlebase-authui>

</body>


```

or alternatively you can load the AuthUI lib manually, and add the `<singlebase-authui>`

```
<!-- import the AuthUI library manually, type must be 'module' -->

<script type="module" src="https://cdn.jsdelivr.net/npm/@singlebase/singlebase-authui@latest/dist/index.js">

```


