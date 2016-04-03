'use strict';

const currates = require('./data');

module.exports = function(cb) {

  setImmediate(_=>{
    cb(null, currates);
  });
};