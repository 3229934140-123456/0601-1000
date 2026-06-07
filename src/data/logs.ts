import { AssetLog } from '@/types';
import { generateId } from '@/utils/format';

export function generateAssetLogs(assetId: string, assetName: string): AssetLog[] {
  const logs: AssetLog[] = [
    {
      id: generateId(),
      assetId,
      action: '资产入库',
      operator: '张明',
      operatorId: 'user_001',
      createdAt: '2024-01-15T09:30:00',
      remark: '新购资产入库登记',
    },
    {
      id: generateId(),
      assetId,
      action: '信息更新',
      operator: '李华',
      operatorId: 'user_002',
      createdAt: '2024-01-16T14:20:00',
      remark: '更新资产存放位置',
      oldValue: 'A栋3层',
      newValue: 'B栋4层',
    },
    {
      id: generateId(),
      assetId,
      action: '资产领用',
      operator: '王强',
      operatorId: 'user_003',
      createdAt: '2024-02-01T10:00:00',
      remark: '日常办公使用',
      newValue: 'user_003',
    },
  ];
  
  return logs;
}
