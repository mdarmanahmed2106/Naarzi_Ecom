function escapeCsvValue(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * columns: [{ label: string, value: (row) => string|number }]
 */
export function rowsToCsv(columns, rows) {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(c.value(row))).join(','));
  return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename, csvContent) {
  // Leading BOM so Excel opens it as UTF-8 instead of mangling non-ASCII characters (e.g. INR).
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRowsAsCsv(filename, columns, rows) {
  downloadCsv(filename, rowsToCsv(columns, rows));
}
