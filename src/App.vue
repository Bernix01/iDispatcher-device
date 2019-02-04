<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
html,
body {
  height: 100vh;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.navbar-text {
  font-size: 2rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { config } from '@/config'
import SplashScreen from '@/components/SplashScreen.vue'
import OfflineScreen from '@/components/OfflineScreen.vue'
@Component({
  components: { SplashScreen, OfflineScreen }
})
export default class App extends Vue {
  @State status!: string
  @State filling!: boolean
  @State fillingStart!: number
  @State(state => state.formula.fillTime) fillTime!: number

  private interval!: any

  mounted () {
    this.$store.dispatch('initialize', config.deviceId)
    this.$socket.emit('status')
  }

  get ready (): boolean {
    return this.$store.getters.ready
  }
  doLogin () {
    this.$store.dispatch('doAuth', {
      email: 'test@email.com',
      password: 'test1234'
    })
  }
}
</script>
