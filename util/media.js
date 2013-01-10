/**
 * Responsive media query callbacks
 * @see https://developer.mozilla.org/en-US/docs/DOM/Using_media_queries_from_code
 */
define(['nbd/util/extend', 'nbd/trait/pubsub'], function(extend, pubsub) {
  'use strict';

  var queries = {},
  mqChange, mediaCheck,
  matchMedia = window.matchMedia || window.msMatchMedia;

  function bindMedia( breakpoint, query ) {
    var match = window.matchMedia( query );
    queries[breakpoint] = match;
    match.addListener( mqChange.bind(match, breakpoint) );
    if (match.matches) { mqChange.call(match, breakpoint); }
  }

  mediaCheck = function media( options, query ) {
    var breakpoint;

    // No matchMedia support
    if ( !matchMedia ) {
      throw new Error('Media queries not supported.');
    }

    // Has matchMedia support
    if ( typeof options === 'string' ) {
      bindMedia( options, query );
      return media;
    }

    if ( typeof options === 'object' ) {
      for (breakpoint in options) {
        if (options.hasOwnProperty(breakpoint)) {
          query = options[breakpoint];
          bindMedia( breakpoint, query );
        }
      }
    }
    return media;

  };

  extend(mediaCheck, pubsub);

  mqChange = function(breakpoint) {
    mediaCheck.trigger(breakpoint + (this.matches ? ':enter' : ':exit'));
    mediaCheck.trigger(breakpoint, this.matches);
  };

  mediaCheck.getState = function(breakpoint) {
    return queries[breakpoint] && queries[breakpoint].matches;
  };

  return mediaCheck;

});
