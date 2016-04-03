'use strict';

module.exports = function(num) {
  if (typeof num != 'number' && typeof num != 'string') return NaN;
  if (num == Infinity || num == -Infinity) return NaN;
  if (typeof num == 'number') return num > 0;
  return num * 1 > 0;
}