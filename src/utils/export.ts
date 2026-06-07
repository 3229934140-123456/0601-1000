import { Asset, InventoryRecord, ScrapOrder, TransferOrder, MaintenanceOrder } from '@/types';
import { categoryMap, statusMap } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from './format';
import { getDepartmentName, getUserName } from '@/data/users';
import { calculateStraightLineDepreciation } from './depreciation';

export function downloadCSV(csvContent: string, filename: string) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAssetList(assets: Asset[], filename: string = '资产清单.csv') {
  const headers = [
    '资产编号',
    '资产名称',
    '资产分类',
    '资产状态',
    '资产价值',
    '购置日期',
    '所属部门',
    '使用人',
    '存放位置',
    '保修期限(月)',
    '使用年限(年)',
    '预计残值',
    '创建时间',
    '更新时间',
    '备注',
  ];

  const rows = assets.map((asset) => [
    asset.assetNo,
    asset.name,
    categoryMap[asset.category]?.label || asset.category,
    statusMap[asset.status]?.label || asset.status,
    formatCurrency(asset.value),
    formatDate(asset.purchaseDate),
    getDepartmentName(asset.departmentId),
    getUserName(asset.userId),
    asset.location,
    asset.warrantyPeriod,
    asset.usefulLife,
    formatCurrency(asset.salvageValue),
    formatDateTime(asset.createdAt),
    formatDateTime(asset.updatedAt),
    asset.description,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
}

export function exportDepreciationReport(assets: Asset[], filename: string = '折旧明细表.csv') {
  const headers = [
    '资产编号',
    '资产名称',
    '资产分类',
    '原值',
    '预计残值',
    '使用年限(年)',
    '购置日期',
    '月折旧额',
    '累计折旧',
    '净值',
    '已使用月数',
    '剩余月数',
  ];

  const rows = assets.map((asset) => {
    const dep = calculateStraightLineDepreciation({
      originalValue: asset.value,
      salvageValue: asset.salvageValue,
      usefulLife: asset.usefulLife,
      purchaseDate: asset.purchaseDate,
    });
    return [
      asset.assetNo,
      asset.name,
      categoryMap[asset.category]?.label || asset.category,
      formatCurrency(asset.value),
      formatCurrency(asset.salvageValue),
      asset.usefulLife,
      formatDate(asset.purchaseDate),
      formatCurrency(dep.monthlyDepreciation),
      formatCurrency(dep.accumulatedDepreciation),
      formatCurrency(dep.netValue),
      dep.monthsUsed,
      dep.remainingMonths,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
}

export function exportInventoryReport(
  taskName: string,
  records: InventoryRecord[],
  filename: string = '盘点报告.csv'
) {
  const totalCount = records.length;
  const normalCount = records.filter((r) => r.status === 'normal').length;
  const profitCount = records.filter((r) => r.status === 'profit').length;
  const lossCount = records.filter((r) => r.status === 'loss').length;
  const processedCount = records.filter((r) => r.processed).length;
  const pendingCount = records.filter((r) => !r.processed && (r.status === 'profit' || r.status === 'loss')).length;

  const summaryRows = [
    ['===== 盘点汇总 ====='],
    ['盘点任务', taskName],
    ['资产总数', totalCount],
    ['正常', normalCount],
    ['盘盈', profitCount],
    ['盘亏', lossCount],
    ['已处理', processedCount],
    ['未处理', pendingCount],
    ['导出时间', formatDateTime(new Date().toISOString())],
    [''],
  ];

  const detailHeaders = [
    '资产编号',
    '资产名称',
    '盘点状态',
    '盘点人',
    '盘点时间',
    '备注',
    '处理状态',
    '处理方式',
    '处理人',
    '处理时间',
    '处理备注',
  ];

  const statusMap: Record<string, string> = {
    normal: '正常',
    profit: '盘盈',
    loss: '盘亏',
  };

  const processTypeMap: Record<string, string> = {
    ignore: '忽略',
    add_asset: '补录资产',
    confirm_loss: '确认盘亏',
  };

  const detailRows = records.map((record) => [
    record.assetNo,
    record.assetName,
    statusMap[record.status] || record.status,
    record.checkedBy || '',
    record.checkedAt ? formatDateTime(record.checkedAt) : '',
    record.remark || '',
    record.processed ? '已处理' : '未处理',
    record.processType ? (processTypeMap[record.processType] || record.processType) : '',
    record.processedBy || '',
    record.processedAt ? formatDateTime(record.processedAt) : '',
    record.processRemark || '',
  ]);

  const allRows = [
    ...summaryRows,
    ['===== 盘点明细 ====='],
    detailHeaders,
    ...detailRows,
  ];

  const csvContent = allRows
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
}

export function exportTransferOrders(
  orders: TransferOrder[],
  filename: string = '调拨记录.csv'
) {
  const headers = [
    '资产编号',
    '资产名称',
    '调出部门',
    '调入部门',
    '申请状态',
    '调拨原因',
    '申请人',
    '申请日期',
    '审批人',
    '审批日期',
    '审批备注',
  ];

  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    completed: '已完成',
  };

  const rows = orders.map((order) => [
    order.assetNo,
    order.assetName,
    order.fromDeptName,
    order.toDeptName,
    statusMap[order.status] || order.status,
    order.reason,
    order.applicant,
    formatDate(order.applyDate),
    order.approver || '',
    order.approveDate ? formatDate(order.approveDate) : '',
    order.approveRemark || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
}

export function exportMaintenanceOrders(
  orders: MaintenanceOrder[],
  filename: string = '维修工单.csv'
) {
  const headers = [
    '资产名称',
    '工单类型',
    '工单状态',
    '费用',
    '日期',
    '描述',
    '服务商',
    '操作人',
    '完成日期',
  ];

  const typeMap: Record<string, string> = {
    repair: '维修',
    maintenance: '保养',
  };

  const statusMap: Record<string, string> = {
    pending: '待处理',
    in_progress: '维修中',
    completed: '已完成',
  };

  const rows = orders.map((order) => [
    order.assetName,
    typeMap[order.type] || order.type,
    statusMap[order.status] || order.status,
    formatCurrency(order.cost),
    formatDate(order.date),
    order.description,
    order.provider,
    order.operator,
    order.completedDate ? formatDate(order.completedDate) : '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
}

export function exportScrapOrders(
  orders: ScrapOrder[],
  filename: string = '报废清单.csv'
) {
  const headers = [
    '资产编号',
    '资产名称',
    '申请状态',
    '报废原因',
    '预计残值',
    '申请人',
    '申请日期',
    '审批人',
    '审批日期',
    '审批备注',
  ];

  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    completed: '已完成',
  };

  const rows = orders.map((order) => [
    order.assetNo,
    order.assetName,
    statusMap[order.status] || order.status,
    order.reason,
    formatCurrency(order.estimatedSalvageValue),
    order.applicant,
    formatDate(order.applyDate),
    order.approver || '',
    order.approveDate ? formatDate(order.approveDate) : '',
    order.approveRemark || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
}
