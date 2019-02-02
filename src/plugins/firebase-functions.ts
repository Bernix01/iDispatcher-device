import Vue, { PluginObject } from 'vue'
import { config as cfg } from '../config'

import firebase from '@firebase/app'
import '@firebase/functions'
import '@firebase/auth'
import { FirebaseAuth } from '@firebase/auth-types'

const app = firebase.initializeApp(cfg.firebase)

const _functions = app.functions!()
const _fAuth = app.auth!() as FirebaseAuth
// if (process.env.NODE_ENV === 'development') {
//   _functions.useFunctionsEmulator('http://localhost:5000')
// }
const Plugin: PluginObject<any> = {
  install: Vue => {
    Vue.$functions = _functions
    Vue.$fAuth = _fAuth
  }
}
Plugin.install = Vue => {
  Vue.$functions = _functions
  window.functions = _functions
  Vue.$fAuth = _fAuth
  window.fAuth = _fAuth
  Object.defineProperties(Vue.prototype, {
    $functions: {
      get () {
        return _functions
      }
    },
    $fAuth: {
      get () {
        return _fAuth
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
