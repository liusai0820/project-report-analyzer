// utils/formatters.js
export const formatAmount = (value, unit = '万元') => {
    if (!value) return '0';
    try {
      const num = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
      return isNaN(num) ? '0' : `${num.toLocaleString()} ${unit}`;
    } catch {
      return '0';
    }
  };
  
  export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };
  
  export const formatPeriod = (period) => {
    if (!period) return '';
    try {
      const [start, end] = period.split('-').map(d => d.trim());
      return `${formatDate(start)} - ${formatDate(end)}`;
    } catch {
      return period;
    }
  };