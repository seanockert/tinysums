<template>
  <div :data-id=page.id id="page">
    <div class="note">
      <textarea :value="input" @input="update" id="input"></textarea>
      <div id="output" class="output" v-html="compiledText">
    </div>

    <div class="options">
      <div class="left">
        <!--<button class="button" @click="changeCurrency()">{{ page.currency }}</button>-->
        <select v-model="page.currency">
          <option v-for="currency in supportedCurrencies">{{ currency }}</option>
        </select>
      </div>    
      <div class="right">
        <button class="button" @click="copyAll()">Share &rarr;</button>
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


//const peg = require("pegjs");
//var parser = peg.generate("start = ('a' / 'b')+");

export default {
  name: 'page',
  data: function () {
    return {
      copyData: 'your mum',
      page: { 
        id: 0,
        title: '',
        currencySymbol: '$',
        currency: 'AUD'
      },
      input: '// Add up some stuff\r\ndays = 15\r\nfood: $12 * days\r\ntransport: $3.50 * days\r\n\r\nsum\r\n\r\n20kg plus 1900g\r\n$4000.22 at 3% pa\r\n32% off $429\r\nnow',
      currencies: '',
      supportedCurrencies: ['AUD', 'USD', 'CAD', 'GBP', 'EUR', 'JPY', 'THB', 'HKD', 'NZD', 'CHF', 'MXN', 'CNY'],
      //supportedCurrencies: ['AUD', 'BGN', 'BRL', 'CAD', 'CNY', 'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR', 'EUR'],
      output: [],
      store: []
    }  
  },  
  created: function () {
    const data = this.fetchData(this.page.id) 
    if (data) {
      this.page.id = data.id
      this.input = data.input
    }
    
    this.currencies = this.populateCurrencies()
  },
  watch: {

  },
  computed: {
    compiledText: function () {
      return this.parseText(this.input)
    }  
  },
  methods: {
    update: debounce(function (e) {
      this.input = e.target.value
    }, 300),
    parseText(input) {
      var currentOutput = this.output
      try {
        var parsed = Peg.parse(input)

        var i, output = '';
        
        for (i = 0; i < parsed.length; i++) { 
          console.log(parsed[i].type);
          if (parsed[i].type == 'comment' || parsed[i].type == 'blank' || parsed[i].type == 'words' || parsed[i].value == '') {
            output += '<div class="item empty">&nbsp;</div>'
          } else {
            var line = parsed[i].value;
            
            if (typeof line === 'object' ) {
              var prefix = (line.prefix) ? line.prefix : '';
              var suffix = (line.suffix) ? line.suffix : '';
              output += this.wrapLine(line.value, prefix, suffix)
            } else if (line) {
              var prefix = (parsed[i].prefix) ? parsed[i].prefix : '';
              var suffix = (parsed[i].suffix) ? parsed[i].suffix : '';
              output += this.wrapLine(line, prefix, suffix)
            } 
          }
        }
        this.output = output
        this.saveData()
        return output  
      }
      catch(err) {
        console.log(err)
      }
      return currentOutput
    },
    wrapLine(line, prefix, suffix) {

      if (suffix != 'currency') {
        if (prefix) {
          line = this.formatNumber(line, prefix)
        } else if (!isNaN(line)) {
          line = this.formatNumber(line, '', 0)
        }
      } else {
        var index = this.supportedCurrencies.indexOf(prefix.toUpperCase())
        if (index != -1) {
          var convertedVal = this.formatNumber(parseFloat(line)/this.currencies.rates[this.supportedCurrencies[index]], '')
          line = this.page.currencySymbol + convertedVal
        }
      }
      
      if (!prefix && suffix) {
        line = line + suffix
      }
      return '<div class="item"><a href="#" title="Click to copy value" v-clipboard="copyData" @success="copySuccess" @error="copyError">' + line + '</a></div>'
    },
    copySuccess(e) {
      console.log('Copied');
    },
    copyError(e) {
      console.log('Copy error');
    },
    copyAll(e) {
      console.log('Copy all');
    },
    changeCurrency(e) {
      this.page.currency = 'USD'
    },
    formatNumber(n, prefix, c, d, t) {
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
      console.log('save')
      
      if (this.input) {
        const saveData = { 
          id: this.page.id,
          input: this.input
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
      this.store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return this.store[0]
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
      // var currencies = $http.JSON(https://api.fixer.io/latest?base=this.page.currency) ...
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
  margin: 0 auto;
  position: relative;
}  

header {
  padding: $base-padding*2;
  
  h2 {
    color: #fafafa;
    margin: 0;
    font-size: $font-size-medium;
    font-weight: 800;
    text-transform: uppercase;
    background-color: $color-teal;
    border-radius: 2px;
    padding: 5px 8px;
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


.note {
  border-radius: 6px;
  min-height: 200px;
  margin: $base-padding*2 auto;
}

textarea {
  margin: 0;
  border: 0;
  height: inherit;
  width: 100%;
  min-height: 400px;
  background-color: transparent;
  outline: none;
  resize: none;
}

textarea, 
.output {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
  line-height: 1.5;
  text-align: left;
  padding: $base-padding*2;
  padding-top: 0;
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
    
    &:hover, &:focus {
      color: #fff;
      background-color: $color-teal
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
  
  
}

.right { float: right }
.left { float: left }


@media (min-width: 560px) {
  textarea, 
  .output {
    font-size: 1.2em;
    line-height: 1.5;
  }
}

</style>
