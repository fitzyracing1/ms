/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *  - `decimal` decimal place [0], maximum 3 decimal place
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var decimal = options.decimal ? Math.min(options.decimal, 3) : 0;
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val, decimal) : fmtShort(val, decimal);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Stringify a number without scientific notation so that `parse()` can read
 * the output back (port of vercel/ms#299 to ms@2.1.3, without Intl).
 * Numbers that do not stringify to exponent form are returned as String(n),
 * so ordinary output is byte-for-byte unchanged.
 *
 * @param {Number} n
 * @return {String}
 * @api private
 */

function numberToDecimalString(n) {
  var str = String(n);
  var e = str.indexOf('e');
  if (e === -1) {
    return str;
  }
  var sign = '';
  var mantissa = str.slice(0, e);
  var exp = parseInt(str.slice(e + 1), 10);
  if (mantissa.charAt(0) === '-') {
    sign = '-';
    mantissa = mantissa.slice(1);
  }
  var dot = mantissa.indexOf('.');
  var intPart = dot === -1 ? mantissa : mantissa.slice(0, dot);
  var fracPart = dot === -1 ? '' : mantissa.slice(dot + 1);
  var digits = intPart + fracPart;
  var point = intPart.length + exp;
  if (point <= 0) {
    return sign + '0.' + new Array(1 - point).join('0') + digits;
  }
  if (point >= digits.length) {
    return sign + digits + new Array(point - digits.length + 1).join('0');
  }
  return sign + digits.slice(0, point) + '.' + digits.slice(point);
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @param {Number} demical
 * @return {String}
 * @api private
 */

function fmtShort(ms, decimal) {
  var msAbs = Math.abs(ms);
  var base = Math.pow(10, decimal);
  if (msAbs >= d) {
    return numberToDecimalString(Math.round((ms / d) * base) / base) + 'd';
  }
  if (msAbs >= h) {
    return numberToDecimalString(Math.round((ms / h) * base) / base) + 'h';
  }
  if (msAbs >= m) {
    return numberToDecimalString(Math.round((ms / m) * base) / base) + 'm';
  }
  if (msAbs >= s) {
    return numberToDecimalString(Math.round((ms / s) * base) / base) + 's';
  }
  return numberToDecimalString(ms) + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @param {Number} demical
 * @return {String}
 * @api private
 */

function fmtLong(ms, demical) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day', demical);
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour', demical);
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute', demical);
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second', demical);
  }
  return numberToDecimalString(ms) + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name, demical) {
  var isPlural = msAbs >= n * 1.5;
  var base = Math.pow(10, demical);
  return (
    numberToDecimalString(Math.round((ms / n) * base) / base) +
    ' ' +
    name +
    (isPlural ? 's' : '')
  );
}
