import { ViewInstance } from '../View';

export interface ResponsiveTrait {
  requestView(ViewClass: ViewInstance): void;
}

declare const _default: ResponsiveTrait;
export default _default;
