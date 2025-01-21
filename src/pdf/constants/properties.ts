export const TEXT_PROPERTIES = {
  type: ['text'],
  content: ['string'],
  font: [
    'Helvetica',
    'Helvetica-Bold',
    'Helvetica-Oblique',
    'Helvetica-BoldOblique',
  ],
  size: ['number'],
  align: ['left', 'center', 'right'],
  color: ['string'], // Hex color
  lineGap: ['number'],
  width: ['number'],
  height: ['number'],
  backgroundColor: ['string'], // Hex color
};

export const IMAGE_PROPERTIES = {
  type: ['image'],
  content: ['string'], // URL
  width: ['number'],
  height: ['number'],
  align: ['left', 'center', 'right'],
};

export const ROW_PROPERTIES = {
  type: ['row'],
  childs: ['array'],
  backgroundColor: ['string'], // Hex color
};

export const COLUMN_PROPERTIES = {
  type: ['column'],
  childs: ['array'],
  backgroundColor: ['string'], // Hex color
};

export const PAGE_PROPERTIES = {
  margins: {
    left: ['number'],
    right: ['number'],
    bottom: ['number'],
    top: ['number'],
  },
  orientation: ['portrait', 'landscape'],
  page: ['a4', 'letter', 'legal'],
};

export const HEADER_FOOTER_PROPERTIES = {
  content: ['array'],
};

export const ALL_PROPERTIES = {
  text: TEXT_PROPERTIES,
  image: IMAGE_PROPERTIES,
  row: ROW_PROPERTIES,
  column: COLUMN_PROPERTIES,
  page: PAGE_PROPERTIES,
  headerFooter: HEADER_FOOTER_PROPERTIES,
};
