const toStr = Object.prototype.toString;

export default function curry() {
  var fn = this,
      rest = arguments,
      type = toStr.call(fn);
  if (type !== '[object Function]') { throw new TypeError("curry called on incompatible "+type); }
  return function() {
    Array.prototype.unshift.apply(arguments, rest);
    return fn.apply(this, arguments);
  };
}
