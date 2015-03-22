import View from '../View';

export default class Element extends View {
  constructor($parent) {
    super();
    this.$parent = $parent;
  }

  render(data) {
    const $existing = this.$view;

    this.trigger('prerender', $existing);

    this.$view = this.constructor.domify(this.template(data || this.templateData()));

    if ($existing) {
      this.constructor.replace($existing, this.$view);
    }
    else {
      this.constructor.appendTo(this.$view, this.$parent);
    }

    this.trigger('postrender', this.$view);

    return this.$view;
  }
}
