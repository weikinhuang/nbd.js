export default function extend(target, ...sources) {
  for (let one of sources) {
    for (let prop in one) {
      target[prop] = one[prop];
    }
  }
  return target;
}
