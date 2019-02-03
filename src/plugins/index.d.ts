import Vue, { VueConstructor } from 'vue'
import { AxiosInstance } from 'axios'
import { FirebaseFunctions   } from '@firebase/functions-types'
import { FirebaseAuth  } from '@firebase/auth-types'

declare global {
  interface Window {
    axios: AxiosInstance
    socket: any
    functions: FirebaseFunctions
    fAuth: FirebaseAuth
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosInstance
    $socket: any
    $functions: FirebaseFunctions
    $fAuth: FirebaseAuth
  }
  interface VueConstructor {
    $socket: any
    $axios: AxiosInstance
    $functions: FirebaseFunctions
    $fAuth: FirebaseAuth
  }
}
