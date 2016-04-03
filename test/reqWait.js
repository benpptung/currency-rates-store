'use strict';

const expect = require('expect.js');
const reqWait = require('../lib/_util').reqWait;

describe('reqWait()', _=>{

  it('will remove fraction of the number due to parseInt', function() {
    expect(reqWait('600001.11111')).to.be(600001);
  });

  it('return 600000, if wait is Infinity', function() {
    expect(reqWait(Infinity)).to.be(600000);
  });

  it('return 600000, if wait is less than 600000', function() {
    expect(reqWait(599999)).to.be(600000);
  });

  it('return the wait if wait is larger than 600000', function() {
    expect(reqWait(600001)).to.be(600001);
  });

});