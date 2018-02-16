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

if(/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  document.documentElement.className += ' ios';
}

// Auto resize textarea
var VueAutosize = require('vue-autosize')
Vue.use(VueAutosize)

// Copy to clipboard
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// Keyboard shortcuts
import VueShortkey from "vue-shortkey";
Vue.use(VueShortkey);

// Init router
import VueRouter from 'vue-router'
Vue.use(VueRouter)

// Init http requester
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

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

// Init app
const app = new Vue({
  router,
  el: '#app',
  render: h => h(App)
})