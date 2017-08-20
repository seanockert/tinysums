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

import Autosize from 'autosize'
Autosize(document.querySelector('textarea'))

import Prism from 'prismjs'
//import Codeflask from 'codeflask'

import VueClipboards from 'vue-clipboards'
Vue.use(VueClipboards)

// Init router
import VueRouter from 'vue-router'
Vue.use(VueRouter)

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