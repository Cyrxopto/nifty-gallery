import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.config.productionTip = false
Vue.use(VueAxios, axios)

// import * as Web3 from 'web3'
// import { OpenSeaPort, Network } from 'opensea-js'

// // This example provider won't let you make transactions, only read-only calls:
// const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

// const seaport = new OpenSeaPort(provider, {
//   networkName: Network.Main
// })

import { ethers } from "ethers"

window.eth = {
  ethers: ethers,
}
// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
window.eth.provider = new window.eth.ethers.providers.Web3Provider(window.ethereum)

// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
window.eth.signer = window.eth.provider.getSigner()

new Vue({
  render: h => h(App),
}).$mount('#app')
