// PDP variant-selector configuration. Edit this file — never the components.
export type VariantRenderer = 'pill' | 'color';

/** Attribute names never shown as selectors on the PDP. */
export const VARIANT_SELECTOR_BLOCKLIST: string[] = [
  'color-code',
  'colorCode',
  'finish-code',
  'finishlabel',
  'colorlabel',
  'sku',
  'articleNumber',
  'productspec',
  'subscription',
  'bundle',
  'bundle-ref',
  'badge-text',
  'badge-color',
  'backorderable',
  'new-arrival',
  'showVideoInPLP',
  'videoURL',
  'golivedate',
  // info attributes (also listed below)
  'brand',
  'warranty',
];

/** Maps an attribute name to a selector renderer. Unlisted attributes default to 'pill'. */
export const VARIANT_RENDERER_MAP: Record<string, VariantRenderer> = {
  color: 'color',
  'color-label': 'color',
  I_color: 'color',
  finish: 'color',
};

/** Maps a display attribute to its companion hex-code attribute for color swatches. */
export const VARIANT_COLOR_CODE_ATTR: Record<string, string> = {
  'color-label': 'color-code',
  color: 'colorCode',
  finish: 'finish-code',
};

/** Explicit left-to-right order of selectors; unlisted attributes appended after. */
export const VARIANT_SORT_ORDER: string[] = ['color', 'color-label', 'I_color', 'size', 'finish'];

/** Attributes rendered as text info blocks below the description (not as selectors). */
export const PDP_INFO_ATTRIBUTES: string[] = [
  'brand',
  'warranty',
  'productspec',
  'specs',
  'Fingerboard_material',
];
