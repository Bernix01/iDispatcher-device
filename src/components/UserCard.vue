<template>
  <b-card class="justify-content-center">
    <b-img :src="`${baseUrl}logo.png`" fluid-grow alt/>
    <h1>{{user.name}}</h1>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import User from '@/models/User'

@Component
export default class UserCard extends Vue {
  @Prop() private user!: User
  h (x: string) {
    var A = 31
    var h = 0
    for (var i = 0; i < x.length; ++i) {
      h = h * A + x[i].charCodeAt(0)
    }
    return h.toString(16).slice(0, 14) + '' + h.toString(16)[0]
  }

  get pimage () {
    // const image = identicon(this.h(this.user.id), 420)
    return 'adasd.png'
  }

  get baseUrl () {
    return process.env.BASE_URL
  }
}
</script>
<style lang="scss" scoped>
</style>
