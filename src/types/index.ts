export type AssetStatus = 'idle' | 'in_use' | 'maintenance' | 'transferred' | 'scrapping' | 'scrapped' | 'lost';

export type AssetCategory = 'computer' | 'furniture' | 'electronics' | 'vehicle' | 'other';

export type MaintenanceType = 'repair' | 'maintenance';

export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';

export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type InventoryStatus = 'pending' | 'in_progress' | 'completed';

export type ScrapStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface PurchaseVoucher {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  dataUrl?: string;
}

export interface Asset {
  id: string;
  assetNo: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  value: number;
  purchaseDate: string;
  departmentId: string;
  userId: string;
  location: string;
  description: string;
  warrantyPeriod: number;
  salvageValue: number;
  usefulLife: number;
  createdAt: string;
  updatedAt: string;
  vouchers?: PurchaseVoucher[];
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  departmentId: string;
  role: 'admin' | 'user' | 'finance';
  email: string;
  avatar?: string;
}

export interface AssetLog {
  id: string;
  assetId: string;
  action: string;
  operator: string;
  operatorId: string;
  createdAt: string;
  remark?: string;
  oldValue?: string;
  newValue?: string;
}

export interface MaintenanceOrder {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  cost: number;
  date: string;
  description: string;
  provider: string;
  operator: string;
  completedDate?: string;
}

export interface TransferOrder {
  id: string;
  assetId: string;
  assetName: string;
  assetNo: string;
  fromDeptId: string;
  fromDeptName: string;
  fromLocation?: string;
  toDeptId: string;
  toDeptName: string;
  toLocation?: string;
  originalStatus?: AssetStatus;
  status: TransferStatus;
  reason: string;
  applicant: string;
  applicantId: string;
  applyDate: string;
  approver?: string;
  approveDate?: string;
  approveRemark?: string;
}

export interface InventoryTask {
  id: string;
  name: string;
  status: InventoryStatus;
  totalAssets: number;
  checkedAssets: number;
  profitAssets: number;
  lossAssets: number;
  startDate: string;
  endDate?: string;
  creator: string;
  departmentIds: string[];
}

export interface InventoryRecord {
  id: string;
  taskId: string;
  assetId: string;
  assetName: string;
  assetNo: string;
  status: 'normal' | 'profit' | 'loss';
  checkedBy: string;
  checkedAt: string;
  remark?: string;
  processed?: boolean;
  processType?: 'ignore' | 'add_asset' | 'confirm_loss';
  processRemark?: string;
  processedAt?: string;
  processedBy?: string;
}

export interface AssetFilter {
  keyword?: string;
  status?: AssetStatus;
  category?: AssetCategory;
  departmentId?: string;
  userId?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ScrapOrder {
  id: string;
  assetId: string;
  assetName: string;
  assetNo: string;
  status: ScrapStatus;
  reason: string;
  estimatedSalvageValue: number;
  applicant: string;
  applicantId: string;
  applyDate: string;
  approver?: string;
  approveDate?: string;
  approveRemark?: string;
}

export const statusMap: Record<AssetStatus, { label: string; className: string }> = {
  idle: { label: '闲置', className: 'badge-idle' },
  in_use: { label: '在用', className: 'badge-in-use' },
  maintenance: { label: '维修中', className: 'badge-maintenance' },
  transferred: { label: '调拨中', className: 'badge-transferred' },
  scrapping: { label: '待报废', className: 'badge-scrapping' },
  scrapped: { label: '已报废', className: 'badge-scrapped' },
  lost: { label: '盘亏', className: 'badge-lost' },
};

export const categoryMap: Record<AssetCategory, { label: string; icon: string }> = {
  computer: { label: '办公设备', icon: 'Monitor' },
  furniture: { label: '办公家具', icon: 'Armchair' },
  electronics: { label: '电子设备', icon: 'Smartphone' },
  vehicle: { label: '车辆资产', icon: 'Car' },
  other: { label: '其他', icon: 'Package' },
};
