'use strict';

module.exports = function(rates, base) {
  base = rates[base];

  var _rates = {};

  Object.keys(rates).forEach(currcode=> {
    let rate = rates[currcode];
    _rates[currcode] = rate / base;
  });

  return _rates;
};