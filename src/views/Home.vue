<template>
  <b-container class="cnt" fluid>
    <b-card-group class="h-100 py-3" deck>
      <b-card class="ph" v-if="currentUser.name === undefined" title="Pase identificación" />
      <UserCard v-bind:user="currentUser" v-if="currentUser && currentUser.name" />
      <StatusCard
        v-bind:scaleReady="scaleReady"
        v-bind:fillComplete="fillComplete"
        v-if="currentUser && currentUser.name"
      />
    </b-card-group>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserCard from '@/components/UserCard.vue' // @ is an alias to /src
import StatusCard from '@/components/StatusCard.vue' // @ is an alias to /src
import { State, Getter } from 'vuex-class'
import User from '@/models/User'
import Formula from '@/models/Formula'
// import { ipcRenderer } from 'electron'

@Component({
  components: {
    UserCard,
    StatusCard
  }
})
export default class Home extends Vue {
  @State currentUser!: User
  @State formula!: Formula
  @Getter scaleReady!: boolean
  @Getter fillComplete!: boolean
  created () {
    console.log('connecting...')
    // ipcRenderer.on('loginData', (event: any, data: string) => {
    //   console.log(data)
    //   // do some parsing of data string and dispatch auth
    //   this.$store.dispatch('doAuth', {
    //     email: 'test@email.com',
    //     password: 'test1234'
    //   })
    // })
    // ipcRenderer.on('scaleData', (event: any, data: string) => {
    //   // do some parsing of data string and dispatch auth
    //   this.$store.dispatch('setScale', {
    //     scale: data
    //   })
    // })
  }
}
</script>

<style lang="scss" scoped>
.cnt {
  height: calc(100vh - 72px);
}
.ph {
  .card-body {
    display: flex;
    -ms-flex-align: center !important;
    -webkit-box-align: center !important;
    align-items: center !important;
    -ms-flex-pack: center !important;
    -webkit-box-pack: center !important;
    justify-content: center !important;
    .card-title {
      font-size: 4rem;
    }
  }
}
</style>
