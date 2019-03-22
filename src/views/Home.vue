<template>
  <b-container class="cnt" fluid>
    <b-row class="status p-3 mb-4" :class="{'offline': isOffline}">
      <b-col>
        <h1>Holcim {{isOffline ? "(offline)":""}}</h1>
        <h4>
          <small>{{time}}</small>
        </h4>
      </b-col>
      <b-col
        class="text-right"
        :class="{'text-danger': !scaleOnline}"
      >Balanza: {{scaleOnline ? "sí" : "no"}}</b-col>
    </b-row>
    <b-row>
      <b-col sm="3">
        <b-card
          :sub-title="device.serial"
          :title="'Sirve: ' + (formula ? formula.label: 'SIN SERVICIO')"
        ></b-card>
        <br>
        <b-card title="Historial">
          <div v-for="(i, hit) of history" :key="i">
            <h5>{{hit.status}}</h5>
            <h6>{{hit.who}}</h6>
          </div>
        </b-card>
      </b-col>
      <b-col class="text-center">
        <b-card :title="status" title-tag="h1" :sub-title="username">
          <font-awesome-icon :icon="icon" size="lg" v-on:click="goToNext"/>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import UserCard from '@/components/UserCard.vue' // @ is an alias to /src
import StatusCard from '@/components/StatusCard.vue' // @ is an alias to /src
import { State, Getter } from 'vuex-class'
import User from '@/models/User'
import Formula from '@/models/Formula'
import Device from '@/models/Device'
import { config } from '@/config'

@Component({
  components: {
    UserCard,
    StatusCard
  }
})
export default class Home extends Vue {
  @State currentUser!: User
  @State formula!: Formula
  @State device!: Device
  @State scale!: string
  @State filling!: boolean
  @State fillingStart!: number
  @State history!: { status: string; who: string }[]
  @State scaleOnline!: boolean
  @Getter scaleReady!: boolean
  @Getter fillComplete!: boolean

  private interrupted = false
  private time: string = ''
  private interval!: number
  mounted () {
    this.interval = setInterval(this.updateDateTime, 1000)
  }
  get username () {
    return this.userLoggedIn ? this.currentUser.name : ''
  }

  updateDateTime () {
    if (!this.scaleOnline) this.$socket.emit('RECONNECT_SCALE')
    const date = new Date()
    this.time = `${date.toDateString()} ${date.toTimeString()}`
  }

  get userLoggedIn () {
    return this.currentUser && this.currentUser.name
  }

  beforeDestroy () {
    clearInterval(this.interval)
  }

  get status () {
    if (!this.userLoggedIn) return 'Pase identificación'
    else if (!this.scaleReady) return 'Coloque el garrafón'
    else {
      if (this.fillComplete) return 'Llenado completado.'
      if (!this.fillComplete && this.filling) return 'Llenando...'
      if (this.interrupted) return 'Llenado interrumpido.'
      return 'Llenado completado.'
    }
  }

  get icon () {
    if (!this.userLoggedIn) return 'id-card'
    else if (!this.scaleReady) return 'arrow-down'
    else {
      if (this.fillComplete) return 'check'
      if (!this.fillComplete && this.filling) return 'shower'
      if (this.interrupted) return 'times-o'
      return 'check'
    }
  }

  doLogin () {
    this.$store.dispatch('doMasterAuth')
  }

  @Watch('scale')
  onScaleChange (val: string, oldVal: string) {
    const currWh = parseFloat(val)
    if (!this.userLoggedIn) {
      return
    }

    if (currWh >= config.scale.ready && !this.filling) {
      this.$socket.emit('facuet', true)
      this.$store.dispatch('startFeed')
      setTimeout(
        (socket: any, store: any) => {
          socket.emit('facuet', false)
          store.dispatch('stopFeed', 'fill_end')
        },
        this.formula.fillTime,
        this.$socket,
        this.$store
      )
      return
    }
    if (currWh <= config.scale.ready && this.filling) {
      this.$socket.emit('facuet', false)
      this.interrupted = true
      this.$store.dispatch('stopFeed', 'fill_interrupted')
    }
    if (currWh >= this.formula.fillWeight && this.filling) {
      this.$socket.emit('facuet', false)
      this.$store.dispatch('stopFeed', 'fill_end')
    }
    if (new Date().getMilliseconds() - this.fillingStart > this.formula.fillTime && this.filling) {
      this.$socket.emit('facuet', false)
      this.$store.dispatch('stopFeed', 'fill_end')
    }
  }

  put () {
    this.$store.dispatch('HIO_SCALE', '1.3')
  }

  fill () {
    this.$store.dispatch('HIO_SCALE', '17.0')
  }

  goToNext () {
    if (!this.userLoggedIn) this.doLogin()
    else if (!this.scaleReady) this.put()
    else this.fill()
  }
}
</script>

<style lang="scss" scoped>
.cnt {
  height: 100vh;
  .status {
    color: white;

    &.offline {
      background-color: #d67714;
      .text-danger {
        color: #d80600 !important;
      }
    }
  }

  .fa-lg {
    font-size: 20rem;
  }
}

</style>
