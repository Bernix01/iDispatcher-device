import Vue from 'vue'
import Vuex from 'vuex'
import Device from './models/Device'
import Formula from './models/Formula'
import User from './models/User'
import { config } from './config'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    device: {} as Device,
    formula: {} as Formula,
    currentUser: {} as User,
    status: '',
    scale: '0',
    scaleOnline: false,
    rfidOnline: false,
    fillingStart: 0,
    fillComplete: false,
    filling: false,
    operationId: '',
    history: []
  },
  getters: {
    ready (state): boolean {
      return state.device && state.device.serial !== undefined && state.device.serial.length > 0
    },
    scaleReady (state): boolean {
      return parseFloat(state.scale) > config.scale.ready
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
      state.operationId = new Date().getMilliseconds().toString()
    },
    finishWork (state) {
      state.currentUser = {} as User
      state.filling = false
      state.fillingStart = 0
      state.operationId = ''
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
    },
    scale_status (state, status: boolean) {
      state.scaleOnline = status
    }
  },
  actions: {
    async initialize ({ commit }, deviceId) {
      commit('setupDevice', await Vue.$functions.httpsCallable('fetchDevice')({ duid: deviceId }))
      if (Vue.$fAuth.currentUser !== null) {
        await Vue.$fAuth.signOut()
      }
    },
    async report ({ commit, state }, action) {
      await Vue.$functions.httpsCallable('report')({
        duid: state.device.id,
        action: action,
        scale: state.scale,
        operationId: state.operationId
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
    async doMasterAuth ({ state, commit, dispatch }) {
      const user = new User('admin' + state.device.serial, '0000')
      commit('setUser', user)
      dispatch('report', 'login')
    },
    startFeed ({ state, commit, dispatch }) {
      if (!state.currentUser) return
      commit('set_feed_start')
      dispatch('report', 'fill_start')
    },
    HIO_SCALE ({ commit }, scale: string) {
      commit('setScale', scale)
    },
    async stopFeed ({ state, commit, dispatch }, reason: string) {
      if (!state.filling) return
      commit('stopFeed')
      dispatch('report', reason)
      await Vue.$fAuth.signOut()
      setTimeout(() => {
        commit('finishWork')
      }, 2000)
    },
    HIO_STATUS ({ commit }, data: any) {
      commit('scale_status', data.scale)
    },
    async HIO_LOGIN ({ dispatch }) {
      dispatch('doAuth', {
        email: 'test@email.com',
        password: 'test1234'
      })
    }
  }
})
