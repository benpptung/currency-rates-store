'use strict';

const expect = require('expect.js');
const rebase = require('../lib/_util-rebase');
const inspect = require('util').inspect;

describe('rebase()', _=>{

  var rates = require('./fixtures/data').rates;

  it('should rebase the rates', function() {
    var _rates = rebase(rates, 'EUR');
    expect(_rates.EUR).to.be(1);
    expect(_rates.USD).to.be(1.0830457846775015);
    expect(_rates.TWD).to.be(36.27303367622563);
  });

  it('should keep the rates, if the base is 1', function() {
    expect(rebase(rates, 'USD').USD).to.be(1);
  });


});