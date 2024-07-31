export function calculateQuota(quota: number, digits: number = 2): string {
  let quotaPerUnit: number = 500000;
  let quotaPerUnitFloat: number = parseFloat(quotaPerUnit as any);

  return (quota / quotaPerUnitFloat).toFixed(digits);
}

export function calculateTotalQuota(quota: number, digits: number = 2): string {
  let quotaPerUnit: number = 500000;
  let quotaPerUnitFloat: number = parseFloat(quotaPerUnit as any);
  let totalQuota: number = quota;

  return (totalQuota / quotaPerUnitFloat).toFixed(digits);
}

export function renderQuota(quota: number, digits: number = 2): string {
  const displayInCurrency: boolean = localStorage.getItem('display_in_currency') === 'true';
  if (displayInCurrency) {
    return '$' + calculateQuota(quota, digits);
  }
  return renderNumber(quota);
}

export function renderNumber(num: number): any {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num;
  }
}

export function getDateStringFromTimestamp(timestamp: any) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth returns a zero-based value (where zero indicates the first month of the year)
  const day = date.getDate();

  // Pad the month and day with leading zeros, if necessary
  const monthString = month < 10 ? '0' + month : '' + month;
  const dayString = day < 10 ? '0' + day : '' + day;

  return `${year}-${monthString}-${dayString}`;
}
