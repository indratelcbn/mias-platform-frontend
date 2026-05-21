/**
 * Format number to Indonesian currency format
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rp 0';
  
  const num = Number(value);
  if (isNaN(num)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format date to Indonesian format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date to short format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return '-';
  
  return new Date(date).toLocaleDateString('id-ID');
};

export const formatDateShortUTC = (date) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', { timeZone: 'UTC' });
};

/**
 * Format number
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  
  const num = Number(value);
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Parse currency string to number
 * @param {string} str - The currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (str) => {
  if (!str) return 0;
  
  // Remove Rp, dots, and spaces
  const cleaned = String(str).replace(/[Rp\s.]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
};

/**
 * Convert number to Indonesian words (terbilang)
 * @param {number|string} value - The number to convert
 * @returns {string} The number written in Indonesian words
 */
export const terbilang = (value) => {
  const num = Math.floor(Math.abs(Number(value) || 0));
  if (num === 0) return 'nol';

  const satuan = [
    '', 'satu', 'dua', 'tiga', 'empat',
    'lima', 'enam', 'tujuh', 'delapan', 'sembilan',
    'sepuluh', 'sebelas',
  ];

  const toWords = (n) => {
    if (n < 12) return satuan[n];
    if (n < 20) return `${satuan[n - 10]} belas`;
    if (n < 100) {
      const d = Math.floor(n / 10);
      const s = n % 10;
      return `${satuan[d]} puluh${s ? ' ' + satuan[s] : ''}`;
    }
    if (n < 200) return `seratus${n - 100 ? ' ' + toWords(n - 100) : ''}`;
    if (n < 1000) {
      const r = Math.floor(n / 100);
      const s = n % 100;
      return `${satuan[r]} ratus${s ? ' ' + toWords(s) : ''}`;
    }
    if (n < 2000) return `seribu${n - 1000 ? ' ' + toWords(n - 1000) : ''}`;
    if (n < 1000000) {
      const r = Math.floor(n / 1000);
      const s = n % 1000;
      return `${toWords(r)} ribu${s ? ' ' + toWords(s) : ''}`;
    }
    if (n < 1000000000) {
      const r = Math.floor(n / 1000000);
      const s = n % 1000000;
      return `${toWords(r)} juta${s ? ' ' + toWords(s) : ''}`;
    }
    if (n < 1000000000000) {
      const r = Math.floor(n / 1000000000);
      const s = n % 1000000000;
      return `${toWords(r)} miliar${s ? ' ' + toWords(s) : ''}`;
    }
    const r = Math.floor(n / 1000000000000);
    const s = n % 1000000000000;
    return `${toWords(r)} triliun${s ? ' ' + toWords(s) : ''}`;
  };

  return toWords(num);
};
