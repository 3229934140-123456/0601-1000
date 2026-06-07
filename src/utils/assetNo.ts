import { AssetCategory } from '@/types';

const categoryCodeMap: Record<AssetCategory, string> = {
  computer: 'IT',
  furniture: 'FN',
  electronics: 'EL',
  vehicle: 'VH',
  other: 'OT',
};

const COMPANY_CODE = 'BJT';

export function generateAssetNo(category: AssetCategory, sequence: number): string {
  const year = new Date().getFullYear();
  const categoryCode = categoryCodeMap[category];
  const seqStr = String(sequence).padStart(4, '0');
  return `${COMPANY_CODE}-${categoryCode}-${year}-${seqStr}`;
}

export function getNextSequence(existingNos: string[], category: AssetCategory): number {
  const year = new Date().getFullYear();
  const categoryCode = categoryCodeMap[category];
  const prefix = `${COMPANY_CODE}-${categoryCode}-${year}-`;
  
  const relevantNos = existingNos.filter((no) => no.startsWith(prefix));
  if (relevantNos.length === 0) return 1;
  
  const maxSeq = Math.max(
    ...relevantNos.map((no) => {
      const numStr = no.slice(prefix.length);
      return parseInt(numStr, 10) || 0;
    })
  );
  
  return maxSeq + 1;
}
