'use strict';

const lib = 'currency-rates-store:lib';
const debug = require('debug')(lib);
const EventEmitter = require('component-emitter');
const retry = require('util-retry');
const reqWait = require('./_util').reqWait;
const parse = require('./_util').parsePair;
const systime = require('./_util-systime').systime;
const isUnsignNum = require('./_util-is-unsign-num');
const rebase = require('./_util-rebase');

EventEmitter(CurrencyRatesStore.prototype);
module.exports = CurrencyRatesStore;

/**
 *
 * // options
 * {
 *    pull  : {Function}   - callback to provide rates
 *   [wait] : {UnsignInt}  - milliseconds to wait for next tick, default 3 hours
 *   [base] : 'USD|GBP|EUR|CAD|AUD|TWD' - base currency
 * }
 *
 *
 * @param options
 * @returns {CurrencyRatesStore}
 * @constructor
 */

function CurrencyRatesStore(options) {
  if (this instanceof CurrencyRatesStore !== true) return new CurrencyRatesStore(options);


  /**
   * @public properties
   */
  this.ts = null;
  this.rates = null;
  this.base = options.base || 'USD';

  /**
   * @property private
   */
  this.wait = options.wait ? reqWait(options.wait) : 10800000; // default to 3 hours per req
  this.pull = retry({wait: 10000}, options.pull);
  this.readyState = 'closed';
  this.loaded = false;

  // start
  setTimeout(_=> this.start(), 0);
}

/**
 *
 * @param [from]      - currency code, default to this.base
 * @param to          - currency code
 * @returns {number}
 */
CurrencyRatesStore.prototype.rate = function(from, to) {

  if (!this.loaded) return this._notLoadedErr();

  if (!to) {
    to = from;
    from = this.base;
  }

  var _from = from.toUpperCase();
  var _to = to.toUpperCase();

  if (!this.rates[_from] || !this.rates[_to]) {
    return this._unsupportCode(from, to);
  }

  return this.rates[_to] / this.rates[_from];
};

CurrencyRatesStore.prototype.pair = function(pair) {
  var _pair = parse(pair);
  if (!_pair) return this._pairErr(pair);

  return this.rate(_pair.from, _pair.to);
};

CurrencyRatesStore.prototype.convert = function(amount) {
  if (!isUnsignNum(amount)) this._invalidAmtErr(amount);
  var conv = new Conversion(this);
  conv.amount = amount;
  return conv;
};

CurrencyRatesStore.prototype.from = function(currency) {
  var conv = new Conversion(this);
  conv._from = currency;
  return conv;
};

CurrencyRatesStore.prototype.start = function() {
  this.readyState = 'opened';
  this._tick(true);
};

CurrencyRatesStore.prototype._tick = function(start) {
  if (this.readyState != 'opened') return;

  this.emit('info', lib + ' tick:' + systime(Date.now()));

  var wait = start === true ? 0 : this.wait;
  if (typeof start == 'number' ) wait = start;

  setTimeout(_=> this.pull(this._received()), wait);
};

CurrencyRatesStore.prototype.stop = function() {
  this.readyState = 'closed';
  this.emit('info', 'stopped');
};

CurrencyRatesStore.prototype._received = function() {

  return (err, latest)=> {

    // error handling: request in `this.wait` divided by 10
    if (err) {
      if (err.timeout) {
        this.emit('warn', 'timeout: ' + err.timeout + '. re-requesting...');
        return this._tick(Math.round(this.wait / 10));
      }
      this.emit('error', err);
      return this._tick(Math.round(this.wait / 10));
    }

    // emit info object for logging purpose
    var info = {message: 'latest rates received'};
    info.base = latest.base;
    info.codes = Object.keys(latest.rates);
    info.ts = latest.ts;
    this.emit('info', info);

    // make sure rates is based on `this.base`
    if (latest.base != this.base) {

      if (!latest.rates[this.base]) {
        this._baseErr(latest.rates, this.base);
        return this._tick(Math.round(this.wait / 10));
      }

      if (latest.rates[this.base] != 1) {
        this.emit('warn', `latest rates is based on ${latest.base}. Will rebase the rates on ${this.base}`);
        latest.rates = rebase(latest.rates, this.base);
      }

      latest.base = this.base;
    }

    // update the result
    this.ts = latest.ts;
    this.rates = latest.rates;

    if (!this.loaded) {
      this.loaded = true;
      this.emit('load', this);
    }
  }

};

CurrencyRatesStore.prototype._notLoadedErr = function() {
  this.emit('error', new ReferenceError('exchange rates is not loaded yet'));
};

CurrencyRatesStore.prototype._unsupportCode = function(from, to) {
  var err = new TypeError('not supported currency code');
  err.original = {from : from, to: to, rates: this.rates};
  this.emit('error', err);
};

CurrencyRatesStore.prototype._invalidAmtErr = function(amount) {
  var err = new TypeError('invalid amount to convert');
  err.original = amount;
  this.emit('error', err);
};

CurrencyRatesStore.prototype._pairErr = function(pair) {
  var err = new TypeError('invalid pair');
  err.original = pair;
  this.emit('error', err);
};

CurrencyRatesStore.prototype._baseErr = function(rates, base) {
  var err = new TypeError('rates has no currency to base on');
  err.original = {base: base, rates: rates};
  this.emit('error', err);
};


function Conversion(store) {

  this.store = store;
  this.amount = null;
  this._from = null;
}

Conversion.prototype.from = function(currency) {
  this._from = currency;
  return this;
};

Conversion.prototype.to = function(currency) {
  var _to = currency;

  if (!this.amount) this.amount = 1;
  if (!this._from) return this.store.rate(_to) * this.amount;
  return this.store.rate(this._from, _to) * this.amount;
};