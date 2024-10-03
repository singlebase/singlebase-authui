## SINGLEBASE-AUTH-UI

```
<singlebase-auth-ui></singlebase-auth-ui> 
```

Views:

Account authentication and registration:

- Login 
- Signup
- Lost password

Account management:

- Change Email
- Change Password 
- Account Info
- Update Profile
  - Display Name
  - First Name 
  - last Name 
  - Phone Number 
- Update Profile Photo

Sub Views:
- OTP
- Login Success


To do:
- Styling
  - flat
  - widget: p-8 (default)
  - theme
    - light (slate-100)
    - dark (slate-900)
  
  - text-primary (ie: heading)
  - text-secondary (ie: subheading)
  - text-accent 
  - button-primary
  - button-secondary
  - button-accent

### Tech

- Require singlebase.js
- singlebase.initAuth({ options })
- Data will temporary stay in browser window
- Use Symbol to hold instance (singlebaseauth)
- The Auth-UI relies on the data 
- LocalStorage to persist data

### Icon SVG 

https://github.com/edent/SuperTinyIcons