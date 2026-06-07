import { InventoryTask, InventoryRecord, Asset } from '@/types';
import { generateId } from '@/utils/format';

export const inventoryTasks: InventoryTask[] = [
  {
    id: 'it_001',
    name: '2024年Q2季度盘点',
    status: 'in_progress',
    totalAssets: 20,
    checkedAssets: 12,
    profitAssets: 1,
    lossAssets: 1,
    startDate: '2024-06-01',
    creator: '张明',
    departmentIds: ['dept_001', 'dept_002', 'dept_003', 'dept_004'],
  },
  {
    id: 'it_002',
    name: '2024年Q1季度盘点',
    status: 'completed',
    totalAssets: 20,
    checkedAssets: 20,
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
    totalAssets: 18,
    checkedAssets: 18,
    profitAssets: 2,
    lossAssets: 0,
    startDate: '2023-12-01',
    endDate: '2023-12-20',
    creator: '李华',
    departmentIds: ['dept_001', 'dept_002', 'dept_003', 'dept_004', 'dept_005', 'dept_006', 'dept_007', 'dept_008'],
  },
];

export function generateInitialInventoryRecords(): Record<string, InventoryRecord[]> {
  const result: Record<string, InventoryRecord[]> = {};

  result['it_001'] = [
    { id: 'ir_it001_01', taskId: 'it_001', assetId: 'asset_001', assetName: 'ThinkPad X1 Carbon', assetNo: 'BJT-IT-2024-0001', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T09:30:00', remark: '' },
    { id: 'ir_it001_02', taskId: 'it_001', assetId: 'asset_002', assetName: 'MacBook Pro 14', assetNo: 'BJT-IT-2024-0002', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T09:45:00', remark: '' },
    { id: 'ir_it001_03', taskId: 'it_001', assetId: 'asset_003', assetName: 'Dell 27寸显示器', assetNo: 'BJT-IT-2024-0003', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T10:00:00', remark: '' },
    { id: 'ir_it001_04', taskId: 'it_001', assetId: 'asset_004', assetName: 'HP LaserJet打印机', assetNo: 'BJT-IT-2024-0004', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T10:15:00', remark: '' },
    { id: 'ir_it001_05', taskId: 'it_001', assetId: 'asset_005', assetName: '人体工学椅', assetNo: 'BJT-FN-2024-0005', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T10:30:00', remark: '' },
    { id: 'ir_it001_06', taskId: 'it_001', assetId: 'asset_006', assetName: '升降办公桌', assetNo: 'BJT-FN-2024-0006', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T10:45:00', remark: '' },
    { id: 'ir_it001_07', taskId: 'it_001', assetId: 'asset_007', assetName: '索尼降噪耳机', assetNo: 'BJT-EL-2024-0007', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T11:00:00', remark: '' },
    { id: 'ir_it001_08', taskId: 'it_001', assetId: 'asset_008', assetName: 'iPad Pro 12.9', assetNo: 'BJT-IT-2024-0008', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T11:15:00', remark: '' },
    { id: 'ir_it001_09', taskId: 'it_001', assetId: 'asset_009', assetName: '会议室投影仪', assetNo: 'BJT-IT-2024-0009', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T14:00:00', remark: '' },
    { id: 'ir_it001_10', taskId: 'it_001', assetId: 'asset_010', assetName: '无线麦克风', assetNo: 'BJT-EL-2024-0010', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-06-02T14:15:00', remark: '' },
    { id: 'ir_it001_11', taskId: 'it_001', assetId: 'asset_011', assetName: '未登记打印机', assetNo: 'BJT-IT-2024-0011', status: 'profit' as const, checkedBy: '张明', checkedAt: '2024-06-02T14:30:00', remark: '在储物间发现未登记的打印机' },
    { id: 'ir_it001_13', taskId: 'it_001', assetId: 'asset_013', assetName: '笔记本电脑', assetNo: 'BJT-IT-2024-0013', status: 'loss' as const, checkedBy: '', checkedAt: '', remark: '' },
  ];

  result['it_002'] = [
    { id: 'ir_it002_01', taskId: 'it_002', assetId: 'asset_001', assetName: 'ThinkPad X1 Carbon', assetNo: 'BJT-IT-2024-0001', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T09:30:00', remark: '' },
    { id: 'ir_it002_02', taskId: 'it_002', assetId: 'asset_002', assetName: 'MacBook Pro 14', assetNo: 'BJT-IT-2024-0002', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T09:45:00', remark: '' },
    { id: 'ir_it002_03', taskId: 'it_002', assetId: 'asset_003', assetName: 'Dell 27寸显示器', assetNo: 'BJT-IT-2024-0003', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T10:00:00', remark: '' },
    { id: 'ir_it002_04', taskId: 'it_002', assetId: 'asset_004', assetName: 'HP LaserJet打印机', assetNo: 'BJT-IT-2024-0004', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T10:15:00', remark: '' },
    { id: 'ir_it002_05', taskId: 'it_002', assetId: 'asset_005', assetName: '人体工学椅', assetNo: 'BJT-FN-2024-0005', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T10:30:00', remark: '' },
    { id: 'ir_it002_06', taskId: 'it_002', assetId: 'asset_006', assetName: '升降办公桌', assetNo: 'BJT-FN-2024-0006', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T10:45:00', remark: '' },
    { id: 'ir_it002_07', taskId: 'it_002', assetId: 'asset_007', assetName: '索尼降噪耳机', assetNo: 'BJT-EL-2024-0007', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T11:00:00', remark: '' },
    { id: 'ir_it002_08', taskId: 'it_002', assetId: 'asset_008', assetName: 'iPad Pro 12.9', assetNo: 'BJT-IT-2024-0008', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T11:15:00', remark: '' },
    { id: 'ir_it002_09', taskId: 'it_002', assetId: 'asset_009', assetName: '会议室投影仪', assetNo: 'BJT-IT-2024-0009', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T14:00:00', remark: '' },
    { id: 'ir_it002_10', taskId: 'it_002', assetId: 'asset_010', assetName: '无线麦克风', assetNo: 'BJT-EL-2024-0010', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-05T14:15:00', remark: '' },
    { id: 'ir_it002_11', taskId: 'it_002', assetId: 'asset_011', assetName: '会议白板', assetNo: 'BJT-FN-2024-0011', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T09:30:00', remark: '' },
    { id: 'ir_it002_12', taskId: 'it_002', assetId: 'asset_012', assetName: '空气净化器', assetNo: 'BJT-EL-2024-0012', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T09:45:00', remark: '' },
    { id: 'ir_it002_13', taskId: 'it_002', assetId: 'asset_013', assetName: '笔记本电脑', assetNo: 'BJT-IT-2024-0013', status: 'loss' as const, checkedBy: '张明', checkedAt: '2024-03-06T10:00:00', remark: '员工离职后未归还', processed: true, processType: 'confirm_loss' as const, processRemark: '已确认盘亏，员工赔偿处理中', processedAt: '2024-03-15T10:00:00', processedBy: '李华' },
    { id: 'ir_it002_14', taskId: 'it_002', assetId: 'asset_014', assetName: '办公电话', assetNo: 'BJT-IT-2024-0014', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T10:15:00', remark: '' },
    { id: 'ir_it002_15', taskId: 'it_002', assetId: 'asset_015', assetName: '文件柜', assetNo: 'BJT-FN-2024-0015', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T10:30:00', remark: '' },
    { id: 'ir_it002_16', taskId: 'it_002', assetId: 'asset_016', assetName: '碎纸机', assetNo: 'BJT-EL-2024-0016', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T10:45:00', remark: '' },
    { id: 'ir_it002_17', taskId: 'it_002', assetId: 'asset_017', assetName: '咖啡机', assetNo: 'BJT-EL-2024-0017', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T11:00:00', remark: '' },
    { id: 'ir_it002_18', taskId: 'it_002', assetId: 'asset_018', assetName: '微波炉', assetNo: 'BJT-EL-2024-0018', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T11:15:00', remark: '' },
    { id: 'ir_it002_19', taskId: 'it_002', assetId: 'asset_019', assetName: '冰箱', assetNo: 'BJT-EL-2024-0019', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T14:00:00', remark: '' },
    { id: 'ir_it002_20', taskId: 'it_002', assetId: 'asset_020', assetName: '饮水机', assetNo: 'BJT-EL-2024-0020', status: 'normal' as const, checkedBy: '张明', checkedAt: '2024-03-06T14:15:00', remark: '' },
  ];

  result['it_003'] = [
    { id: 'ir_it003_01', taskId: 'it_003', assetId: 'asset_001', assetName: 'ThinkPad X1 Carbon', assetNo: 'BJT-IT-2023-0001', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T09:30:00', remark: '' },
    { id: 'ir_it003_02', taskId: 'it_003', assetId: 'asset_002', assetName: 'MacBook Pro 13', assetNo: 'BJT-IT-2023-0002', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T09:45:00', remark: '' },
    { id: 'ir_it003_03', taskId: 'it_003', assetId: 'asset_003', assetName: 'Dell 24寸显示器', assetNo: 'BJT-IT-2023-0003', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T10:00:00', remark: '' },
    { id: 'ir_it003_04', taskId: 'it_003', assetId: 'asset_004', assetName: 'HP打印机', assetNo: 'BJT-IT-2023-0004', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T10:15:00', remark: '' },
    { id: 'ir_it003_05', taskId: 'it_003', assetId: 'asset_005', assetName: '办公椅', assetNo: 'BJT-FN-2023-0005', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T10:30:00', remark: '' },
    { id: 'ir_it003_06', taskId: 'it_003', assetId: 'asset_006', assetName: '办公桌', assetNo: 'BJT-FN-2023-0006', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T10:45:00', remark: '' },
    { id: 'ir_it003_07', taskId: 'it_003', assetId: 'asset_007', assetName: 'Bose耳机', assetNo: 'BJT-EL-2023-0007', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T11:00:00', remark: '' },
    { id: 'ir_it003_08', taskId: 'it_003', assetId: 'asset_008', assetName: 'iPad Air', assetNo: 'BJT-IT-2023-0008', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-05T11:15:00', remark: '' },
    { id: 'ir_it003_09', taskId: 'it_003', assetId: 'asset_009', assetName: '投影仪', assetNo: 'BJT-IT-2023-0009', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T09:30:00', remark: '' },
    { id: 'ir_it003_10', taskId: 'it_003', assetId: 'asset_010', assetName: '麦克风', assetNo: 'BJT-EL-2023-0010', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T09:45:00', remark: '' },
    { id: 'ir_it003_11', taskId: 'it_003', assetId: 'asset_011', assetName: '白板', assetNo: 'BJT-FN-2023-0011', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T10:00:00', remark: '' },
    { id: 'ir_it003_12', taskId: 'it_003', assetId: 'asset_012', assetName: '空气净化器', assetNo: 'BJT-EL-2023-0012', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T10:15:00', remark: '' },
    { id: 'ir_it003_13', taskId: 'it_003', assetId: 'asset_013', assetName: '电话座机', assetNo: 'BJT-IT-2023-0013', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T10:30:00', remark: '' },
    { id: 'ir_it003_14', taskId: 'it_003', assetId: 'asset_014', assetName: '文件柜', assetNo: 'BJT-FN-2023-0014', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T10:45:00', remark: '' },
    { id: 'ir_it003_15', taskId: 'it_003', assetId: 'asset_015', assetName: '碎纸机', assetNo: 'BJT-EL-2023-0015', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-06T11:00:00', remark: '' },
    { id: 'ir_it003_16', taskId: 'it_003', assetId: 'asset_profit_01', assetName: '未登记扫描仪', assetNo: 'BJT-IT-2023-9001', status: 'profit', checkedBy: '李华', checkedAt: '2023-12-07T09:30:00', remark: '在财务室发现未登记扫描仪', processed: true, processType: 'add_asset', processRemark: '已补录为固定资产', processedAt: '2023-12-20T10:00:00', processedBy: '李华' },
    { id: 'ir_it003_17', taskId: 'it_003', assetId: 'asset_profit_02', assetName: '未登记微波炉', assetNo: 'BJT-EL-2023-9002', status: 'profit', checkedBy: '李华', checkedAt: '2023-12-07T10:00:00', remark: '茶水间发现的微波炉', processed: true, processType: 'ignore', processRemark: '员工私人用品，忽略', processedAt: '2023-12-20T10:30:00', processedBy: '李华' },
    { id: 'ir_it003_18', taskId: 'it_003', assetId: 'asset_018', assetName: '保险柜', assetNo: 'BJT-FN-2023-0018', status: 'normal', checkedBy: '李华', checkedAt: '2023-12-07T10:30:00', remark: '' },
  ];

  return result as Record<string, InventoryRecord[]>;
}

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
