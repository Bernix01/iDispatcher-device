import Vue from 'vue'
import Vuex from 'vuex'
import Device from './models/Device'
import Formula from './models/Formula'
import User from './models/User'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    device: {} as Device,
    formula: {} as Formula,
    currentUser: {} as User,
    status: '',
    scale: '0',
    fillingStart: 0,
    filling: false
  },
  getters: {
    ready (state): boolean {
      return state.device && state.device.serial !== undefined && state.device.serial.length > 0
    },
    scaleReady (state): boolean {
      return parseFloat(state.scale) > 120
    },
    fillComplete (state): boolean {
      return parseFloat(state.scale) >= state.formula.fillWeight
    }
  },
  mutations: {
    setupDevice (state, result: { data: { device: Device; formula: Formula } }) {
      state.device = result.data.device
      state.formula = result.data.formula
      state.status = result.data.formula.label
    },
    setUser (state, user: User) {
      state.currentUser = user
    },
    finishWork (state) {
      state.currentUser = {} as User
      state.filling = false
      state.fillingStart = 0
    },
    setScale (state, scale: string) {
      state.scale = scale
    },
    set_feed_start (state) {
      state.filling = true
      state.fillingStart = new Date().getMilliseconds()
    },
    stopFeed (state) {
      state.filling = false
    }
  },
  actions: {
    async initialize ({ commit }, deviceId) {
      commit('setupDevice', await Vue.$functions.httpsCallable('fetchDevice')({ duid: deviceId }))
      if (Vue.$fAuth.currentUser !== null) {
        commit('setUser', {
          name: Vue.$fAuth.currentUser.displayName,
          id: Vue.$fAuth.currentUser.uid
        })
      }
    },
    async report ({ commit, state }, action) {
      await Vue.$functions.httpsCallable('report')({
        duid: state.device.id,
        action: action
      })
    },
    async doAuth ({ commit, dispatch, state }, userdata: { email: string; password: string }) {
      if (state.currentUser && state.currentUser.name) {
        return
      }
      const userCredential = await Vue.$fAuth.signInWithEmailAndPassword(
        userdata.email,
        userdata.password
      )
      const user = new User(userCredential.user!.displayName!, userCredential.user!.uid)
      commit('setUser', user)
      dispatch('report', 'login')
    },
    startFeed ({ commit, dispatch }) {
      console.log('fill starts!')

      // ipcRenderer.send('faucet', true)
      commit('set_feed_start')
      dispatch('report', 'fill_start')
    },
    setScale ({ commit, dispatch, state }, scaledata: { scale: string }) {
      commit('setScale', scaledata.scale)
      const currWh = parseFloat(scaledata.scale)
      if (!state.currentUser.name) {
        return
      }
      if (currWh >= 120 && !state.filling) {
        dispatch('startFeed')
        return
      }
      if (currWh <= 120 && state.filling) {
        dispatch('stopFeed', 'fill_interrupted')
      }
      if (currWh >= state.formula.fillWeight && state.filling) {
        dispatch('stopFeed', 'fill_end')
      }
      if (
        new Date().getMilliseconds() - state.fillingStart > state.formula.fillTime &&
        state.filling
      ) {
        dispatch('stopFeed', 'fill_end')
      }
    },
    async stopFeed ({ commit, dispatch }, reason: string) {
      commit('stopFeed')
      // ipcRenderer.send('faucet', false)
      dispatch('report', reason)

      await Vue.$fAuth.signOut()
      commit('finishWork')
    }
  }
})
