import 'neuets';
import Vue from 'vue'
import './plugins/fontawesome'
import App from './App.vue'

Vue.config.productionTip = false

export default ({ router, store }: any) => {
  return new Vue({
    router,
    store,
    render: h => h(App)
  });
}
