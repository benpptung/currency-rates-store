'use strict';

const minReqWait = require('../config').minReqWait;

exports.reqWait = function(wait) {
  wait = parseInt(wait);
  if (!wait || wait < minReqWait) wait = minReqWait;
  return wait;
};

exports.parsePair = function(pair) {
  if (typeof pair != 'string') return false;
  if (pair.length != 6) return false;
  pair = pair.toUpperCase();
  return {from: pair.substr(0, 3), to: pair.substr(3)}
};