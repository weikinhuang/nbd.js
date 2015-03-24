import async from './async';

const blocking = Symbol('debounced');

export default function debounce(fn) {
  if (fn[blocking]) { return; }
  const retval = fn.call(this);
  fn[blocking] = true;
  async(() => delete fn[blocking]);
  return retval;
}
