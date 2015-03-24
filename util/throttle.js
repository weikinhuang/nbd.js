const blocking = Symbol('throttled');

export default function throttle(fn) {
  if (fn[blocking]) { return; }
  fn[blocking] = true;

  const retval = fn.call(this);

  function unblock() { delete fn[blocking]; }
  if (retval && typeof retval.then === 'function') {
    retval.then(unblock, unblock);
  }
  else {
    delete fn[blocking];
  }

  return retval;
}
