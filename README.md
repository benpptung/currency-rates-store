A storage bot to sync exchange rates with any exchange rates api

# Example

```
const CurrStore = require('currency-rates-store');
const pull = require('currency-restapi-currencylayer').Live('YOUR_ACCESS_KEY');


// Default on `USD`, and 3 hours between requests
var store = CurrStore({pull: pull});


// CurrencyRatesStore is an EventEmitter, 
['error', 'warn', 'info'].forEach(lv=> store.on(lv, e=> console.log(e)));


store.on('load', store=>{

  // convert €100 EUR to USD 
  console.log(store.convert(100).from('EUR').to('USD'));
  
  // convert € 1 EUR to USD
  console.log(store.from('EUR').to('CAD'));
  
  // or skip `.from()`, if the `store.base` is `USD`
  console.log(store.convert(100).to('EUR'));
  
  // simply pass the pair
  console.log(store.pair('EURUSD'));
  
  // or pass the symbol one by one
  console.log(store.rate('USD', 'EUR'));
  
  // same as above, if the exchange rates storage is based on `USD`
  console.log(store.rate('EUR'));
  

});
```

# Options

- `pull`: An async function. it should callback the latest rates in the following structure. Usually, it wraps exchange rates sites api. Following are modules designed for `currency-rates-store`

  - [currency-restapi-currencylayer](https://www.npmjs.com/package/currency-restapi-currencylayer)
  - [currency-restapi-openexchange](https://www.npmjs.com/package/currency-restapi-openexchange)
  
- `base`: 'USD|EUR|GBP...'. which currency this rates should be based on. Default: USD 
- `wait`: refresh in milliseconds. Default to `3 hours` between refreshs. minimum 10 minutes. However, if any error occurred from `pull` callback, it will use `util-retry` to retry the `pull` 3 times. 


```
{
  base: 'USD|EUR|GBP'   - tell which currency this rates is based on
  rates: {
    USD: 1,             - If base == 'USD', this value should be 1
    GBP: ...
    EUR: ...
    ...
  },
  ts: {Milliseconds}
}
``` 


## Event: 'load'

  `function (store) {  }`
  Emitted when the first valid rates is recieved

## Event: 'error'

  `function (error) { }`
  
  See source code

## Event: 'warn'


   `function (msg) {}`

   Emitted when the received rates is based on another currency which is different from `base` property configured on this store. A rebase calculation will happen, and emit this `warning`.

## Event: 'info'

   `function (info) {}`
   Emitted for logging purpose.