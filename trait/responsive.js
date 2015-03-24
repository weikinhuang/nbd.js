import { ViewClassSymbol } from '../Controller';
import media from '../util/media';

const isBound = Symbol("media binding");

export default {
  requestView(ViewClass) {
    if (ViewClass == null && typeof this[ViewClassSymbol] === 'object') {
      if (!this[isBound]) {
        this.listenTo(media, 'all', this.mediaView);
        this[isBound] = true;
      }
      media.getState().some(function(state) {
        return this[state] && (ViewClass = state);
      }, this[ViewClassSymbol]);
    }
    // Without super.requestView()
    Object.getPrototypeOf(this).requestView(ViewClass);
  },

  mediaView(breakpoint, active) {
    if (active) {
      this.requestView(breakpoint);
    }
  }
};
