<template>
  <div :data-id=page.id id="page">
    <div class="note">
      <textarea 
        :value="input" 
        @input="updateTextarea" 
        id="input" 
        v-autosize="input" 
        v-model="input" 
        autofocus
        >{{ input }}</textarea>
      <div id="output" class="output">
        <div class="item" v-for="(line, index) in output" :key="index">
          <a href="#" 
             title="Click to copy value" 
             v-clipboard:copy="line" 
             v-clipboard:success="copySuccess" 
             v-clipboard:error="copyError"
          >{{ line }}
          </a>
        </div>
      </div>
      <prism language="javascript" class="sh-input">{{ inputTemp }}</prism>
    </div>

    <div class="options">
      <div class="left">
        <select v-model="page.currency">
          <option v-for="currency in supportedCurrencies">{{ currency }}</option>
        </select>
      </div>    
      <div class="right">
        <button 
          class="button button-share" 
          v-clipboard:copy="rawOutput"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyError"
          title="Click to copy everything">
          Copy all
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// localStorage persistence
const STORAGE_KEY = 'tinysums'
const CURRENCY_KEY = STORAGE_KEY + '_currencies'
const debounce = require('lodash.debounce')

import Peg from '../parser.js'
import PrismJS from '../prism.min.js'
import Prism from 'vue-prism-component'


export default {
  name: 'page',
  data: function () {
    return {
      copyData: 'testing-copy',
      page: { 
        id: 0,
        title: '',
        currencySymbol: '$',
        currency: 'AUD'
      },
      input: '// Add up some stuff\r\ndays = 15\r\nfood: $12 * days\r\ntransport: $3.50 * days\r\n\r\nsum\r\n\r\n20kg plus 1900g\r\n$4000.22 at 3% pa\r\n32% off $429\r\nnow',
      inputTemp: '',
      currencies: '',
      supportedCurrencies: ['AUD', 'USD', 'CAD', 'GBP', 'EUR', 'JPY', 'THB', 'HKD', 'NZD', 'CHF', 'MXN', 'CNY'],
      // Full list
      //supportedCurrencies: ['AUD', 'BGN', 'BRL', 'CAD', 'CNY', 'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR', 'EUR'],
      output: [],
      rawOutput: [],
      store: []
    }  
  },  
  components: {
    Peg,
    Prism
  },
  created: function () {

    const data = this.fetchData(this.page.id) 
    if (data) {
      this.page.id = data.id
      this.input = data.input
      this.rawOutput = data.rawOutput
    }
    this.output = this.parseText(this.input)
    this.currencies = this.populateCurrencies()
    this.inputTemp = this.input

  },
  updated: function() {

  },
  watch: {
    // For updating Prism highlight
    input: function(val, oldVal){
      this.inputTemp = val
    }
  },
  computed: {
  },

  methods: {

    updateTextarea: debounce(function (e) {
      
      this.input = e.target.value
      this.input = e.target.value
      this.output = this.parseText(this.input)
      this.generateRawOutput(this.output)
      this.saveData()

    }, 300),
    parseText(input) {

      var output = this.output

      try {
        var parsed = Peg.parse(input)

        var i, output = [];
        
        for (i = 0; i < parsed.length; i++) { 
          //console.log('type:" + parsed[i].type);
          if (parsed[i].type == 'comment' || parsed[i].type == 'blank' || parsed[i].type == 'words' || parsed[i].value == '') {
            output.push('\n')
          } else {
            var line = parsed[i].value;
            
            if (typeof line === 'object' ) {
              var prefix = (line.prefix) ? line.prefix : '';
              var suffix = (line.suffix) ? line.suffix : '';
              line = line.value
            } else if (line) {
              var prefix = (parsed[i].prefix) ? parsed[i].prefix : '';
              var suffix = (parsed[i].suffix) ? parsed[i].suffix : '';
            }

            output.push(this.constructLine(line, prefix, suffix))
              
          }
        }

        return output  
      }
      catch(err) {
        console.log(err)
      }
      return output

    },

    constructLine(line, prefix, suffix) {

      if (suffix != 'currency') {
        if (prefix) {
          line = this.formatNumber(line, prefix)
        } else if (!isNaN(line)) {
          line = this.formatNumber(line, '', 0)
        }
      } else {
        if (prefix.toUpperCase() != this.page.currency) {
          var index = this.supportedCurrencies.indexOf(prefix.toUpperCase())
          if (index != -1) {
            var convertedVal = this.formatNumber(parseFloat(line)/this.currencies.rates[this.supportedCurrencies[index]], '')
            line = this.page.currency + this.page.currencySymbol + convertedVal
          }
        } else {
          line = this.formatNumber(line, '$', 2)
        }
      }
      
      if (!prefix && suffix) {
        line = line + suffix
      }
      return line

    },
    copySuccess(e) {
      console.log('Copied')
    },
    copyError(e) {
      console.log('Copy error')
    },
    copyItem(e) {
      console.log('Copy item')
    },
    formatNumber(n, prefix, c, d, t) {
      // Format currency
      // n = number
      // c = decimal places
      // d = decimal point
      // t = thousand separator
      var c = isNaN(c = Math.abs(c)) ? 2 : c, 
          d = d == undefined ? '.' : d, 
          t = t == undefined ? ',' : t, 
          prefix = prefix == undefined ? '$' : prefix, 
          s = n < 0 ? "-" : "", 
          i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
          j = (j = i.length) > 3 ? j % 3 : 0;
      
      return prefix + s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');

    },
    saveData: function() {

      //console.log('Save')

      if (this.input) {

        const saveData = { 
          id: this.page.id,
          input: this.input,
          rawOutput: this.rawOutput
        }

        if (this.store[this.page.id]) {
          this.store[this.page.id] = saveData
        } else {
          // A new board so push add it to the store array
          this.store.push(saveData)
        } 
        
        // Save as stringified array
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)) 
      }  
    },
    fetchData: function() {

      // Get the stored data from a cookie
      this.store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return this.store[0]

    },
    generateRawOutput(outputArray) {

      var inputArray = this.input.split('\n')
      var output = ''

      for(var i = 0; i < inputArray.length; ++i) {
        if (outputArray[i]) {
          if (outputArray[i] == '\n') {
            output += '\n'
          } else {
            output += inputArray[i] + ' = ' + outputArray[i] + '\n'
          }
          
        }
      } 
      this.rawOutput = output
      return output

    },
    populateCurrencies: function() {

      // Check for cookie
      console.log('Populate currencies')
      var currencies, storedCurrencies = JSON.parse(localStorage.getItem(CURRENCY_KEY))
      console.log(storedCurrencies)
      // If cookie doesn't exist then fetch latest currency data
      if (!storedCurrencies) {
        currencies = this.fetchCurrencies()
      } else {
        // Check the timestamp and update once per day
        var now = Math.round(new Date().getTime() / 1000)
        if (storedCurrencies.timestamp < (now - (24 * 3600))) {
          console.log('Older than a day so overwrite cookie')
          currencies = this.fetchCurrencies()
        } else {
          console.log('Data from cookie')
          currencies = storedCurrencies.data
        }        
      }
      return currencies

    },
    fetchCurrencies: function() {

      var currencies = this.axios.get('https://api.fixer.io/latest?base=' + this.page.currency).then((response) => {
        return response.data
      })
      // Used for testing
      var currencies = {"base":"AUD","date":"2017-04-10","rates":{"BGN":1.3851,"BRL":2.3495,"CAD":1.0025,"CHF":0.75652,"CNY":5.1715,"CZK":18.788,"DKK":5.2665,"GBP":0.60436,"HKD":5.8208,"HRK":5.2656,"HUF":220.5,"IDR":9949.0,"ILS":2.7433,"INR":48.365,"JPY":83.371,"KRW":855.67,"MXN":13.994,"MYR":3.3229,"NOK":6.4761,"NZD":1.0792,"PHP":37.176,"PLN":2.9955,"RON":3.1953,"RUB":42.849,"SEK":6.8058,"SGD":1.0538,"THB":25.958,"TRY":2.797,"USD":0.74915,"ZAR":10.405,"EUR":0.70822}}
      var now = Math.round(new Date().getTime() / 1000)
      // Set a cookie with this value
      localStorage.setItem(CURRENCY_KEY, JSON.stringify({ timestamp: now, data: currencies })) 
      return currencies

    }
  },
  filters: {
    pluralise: function (n) {
      return n === 1 ? 'item' : 'items'
    }
  },
  directives: {
    'text-focus': function (el, value) {
      if (value) el.focus()
    }
  }
}
</script>

<style lang="sass">
@import "../assets/scss/_variables.scss";

.note {
  max-width: 720px;
  min-height: 200px;
  //max-width: 100%;
  margin: 0 auto;
  position: relative;
}  

header {
  padding: $base-padding*2 $base-padding;
  
  h2 {
    color: #fafafa;
    margin: 0;
    font-size: $font-size-medium;
    font-weight: 800;
    text-transform: uppercase;
    background-color: $color-teal;
    border-radius: 2px;
    padding: 5px 8px;
    padding-top: 7px;
    line-height: 1;
    display: inline-block;
    float: left;
    margin-top: -5px;
    
    em {
      font-weight: 400;
      font-style: normal;
    }
  }
 
  small {
    color: $color-light-text;
    font-size: 0.875em;
    display: inline-block;
    margin-left: 0;
  }   
}

textarea {
  margin: 0;
  border: 0;
  height: inherit;
  width: 100%;
  min-height: calc(100vh - 125px);
  background-color: transparent;
  font-color: transparent;
  outline: none;
  resize: none;
  z-index: 1;
  opacity: 0.4;
  outline: none;
  color: #000;
}

textarea, 
.output,
.sh-input {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
  line-height: 1.5;
  text-align: left;
  padding: $base-padding;
  padding-top: 0;
}

textarea, 
.sh-input {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.output {
  position: absolute;
  width: 30%;
  top: 0;
  right: 0;
  border-left: 1px solid #ddd;
  color: $color-teal;
  height: inherit;
}

.sh-input {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  pointer-events: none;
  overflow-y: auto;
  z-index: 3;

  code {
    font-size: inherit;
    font-family: inherit;
    color: inherit;
    display: block;
  }
}

.item {
  white-space: nowrap;
  display: block;
  width: 100%;
  
  a {
    white-space: nowrap;
    text-decoration: none;
    display: inline-block;
    padding: 0 $base-padding/2;
    border-radius: 30px;
    transition: all 0.15s ease-out;
    
    &:hover {
      color: #fff;
      background-color: $color-teal
    }
    
    &:focus {
      outline: none;
    }

    &:active {
      background-color: darken($color-teal, 10%)
    }
  }
}

.options {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: $base-padding*2;
  
  
  select {
    border: 1px solid #ddd;
    padding: 12px;
  }
}

.right { float: right }
.left { float: left }


@media (min-width: 560px) {
  header {
    padding: $base-padding*2;
  }

  textarea, 
  .output,
  .sh-input {
    font-size: 1.2em;
    line-height: 1.5;
    padding: $base-padding*2;
  }
}



</style>
