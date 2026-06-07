export interface DepreciationParams {
  originalValue: number;
  salvageValue: number;
  usefulLife: number;
  purchaseDate: string;
  currentDate?: string;
}

export function calculateStraightLineDepreciation(params: DepreciationParams) {
  const { originalValue, salvageValue, usefulLife, purchaseDate, currentDate } = params;
  const now = currentDate ? new Date(currentDate) : new Date();
  const purchase = new Date(purchaseDate);
  
  const monthsUsed = Math.max(0,
    (now.getFullYear() - purchase.getFullYear()) * 12 +
    (now.getMonth() - purchase.getMonth())
  );
  
  const totalMonths = usefulLife * 12;
  const monthlyDepreciation = (originalValue - salvageValue) / totalMonths;
  const accumulatedDepreciation = monthlyDepreciation * Math.min(monthsUsed, totalMonths);
  const netValue = Math.max(salvageValue, originalValue - accumulatedDepreciation);
  const depreciationRate = monthlyDepreciation / originalValue;
  
  return {
    monthlyDepreciation,
    accumulatedDepreciation,
    netValue,
    depreciationRate,
    monthsUsed: Math.min(monthsUsed, totalMonths),
    remainingMonths: Math.max(0, totalMonths - monthsUsed),
    totalMonths,
  };
}

export function calculateDoubleDecliningDepreciation(params: DepreciationParams) {
  const { originalValue, salvageValue, usefulLife, purchaseDate, currentDate } = params;
  const now = currentDate ? new Date(currentDate) : new Date();
  const purchase = new Date(purchaseDate);
  
  const monthsUsed = Math.max(0,
    (now.getFullYear() - purchase.getFullYear()) * 12 +
    (now.getMonth() - purchase.getMonth())
  );
  
  const totalMonths = usefulLife * 12;
  const straightLineRate = 1 / usefulLife;
  const doubleRate = 2 * straightLineRate;
  
  let bookValue = originalValue;
  let accumulatedDepreciation = 0;
  let monthlyDepreciation = 0;
  
  const yearsUsed = Math.floor(monthsUsed / 12);
  const currentYearMonths = monthsUsed % 12;
  
  for (let year = 0; year < yearsUsed && bookValue > salvageValue; year++) {
    const yearDepreciation = bookValue * doubleRate;
    if (bookValue - yearDepreciation < salvageValue) {
      accumulatedDepreciation += bookValue - salvageValue;
      bookValue = salvageValue;
      break;
    }
    accumulatedDepreciation += yearDepreciation;
    bookValue -= yearDepreciation;
  }
  
  if (bookValue > salvageValue && currentYearMonths > 0) {
    const currentYearDepreciation = bookValue * doubleRate;
    monthlyDepreciation = currentYearDepreciation / 12;
    const partialDepreciation = monthlyDepreciation * currentYearMonths;
    if (bookValue - partialDepreciation < salvageValue) {
      accumulatedDepreciation += bookValue - salvageValue;
      bookValue = salvageValue;
    } else {
      accumulatedDepreciation += partialDepreciation;
      bookValue -= partialDepreciation;
    }
  }
  
  const netValue = Math.max(salvageValue, bookValue);
  
  return {
    monthlyDepreciation,
    accumulatedDepreciation,
    netValue,
    monthsUsed: Math.min(monthsUsed, totalMonths),
    remainingMonths: Math.max(0, totalMonths - monthsUsed),
    totalMonths,
  };
}

export function calculateYearlyDepreciation(
  originalValue: number,
  salvageValue: number,
  usefulLife: number
) {
  const yearlyDepreciation = (originalValue - salvageValue) / usefulLife;
  const netValue = originalValue - yearlyDepreciation;
  
  return {
    yearlyDepreciation,
    netValue,
  };
}

export function getDepreciationByYear(params: DepreciationParams, years: number = 5) {
  const { originalValue, salvageValue, usefulLife } = params;
  const result = [];
  
  let bookValue = originalValue;
  const straightLineRate = 1 / usefulLife;
  const doubleRate = 2 * straightLineRate;
  
  for (let year = 0; year < Math.min(years, usefulLife); year++) {
    const straightLineDep = (originalValue - salvageValue) / usefulLife;
    const doubleDeclineDep = bookValue * doubleRate;
    
    const finalDep = Math.min(doubleDeclineDep, bookValue - salvageValue);
    bookValue = Math.max(salvageValue, bookValue - finalDep);
    
    result.push({
      year: year + 1,
      straightLine: straightLineDep,
      doubleDeclining: finalDep,
      netValue: bookValue,
    });
  }
  
  return result;
}
