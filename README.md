# Singlebase-AuthUI

A universal AuthUI component for authenticating users. 

It uses HTML custom element to be included in any pages and frameworks. 


## Tag

`<singlebase-authui>`

```
<singlebase-authui></singlebase-authui>
```

### Config

```
{
  styleRoundButton:bool 
  showBackButton:bool
  showSignupButton:bool
  showForgotPassword:bool
  showSocialLogin:bool
  showPasswordHint:bool
  signinRedirectUrl:str
  signinCallback:Function
  locale:str,
  locales:Object
}
```

### Tag Attributes
```
- entry-point:
- locale
- theme
- style-round-button
- show-back-button
- show-signup-button
- show-forgot-password-button
- show-social-login
```

### Slots

#### slot=header

```
  <singlebase-authui>
    <div slot="header">Acme Login</div>
  </singlebase-authui>
```

#### slot=footer

```
  <singlebase-authui>
    <div slot="footer">Terms of Service - Privacy Policy</div>
  </singlebase-authui>
```


---

## Usage


### 1. Setup @singlebase/singlebase-js client

#### NPM/Yarn Install

```
# npm
npm install @singlebase/singlebase-js 

# yarn
yarn add @singlebase/singlebase-js 

```

#### Import 

```
import createClient from '@singlebase/singlebase-js'
```

or JS Module

````
<script type="module">
  import createClient  from 'https://cdn.jsdelivr.net/npm/@singlebase/singlebase-js/+esm'

</script>
````

#### Instantiate client 

```
const singlebase = createClient({api_key: '...'})

singlebase.initAuthUI({
  
})

```


#### Import in HTML

```
<html>

<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@singlebase/singlebase-authui">
</head>

<body>

  <singlebase-authui></singlebase-authui>

</body>

```


