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

```html
<singlebase-authui></singlebase-authui>
```


### Config

``` js 
const config = {
  styleRoundButton:bool 
  showSignupButton:bool
  showForgotPassword:bool
  showSocialLogin:bool
  showPasswordHint:bool
  hideLoginSuccessView:bool
  onAuthStateChange:Function
  onAuthError:Function
  lang:str
  locales:Object
  theme:str
}
```

### Tag Attributes

Tag attributes to add in the html tag:

``` 

- lang=en
- theme=dark|light
- view=login
- style-round-button
- show-signup-button
- show-forgot-password-button
- show-social-login
- hide-login-success-view
```

### Element method 

```
- async getUser()
- async isAuthenticated()
- async signout()
- async refreshAuthSession()
- showView(view:string)
- showUI(show:bool)
- on(eventName:String, callback:Function)

```

### Auth Events

```
- INITIALIZED
- SESSION_CHANGED
- SIGNED_IN
- SIGNED_OUT
- USER_UPDATED
```

### Views:

View to programmatically use

```
- login
- signup
- lost-password
- account
- edit-account
- change-email
- change-password
- change-profile-photo
```


### Slots

The AuthUI allows to inject a Header and a Footer

`slot="header"` or `slot="footer"`

#### - header

```html
  <singlebase-authui>
    <div slot="header">Acme Login</div>
  </singlebase-authui>
```

#### - footer

```html
  <singlebase-authui>
    <div slot="footer">Terms of Service - Privacy Policy</div>
  </singlebase-authui>
```


---

## Usage

To use the **Singlebase-AuthUI**, import `singlebase-js` and initialize the AuthUI using `initAuthUI()`.


### 1. Install @singlebase/singlebase-js

**NPM/Yarn Install / JS Module Install**

```js 

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

````js
<script type="module">
  import createClient  from 'https://cdn.jsdelivr.net/npm/@singlebase/singlebase-js/+esm'
</script>
````

### 3. Initialize AuthUI

```js 

const api_key = "your-api-key"
const singlebase = createClient({ api_key })

// config 
const authUIConfig = {
  lang: "en",
  theme: "dark",

  // callback function when login is successful
  onAuthStateChange: ({event, data}) => {
    switch(event) {

      //-- on initialization or when session is updated
      case "SESSION_CHANGED": 
        const user = data
        if (user && user?._key) {
          // your code here... 
          // update state ...
        }
        break 

      //-- when a new account is created
      case "ACCOUNT_CREATED": 
        const user = data
        if (user && user?._key) {
          // your code here... 
          // update state ...
        }
        break

      //-- when a user signs in
      case "SIGNED_IN": 
        const user = data
        if (user && user?._key) {
          // your code here... 
          // update state ...
        }
        break 

      //-- when a user signs out
      case "SIGNED_OUT":  
        // you code here...
        // clear state
        // data is null
        break 

      //-- when a user account is updated
      case "USER_UPDATED": 
        const user = data
        if (user && user?._key) {
          // your code here... 
          // update state ...
        }
        break
      
      default:
        break
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

```html
<html>

<body>

  <!-- include the tag -->
  <singlebase-authui></singlebase-authui>

</body>


```

or alternatively you can load the AuthUI lib manually, and add the `<singlebase-authui>`

```html
<!-- import the AuthUI library manually, type must be 'module' -->

<script type="module" src="https://cdn.jsdelivr.net/npm/@singlebase/singlebase-authui@latest/dist/index.js">

```


