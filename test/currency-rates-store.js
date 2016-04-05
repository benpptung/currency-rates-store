'use strict';

const expect = require('expect.js');
const CurrRatesStore = require('..');
const pull = require('./fixtures/pull');

describe('CurrencyRatesStore', _=>{


  it('should have correct wait value configured', function() {
    expect(CurrRatesStore({pull: pull}).wait).to.be(10800000);
    expect(CurrRatesStore({pull: pull, wait: 500}).wait).to.be(600000);

    var store = CurrRatesStore({pull: pull});
    expect(store.ts).to.be(null);
    expect(store.rates).to.be(null);
    expect(store.base).to.be('USD');
    expect(store.wait).to.be(10800000);
    expect(store.readyState).to.be('closed');
  });

  it('should emit `load` while the store is initially ready', function(done) {
    var store = CurrRatesStore({pull: pull});
    expect(store.base).to.be('USD');
    store.on('load', _=>{
      expect(store.base).to.be('USD');
      expect(store.loaded).to.be.ok();
      done();
    })
  });


  describe('.rate()', _=>{
    it('should return exchange rate', function(done) {
      var store = CurrRatesStore({pull: pull});
      store.on('load', _=>{

        expect(store.rate('USD', 'EUR')).to.be(0.923322);
        expect(store.rate('AUD', 'CAD').toFixed(8)).to.be('0.98924767');
        done();
      })
    });

    it('should emit `ReferenceError` if the store is not ready', function(done) {
      var store = CurrRatesStore({pull: pull});
      store.on('error', e=>{
        expect(e).to.be.a(ReferenceError);
        done();
      });

      store.rate('USD', 'EUR');
    });

    it('should emit `TypeError` if from or to is invalid', function(done) {
      var store = CurrRatesStore({pull: pull});

      store.on('error', e=>{
        expect(e).to.be.a(TypeError);
        expect(e.original.from).to.be('XBT');
        expect(e.original.to).to.be('USD');
        expect(e.original.rates).to.be.an(Object);
        done();
      });

      store.on('load', _=>{
        store.rate('XBT', 'USD');
      })
    });
  });

  describe('.pair()', _=> {
    it('should return exchange rate', function(done) {
      var store = CurrRatesStore({pull: pull}).on('load', _=>{
        expect(store.pair('EURUSD').toFixed(8)).to.be('1.08304578');
        expect(store.pair('CNYUSD').toFixed(8)).to.be('0.15205550');
        done();
      });
    });

    it('should emit `TypeError` if pair is invalid', function(done) {
      var pair = {from: 'EUR', to: 'USD'};
      var store = CurrRatesStore({pull: pull})
        .on('error', err=> {
          expect(err).to.be.an(TypeError);
          expect(err.original).to.be.eql(pair);
          done();
        })
        .on('load', _=>{
          store.pair(pair);
        });
    })
  })

  describe('.convert()', _=>{
    it('should accept an amount and return a Conversion object', function(done){
      var store = CurrRatesStore({pull: pull}).on('load', _=>{
        var conv = store.convert(1000);
        expect(conv.amount).to.be(1000);
        expect(conv.store).to.be(store);
        expect(conv._from).to.be(null);
        done();
      });
    });

    it('should emit `TypeError` if amount is not an unsigned number', function(done) {

      var amt = Infinity;

      CurrRatesStore({pull: pull})
        .on('error', err=>{
          expect(err).to.be.a(TypeError);
          expect(err.original).to.be(amt);
          done();
        })
        .on('load', store=>{
          store.convert(amt).from('EUR').to('USD');
        });
    });
  });

  describe('.from()', _=> {
    it('should accept a from currency and return a Conversion object', function(done) {
      var curr = 'EUR';

      CurrRatesStore({pull: pull})
        .on('load', store=>{
          var conv = store.from(curr);
          expect(conv._from).to.be(curr);
          expect(conv.amount).to.be(null);
          expect(conv.store).to.be(store);
          done();
        })
    });
  })

  describe('Conversion()', _=>{

    describe('.to()', _=>{
      it('should convert the amount based on the properties', function(done) {

        CurrRatesStore({pull: pull})
          .on('load', store=>{
            expect(store.from('EUR').to('USD').toFixed(8)).to.be('1.08304578');
            expect(store.convert(100).from('EUR').to('USD').toFixed(8)).to.be('108.30457847');
            expect(store.convert(100).to('EUR').toFixed(6)).to.be('92.332200')
            done();
          })
      });
    })
  })



});