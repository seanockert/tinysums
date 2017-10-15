import Vue from 'vue'
import App from './App.vue'
import Page from './components/Page.vue'

// Remove the 300ms delay from mobile
import Fastclick from 'fastclick'
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    Fastclick.attach(document.body)
  }, false)
}

var VueAutosize = require('vue-autosize')
Vue.use(VueAutosize)

//import VuePrism from 'vue-prism'
//Vue.use(VuePrism)

//import Prism from 'vue-prism-component'
//Vue.use(Prism)

//import Peg from '../src/parser.js'
//Page.use(Peg)

import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// Init router
import VueRouter from 'vue-router'
Vue.use(VueRouter)

// Init http requester
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

//console.log(window.location.pathname);
// Set up possible routes
const routes = [
  { path: '/', exact: true, name: 'page', component: Page },
  { path: '/:page', name: 'page', component: Page }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  linkActiveClass: 'active',
  transitionOnLoad: true,
  root: '/'
})

const app = new Vue({
  router,
  el: '#app',
  render: h => h(App)
})