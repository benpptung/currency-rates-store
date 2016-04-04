A storage bot to sync exchange rates with any exchange rates api

# Example

```
const CurrStore = require('currency-rates-store');
const pull = require('currency-restapi-openexchangerates').Latest('YOUR_APP_ID');

var store = CurrStore({pull: pull});

  // CurrencyRatesStore is an EventEmitter, 
  // log error, warn, info events
['error', 'warn', 'info'].forEach(lv=> store.on(lv, e=> console.log(e);));

store.on('load', store=>{

  // convert €100 EUR to USD 
  console.log(store.convert(100).from('EUR').to('USD'));
  
  // convert € 1 EUR to USD
  console.log(store.from('EUR').to('CAD'));
  
  // simply pass the pair
  console.log(store.pair('EURUSD'));
  
  // or pass the symbol one by one
  console.log(store.rate('USD', 'EUR'));
  
  // same as above, if the pull restapi request is based on `USD`
  console.log(store.rate('EUR'));
  

});
```

# Options

- `wait`: milliseconds, default to 3 hours per request. minimum 10 minutes.
- `pull`: restapi wrapper. node.js style callback. it should callback the latest rates in the following structure

```
{
  base: 'USD|EUR|GBP'   - after `loaded` event, this property is ignored
  rates: {
    USD: 1,  
    GBP: ...
    EUR: ...
    ...
  }
}
``` 
