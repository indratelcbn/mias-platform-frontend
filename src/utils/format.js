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
