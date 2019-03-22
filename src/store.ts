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
    ready(state): boolean {
      return state.device && state.device.serial !== undefined && state.device.serial.length > 0
    },
    scaleReady(state): boolean {
      return parseFloat(state.scale) > config.scale.ready
    }
  },
  mutations: {
    setupDevice(state, result: { data: { device: Device; formula: Formula } }) {
      state.device = result.data.device
      state.formula = result.data.formula
      state.status = result.data.formula.label
    },
    setUser(state, user: User) {
      state.currentUser = user
      state.operationId = new Date().getMilliseconds().toString()
    },
    finishWork(state) {
      state.currentUser = {} as User
      state.filling = false
      state.fillingStart = 0
      state.operationId = ''
    },
    setScale(state, scale: string) {
      state.scale = scale
    },
    set_feed_start(state) {
      state.filling = true
      state.fillingStart = new Date().getMilliseconds()
    },
    stopFeed(state) {
      state.filling = false
    },
    scale_status(state, status: boolean) {
      state.scaleOnline = status
    },
    doHistory(state, reason: string) {
      (state.history as any[]).push({
        status: reason,
        who: state.currentUser.name
      })
    }
  },
  actions: {
    async initialize({ commit }, deviceId) {
      commit('setupDevice', await Vue.$functions.httpsCallable('fetchDevice')({ duid: deviceId }))
      if (Vue.$fAuth.currentUser !== null) {
        await Vue.$fAuth.signOut()
      }
    },
    async report({ commit, state }, action) {
      if (action === 'fill_end') commit('doHistory', 'Llenado completado')
      if (action === 'fill_interrupted') commit('doHistory', 'Llenado interrumpido')
      await Vue.$functions.httpsCallable('report')({
        duid: state.device.id,
        uid: state.currentUser.id,
        action: action,
        scale: state.scale,
        operationId: state.operationId
      })
    },
    async doAuth({ commit, dispatch, state }, uid: string) {
      if (state.currentUser && state.currentUser.name) {
        return
      }
      console.log('doAuth', uid)
      try {
        const { data } = await Vue.$functions.httpsCallable('doAuth')({
          uid: uid,
          duid: state.device.id
        })
        if (!data.success) return
        const { user } = data
        commit('setUser', new User(`${user.first_name} ${user.last_name}`, user.id))
        dispatch('report', 'login')
      } catch (error) {
        dispatch('doMasterAuth', uid)
      }
    },
    async doMasterAuth({ state, commit, dispatch }, uid: string) {
      if (uid !== '[245, 84, 158, 67, 124]') return
      const user = new User('supervisor-' + state.device.serial, '0000')
      commit('setUser', user)
      dispatch('report', 'login')
    },
    startFeed({ state, commit, dispatch }) {
      if (!state.currentUser) return
      commit('set_feed_start')
      dispatch('report', 'fill_start')
    },
    HIO_SCALE({ commit }, scale: string) {
      commit('setScale', scale)
    },
    async stopFeed({ state, commit, dispatch }, reason: string) {
      if (!state.filling) return
      commit('stopFeed')
      dispatch('report', reason)
      setTimeout(() => {
        commit('finishWork')
      }, 2000)
    },
    HIO_STATUS({ commit }, data: any) {
      commit('scale_status', data.scale)
    },
    async HIO_LOGIN({ dispatch }, uid: string) {
      console.log('SOCKET', uid)
      dispatch('doAuth', uid)
    }
  }
})
