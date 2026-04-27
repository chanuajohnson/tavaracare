/**
 * Convert a number to words for TTD currency display on receipts
 * e.g., 1600.00 → "One Thousand Six Hundred Trinidad & Tobago Dollars Only"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertHundreds(num: number): string {
  let result = '';
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred';
    num %= 100;
    if (num > 0) result += ' and ';
  }
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += '-' + ones[num];
  } else if (num > 0) {
    result += ones[num];
  }
  return result;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Trinidad & Tobago Dollars Only';

  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  let words = '';

  if (dollars >= 1000000) {
    words += convertHundreds(Math.floor(dollars / 1000000)) + ' Million ';
    const remainder = dollars % 1000000;
    if (remainder >= 1000) {
      words += convertHundreds(Math.floor(remainder / 1000)) + ' Thousand ';
      const h = remainder % 1000;
      if (h > 0) words += convertHundreds(h);
    } else if (remainder > 0) {
      words += convertHundreds(remainder);
    }
  } else if (dollars >= 1000) {
    words += convertHundreds(Math.floor(dollars / 1000)) + ' Thousand ';
    const remainder = dollars % 1000;
    if (remainder > 0) words += convertHundreds(remainder);
  } else {
    words += convertHundreds(dollars);
  }

  words = words.trim() + ' Trinidad & Tobago Dollars';

  if (cents > 0) {
    words += ' and ' + convertHundreds(cents) + ' Cents';
  }

  words += ' Only';

  return words;
}
