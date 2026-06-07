import { Asset, AssetStatus, AssetCategory } from '@/types';
import { generateId } from '@/utils/format';

function generateAssets(): Asset[] {
  const assets: Asset[] = [];
  const categories: AssetCategory[] = ['computer', 'furniture', 'electronics', 'vehicle', 'other'];
  const statuses: AssetStatus[] = ['idle', 'in_use', 'maintenance', 'transferred', 'scrapped', 'lost'];
  
  const assetNames: Record<AssetCategory, string[]> = {
    computer: ['笔记本电脑', '台式电脑', '显示器', '打印机', '投影仪', '服务器', '路由器', '交换机'],
    furniture: ['办公桌', '办公椅', '文件柜', '会议桌', '沙发', '茶几', '书柜', '衣柜'],
    electronics: ['手机', '平板', '相机', '耳机', '移动硬盘', 'U盘', '录音笔', '充电宝'],
    vehicle: ['公务轿车', '商务车', '货车', '电动车', '自行车'],
    other: ['空调', '饮水机', '微波炉', '冰箱', '咖啡机', '空气净化器'],
  };
  
  const locations = ['A栋3层', 'A栋5层', 'B栋2层', 'B栋4层', 'C栋1层', 'D栋3层', '仓库A区', '仓库B区'];
  
  for (let i = 0; i < 60; i++) {
    const category = categories[i % 5];
    const names = assetNames[category];
    const name = names[i % names.length] + (Math.floor(i / names.length) > 0 ? ` ${Math.floor(i / names.length) + 1}` : '');
    
    const year = 2023 + (i % 3);
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');
    
    const deptIndex = i % 8;
    const userIndex = i % 10;
    
    const statusIndex = i < 40 ? (i % 3 === 0 ? 0 : 1) : (i % 4) + 2;
    const status = statuses[statusIndex];
    
    const categoryCode = { computer: 'IT', furniture: 'FN', electronics: 'EL', vehicle: 'VH', other: 'OT' }[category];
    const seq = String(i + 1).padStart(4, '0');
    const assetNo = `BJT-${categoryCode}-${year}-${seq}`;
    
    const baseValue = {
      computer: [5000, 8000, 2000, 3000, 5000, 15000, 800, 2000][i % 8],
      furniture: [1500, 800, 1200, 3000, 2500, 800, 2000, 1500][i % 8],
      electronics: [4000, 3000, 6000, 500, 600, 100, 800, 200][i % 8],
      vehicle: [150000, 200000, 80000, 3000, 1500][i % 5],
      other: [3000, 500, 800, 2000, 1500, 1500][i % 6],
    }[category];
    
    const value = baseValue + Math.floor(Math.random() * 1000);
    const usefulLife = category === 'vehicle' ? 8 : category === 'furniture' ? 10 : 5;
    const salvageValue = Math.floor(value * 0.05);
    const warrantyPeriod = category === 'vehicle' ? 36 : 12;
    
    assets.push({
      id: `asset_${String(i + 1).padStart(3, '0')}`,
      assetNo,
      name,
      category,
      status,
      value,
      purchaseDate: `${year}-${month}-${day}`,
      departmentId: `dept_00${deptIndex + 1}`,
      userId: status === 'in_use' ? `user_00${userIndex + 1}` : '',
      location: locations[i % locations.length],
      description: `${name}，购置用于办公使用`,
      warrantyPeriod,
      salvageValue,
      usefulLife,
      createdAt: `${year}-${month}-${day}T09:00:00`,
      updatedAt: `${year}-${month}-${day}T09:00:00`,
    });
  }
  
  return assets;
}

export const initialAssets = generateAssets();
