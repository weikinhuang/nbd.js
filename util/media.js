/**
 * Responsive media query callbacks
 * @see https://developer.mozilla.org/en-US/docs/DOM/Using_media_queries_from_code
 */
/*global matchMedia, msMatchMedia */
import extend from './extend';
import pubsub from '../trait/pubsub';

let queries = {},
mqChange,
mMedia = typeof matchMedia !== 'undefined' ? matchMedia :
         typeof msMatchMedia !== 'undefined' ? msMatchMedia :
         null;

function bindMedia(breakpoint, query) {
  let match;
  if (match = queries[breakpoint]) {
    match.removeListener(match.listener);
  }

  match = mMedia(query);
  match.listener = mqChange.bind(match, breakpoint);
  match.addListener(match.listener);
  queries[breakpoint] = match;
  if (match.matches) { mqChange.call(match, breakpoint); }
}

function isActive(breakpoint) {
  return queries[breakpoint] && queries[breakpoint].matches;
}

function media(options, query) {
  // No matchMedia support
  if (!mMedia) {
    throw new Error('Media queries not supported.');
  }

  // Has matchMedia support
  if (typeof options === 'string') {
    bindMedia(options, query);
    return media;
  }

  if (typeof options === 'object') {
    Object.keys(options).forEach(function(breakpoint) {
      bindMedia(breakpoint, this[breakpoint]);
    }, options);
  }
  return media;
}

extend(media, pubsub);

mqChange = function(breakpoint) {
  media.trigger(breakpoint + (this.matches ? ':enter' : ':exit'));
  media.trigger(breakpoint, this.matches);
};

media.is = isActive;
media.getState = function(breakpoint) {
  if (breakpoint) { return isActive(breakpoint); }
  return Object.keys(queries).filter(isActive);
};

export default media;
