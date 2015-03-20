export default function mixin(target, abstract) {
  const descriptors = {};
  for (let prop of Object.keys(abstract)) {
    descriptors[prop] = Object.getOwnPropertyDescriptor(abstract, prop);
  }
  Object.defineProperties(target, descriptors);
}
