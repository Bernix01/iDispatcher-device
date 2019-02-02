<template>
  <div class="screen h-100 w-100">
    <h1>Sin conexión.</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({})
export default class SplashScreen extends Vue {}
</script>

<style lang="scss" scoped>
.screen {
  background-color: #c3c3c3;
  color: white;
  position: absolute;
  z-index: 4;
  h1{
    padding-top: 50vh;
    text-align: center;
  }
}

</style>
