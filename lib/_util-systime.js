'use strict';

exports.systime = function(date, unix) {
  var _d;

  if (isDate(date)) _d = date;

  if (!_d) _d = tsToDate(date, unix);

  if (!_d || isNaN(_d.getTime())) return 'invalid argument[date]:' + date;

  var y = _d.getFullYear();
  var M = '0' + (_d.getMonth() + 1);
  var d = '0' + _d.getDate();
  var h = '0' + _d.getHours();
  var m = '0' + _d.getMinutes();
  var s = '0' + _d.getSeconds();

  return y + '-' + M.substr(-2) + '-' + d.substr(-2) + ' ' + h.substr(-2) + ':' +
      m.substr(-2) + ':' + s.substr(-2);
};

var tsToDate = exports.tsToDate = function(ts, unix) {
  if (typeof ts != 'string' && typeof ts != 'number' && !isDate(ts)) return;

  var n = numStrToNum(ts);
  if (n) ts = unix === true ? n * 1000 : n;

  var d = new Date(ts);
  return isNaN(d.getTime()) ? false : d;
};

var isDate = exports.isDate = function(d) {
  return d instanceof Date && !isNaN(d.getTime());
};

function numStrToNum(str) {
  var n = str * 1;
  return !isNaN(n) && n;
}