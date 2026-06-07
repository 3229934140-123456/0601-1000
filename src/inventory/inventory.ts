import { InventoryTask, InventoryRecord } from '@/types';
import { generateId } from '@/utils/format';

export const inventoryTasks: InventoryTask[] = [
  {
    id: 'it_001',
    name: '2024年Q2季度盘点',
    status: 'in_progress',
    totalAssets: 60,
    checkedAssets: 35,
    profitAssets: 1,
    lossAssets: 2,
    startDate: '2024-06-01',
    creator: '张明',
    departmentIds: ['dept_001', 'dept_002', 'dept_003', 'dept_004'],
  },
  {
    id: 'it_002',
    name: '2024年Q1季度盘点',
    status: 'completed',
    totalAssets: 58,
    checkedAssets: 58,
    profitAssets: 0,
    lossAssets: 1,
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    creator: '张明',
    departmentIds: ['dept_001', 'dept_002', 'dept_003', 'dept_004', 'dept_005', 'dept_006'],
  },
  {
    id: 'it_003',
    name: '2023年度年终盘点',
    status: 'completed',
    totalAssets: 50,
    checkedAssets: 50,
    profitAssets: 2,
    lossAssets: 0,
    startDate: '2023-12-01',
    endDate: '2023-12-20',
    creator: '李华',
    departmentIds: ['dept_001', 'dept_002', 'dept_003', 'dept_004', 'dept_005', 'dept_006', 'dept_007', 'dept_008'],
  },
];

export function generateInventoryRecords(taskId: string): InventoryRecord[] {
  const records: InventoryRecord[] = [];
  const statuses: Array<'normal' | 'profit' | 'loss'> = ['normal', 'normal', 'normal', 'normal', 'normal', 'profit', 'loss'];
  
  for (let i = 0; i < 20; i++) {
    const status = statuses[i % statuses.length];
    records.push({
      id: `ir_${taskId}_${i + 1}`,
      taskId,
      assetId: `asset_${String(i + 1).padStart(3, '0')}`,
      assetName: `资产${i + 1}`,
      assetNo: `BJT-IT-2024-${String(i + 1).padStart(4, '0')}`,
      status,
      checkedBy: '张明',
      checkedAt: '2024-06-05T14:30:00',
      remark: status === 'profit' ? '发现未登记资产' : status === 'loss' ? '现场未找到' : '',
    });
  }
  
  return records;
}
