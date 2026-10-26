// Size guide shown from the product page. Body measurements in inches, using standard Indian
// women's ready-to-wear sizing; replace these with the brand's own chart if it differs.
export const SIZE_CHART = [
  { size: 'XS', bust: 32, waist: 26, hip: 35 },
  { size: 'S', bust: 34, waist: 28, hip: 37 },
  { size: 'M', bust: 36, waist: 30, hip: 39 },
  { size: 'L', bust: 38, waist: 32, hip: 41 },
  { size: 'XL', bust: 40, waist: 34, hip: 43 },
  { size: 'XXL', bust: 42, waist: 36, hip: 45 },
  { size: 'XXXL', bust: 44, waist: 38, hip: 47 },
];

export const MEASURING_TIPS = [
  { label: 'Bust', text: 'Measure around the fullest part of your bust, keeping the tape level.' },
  { label: 'Waist', text: 'Measure around your natural waistline, the narrowest part of your torso.' },
  { label: 'Hip', text: 'Measure around the fullest part of your hips, with your feet together.' },
];

export const toCm = (inches) => Math.round(inches * 2.54);
