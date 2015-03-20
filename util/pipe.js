export default function chain(...fns) {
  return function() {
    let retval, fn = fns.shift(), args = arguments;
    do {
      try {
        retval = fn.apply(this, args);
      }
      catch(ignored) {}
    }
    while (args = [retval], fn = fns.shift());
    return retval;
  };
}
