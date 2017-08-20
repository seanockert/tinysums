<template>
  <div id="app">
    <header>
      <h2><em>Tiny</em>Sums</h2> <!--<small> Make quick calculations.</small>-->
      <button class="button right" @click="show = !show">Help</button>
      
    </header>
    <transition :name="transitionName" mode="out-in">
      <router-view :key="key"></router-view>
    </transition>
    
    <off-canvas v-model="show" align="right" :width="380" :duration=".3" effect="ease-in-out" @sidebarWasClosed="show = $event">
      <div class="help">
        <h2>Here's what you can do.</h2>
        <button class="button close" @click="show = false">&times;</button>
        
        <ul class="no-list">
          <li>
            <h3>Simple calculations</h3>
            <p>Use + (plus), - (minus), * (times) and / (divided by). Use brackets for order-of operations</p>
            <div><span>2+3*8</span> <em>26</em><br>
            <span>5 divided by 3 times (6 plus 2)</span> <em>13</em></div>
          </li>
          <li>
            <h3>Money</h3>
            <p>Defaults to $ and rounds to 2 decimal places. Accepts K (thousand) and M (million) suffix</p>
            <div><span>$40 /1.4</span> <em>$28.57</em></div>
          </li>
          <li>
            <h3>Constants and Variables</h3>
            <p>Constant: give a value a label to use it in calculations. Use '=' sign. You must set a constant or variable before using it.</p>
            <div><span>Days = 7</span> <em>7</em><br>
            <span>$25 * Days</span> <em>$175</em></div>
            
            <p>Variable: like constants but are included in the Sum (see below). Use ':' or 'is'. Variables are case-sensitive.</p>
            <div><span>Transport: $120</span> <em>$120</em><br>
            <span>Food is $64</span> <em>$64</em><br>
            <span>Transport + Food</span> <em>$184</em></div>
          </li>
          <li>
            <h3>Sum</h3>
            <p>Add up all the values above until an empty line. Ignores Constants</p>
            <div><span>$10</span> <em>$10</em><br>
            <span>Transport: $120</span> <em>$120</em><br>
            <span>Food: $64</span> <em>$64</em><br>
            <span>sum</span> <em>$194</em></div>
          </li>
          <li>
            <h3>Percentages</h3>
            <p>Use 'of', 'off' and 'on'. TODO: fix error when % added in calculations</p>
            <div><span>10% of $120</span> <em>$12</em><br>
            <span>10% off $120</span> <em>$108</em><br>
            <span>10% on $120</span> <em>$132</em></div>
          </li>
          <li>
            <h3>Comments</h3>
            <p>Add a comment or stop a line from being calculated</p>
            <div><span>// This is a comment</span> <em>&nbsp;</em><br>
            <div><span>"This is another comment"</span> <em>&nbsp;</em></div>
          </li>
          <li>
            <h3>Convert currency</h3>
            <p>Convert another currency to your base currency TODO: base currency selector and make this work</p>
            <div><span>USD150</span> <em>$200</em></div>
          </li>
          <li>
            <h3>Quantities</h3>
            <p>Add quantifiers to numbers: mg, g, kg. ml, l. mm, cm, m, km. b, kb, mb. m. ft. TODO: fix calculation between units</p>
            <div><span>200g + 2kg</span> <em>2.2kg</em></div>
          </li>
          <li>
            <h3>Time</h3>
            <p>Gets the current date and time. TODO: allow adding/subtracting days</p>
            <div><span>now</span> <em>11/6/2017 9:49 pm</em><br>
            <span>today</span> <em>11/6/2017 9:49 pm</em></div>
          </li>
          <li>
            <h3>Compound interest</h3>
            <p>For bank/share interest. Compounds monthly</p>
            <div><span>$2000 at 3%pa</span> <em>$2060.83</em></div>
          </li>
          <li>
            <h3>Date ranges</h3>
            <p>Calculate days between ranges. COMING SOON</p>
            <div><span>today to 20/10/2018</span> <em>asd</em></div>
          </li>
        </ul> 
         
      </div>
    </off-canvas>
  </div>
</template>

<script>
import offCanvas from 'vue-offcanvas-simple/src/SidebarOffCanvas.vue'

export default {
  name: 'app',
  data () {
    return {
      title: 'Tiny Sums',
      transitionName: 'fade',
      show: false
    }
  },
  components: {
    offCanvas
  },
  computed: {
    // Provide a key for the router so the transition will change 
    // between the same view eg. /hello/a and hello/b
    // To transition all pages the same just use :key="$route.fullPath"  
    key () { 
      if (this.$route.name == 'page') { 
        return this.$route.name 
      } else { 
        return this.$route.fullPath 
      } 
    } 
  } 
}
</script>

<style lang="sass">
@import "./assets/scss/_reset.scss";
@import "./assets/scss/_variables.scss";
@import "./assets/scss/_codeflask.scss";
@import "./assets/scss/_prism.scss";
@import "./assets/scss/_help.scss";

*, *:before, *:after {
  box-sizing: border-box
}

html {
  padding: 0;
  color: #515151;
  background-color: #f9f9f9;
}

html, body, #app {
  height: 100%;
}

#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $color-dark-blue;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
  
  li {
    display: inline-block;
    margin: 0 10px;
  }
}

a {
  color: $color-teal;
  text-decoration: none;
  transition: all 0.15s ease-out;
}

.button {
  color: $color-teal;
  text-decoration: none;
  display: inline-block;
  padding: $base-padding/2 $base-padding;
  line-height: 1;
  border: 1px solid #ddd;
  text-transform: uppercase;
  font-size: 0.85em;
  border-radius: 2px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  transition: all 0.15s ease-out;

  &:hover {
    color: #fff;
    background-color: $color-teal;
    border-color: $color-teal;
  }
    
  &.close {
    position: absolute;
    top: 0;
    right: 0;
    padding: $base-padding $base-padding*2;
    border: none;
    font-size: 1.6em;
    color: $color-light-text;
    line-height: 1;
    
    &:hover {
      background: transparent;
      color: $color-dark-blue;
    }
  }
} 
</style>
