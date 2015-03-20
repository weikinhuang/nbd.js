import media from '../util/media';

export default {
  requestView(ViewClass) {
    if (ViewClass == null && typeof this.constructor.VIEW_CLASS === 'object') {
      if (!this._isMediaBound) {
        this
        .listenTo(media, 'all', this.mediaView)
        ._isMediaBound = true;
      }
      media.getState().some(function(state) {
        return this[state] && (ViewClass = state);
      }, this.constructor.VIEW_CLASS);
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
