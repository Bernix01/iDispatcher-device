<template>
  <b-card title sub-title>
    <h2 v-if="scaleReady" >
      <font-awesome-icon icon="weight" />Garrafon listo
    </h2>
    <h2 v-if="!scaleReady" v-on:click="putGarrafon">
      <font-awesome-icon icon="weight"/>Garrafon no listo
    </h2>
    <h2 v-if="fillComplete" >
      <font-awesome-icon icon="check" />LLenado
    </h2>
    <h2 v-if="!fillComplete && scaleReady" v-on:click="fillGarrafon">
      <font-awesome-icon icon="check"/>LLenando...
    </h2>
  </b-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Formula from '@/models/Formula'

@Component
export default class UserCard extends Vue {
  @Prop() private scaleReady!: boolean
  @Prop() private fillComplete!: boolean

  putGarrafon () {
    this.$store.dispatch('HIO_SCALE', { scale: '1.3' })
  }

  fillGarrafon () {
    this.$store.dispatch('HIO_SCALE', { scale: '17.0' })
  }
}
</script>
<style lang="scss" scoped>
</style>
