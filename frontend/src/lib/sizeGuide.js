// Size guide shown from the product page. Body measurements in inches, from the brand's own chart.
// code matches the size a product is listed in, so offered sizes can be highlighted; plus sizes
// have no product size code yet.
export const SIZE_CHART = [
  { num: 32, name: 'XXSmall', code: 'XXS', bust: 32, waist: 26, hip: 36 },
  { num: 34, name: 'XSmall', code: 'XS', bust: 34, waist: 28, hip: 38 },
  { num: 36, name: 'Small', code: 'S', bust: 36, waist: 30, hip: 40 },
  { num: 38, name: 'Medium', code: 'M', bust: 38, waist: 32, hip: 42 },
  { num: 40, name: 'Large', code: 'L', bust: 40, waist: 34, hip: 44 },
  { num: 42, name: 'XLarge', code: 'XL', bust: 42, waist: 36, hip: 46 },
  { num: 44, name: 'XXLarge', code: 'XXL', bust: 44, waist: 38, hip: 48 },
  { num: 46, name: 'XXXLarge', code: 'XXXL', bust: 46, waist: 40, hip: 50 },
  { num: 46, name: 'Plus Size', plus: true, bust: 46, waist: 38, hip: 54 },
  { num: 48, name: 'Plus Size', plus: true, bust: 48, waist: 40, hip: 56 },
  { num: 50, name: 'Plus Size', plus: true, bust: 50, waist: 42, hip: 58 },
  { num: 52, name: 'Plus Size', plus: true, bust: 52, waist: 44, hip: 60 },
  { num: 54, name: 'Plus Size', plus: true, bust: 54, waist: 46, hip: 62 },
  { num: 56, name: 'Plus Size', plus: true, bust: 56, waist: 46, hip: 64 },
];

export const MEASURING_TIPS = [
  { label: 'Bust', text: 'Measure around the fullest part of your bust, keeping the tape level.' },
  { label: 'Waist', text: 'Measure around your natural waistline, the narrowest part of your torso.' },
  { label: 'Hip', text: 'Measure around the fullest part of your hips, with your feet together.' },
];

export const toCm = (inches) => Math.round(inches * 2.54);
