import { create } from 'zustand';
import {
  Asset,
  AssetFilter,
  AssetStatus,
  AssetCategory,
  AssetLog,
  MaintenanceOrder,
  TransferOrder,
  InventoryTask,
  InventoryRecord,
  ScrapOrder,
  PurchaseVoucher,
} from '@/types';
import { initialAssets } from '@/data/assets';
import { maintenanceOrders as initialMaintenanceOrders } from '@/data/maintenance';
import { transferOrders as initialTransferOrders } from '@/data/transfers';
import { inventoryTasks as initialInventoryTasks } from '@/inventory/inventory';
import { getStorage, setStorage } from '@/utils/storage';
import { generateAssetNo, getNextSequence } from '@/utils/assetNo';
import { generateId } from '@/utils/format';
import { getDepartmentName } from '@/data/users';

interface AssetState {
  assets: Asset[];
  assetLogs: Record<string, AssetLog[]>;
  maintenanceOrders: MaintenanceOrder[];
  transferOrders: TransferOrder[];
  inventoryTasks: InventoryTask[];
  inventoryRecords: Record<string, InventoryRecord[]>;
  scrapOrders: ScrapOrder[];
  filters: AssetFilter;
  selectedAssetIds: string[];
  currentPage: number;
  pageSize: number;

  setFilters: (filters: Partial<AssetFilter>) => void;
  setCurrentPage: (page: number) => void;
  toggleAssetSelection: (assetId: string) => void;
  clearSelection: () => void;
  selectAll: (assetIds: string[]) => void;

  addAsset: (asset: Omit<Asset, 'id' | 'assetNo' | 'createdAt' | 'updatedAt'>) => string;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  bulkAddAssets: (
    assets: Array<Omit<Asset, 'id' | 'assetNo' | 'createdAt' | 'updatedAt'>>
  ) => { success: number; failed: number; errors: string[] };
  bulkUpdateStatus: (ids: string[], status: AssetStatus) => void;

  addVoucher: (assetId: string, voucher: Omit<PurchaseVoucher, 'id' | 'uploadTime'>) => void;
  removeVoucher: (assetId: string, voucherId: string) => void;

  addLog: (assetId: string, log: Omit<AssetLog, 'id' | 'assetId' | 'createdAt'>) => void;
  getLogs: (assetId: string) => AssetLog[];

  addMaintenanceOrder: (order: Omit<MaintenanceOrder, 'id'>) => void;
  updateMaintenanceOrder: (id: string, updates: Partial<MaintenanceOrder>) => void;

  addTransferOrder: (order: Omit<TransferOrder, 'id'>) => void;
  updateTransferOrder: (id: string, updates: Partial<TransferOrder>) => void;
  bulkTransfer: (ids: string[], toDeptId: string, toDeptName: string, reason: string) => void;

  submitScrapOrder: (
    assetId: string,
    reason: string,
    estimatedSalvageValue: number
  ) => void;
  approveScrapOrder: (id: string, remark?: string) => void;
  rejectScrapOrder: (id: string, remark: string) => void;
  bulkSubmitScrap: (
    ids: string[],
    reason: string,
    estimatedSalvageValue: number
  ) => void;

  createInventoryTask: (task: Omit<InventoryTask, 'id' | 'status' | 'totalAssets' | 'checkedAssets' | 'profitAssets' | 'lossAssets'>) => string;
  startInventoryTask: (id: string) => void;
  checkInventoryAsset: (taskId: string, assetNo: string) => { success: boolean; message: string; record?: InventoryRecord };
  completeInventoryTask: (id: string) => void;
  getInventoryRecords: (taskId: string) => InventoryRecord[];
  processInventoryProfit: (taskId: string, recordId: string, processType: 'ignore' | 'add_asset', assetData?: Partial<Asset>) => void;
  processInventoryLoss: (taskId: string, recordId: string, processType: 'confirm_loss', remark?: string) => void;

  getFilteredAssets: () => { items: Asset[]; total: number };
  getAssetById: (id: string) => Asset | undefined;
  getAssetStats: () => {
    total: number;
    totalValue: number;
    idleCount: number;
    inUseCount: number;
    maintenanceCount: number;
    scrappedCount: number;
    scrappingCount: number;
  };
}

const STORAGE_KEY = 'asset_data_v2';

function loadInitialData() {
  const saved = getStorage<{
    assets: Asset[];
    maintenanceOrders: MaintenanceOrder[];
    transferOrders: TransferOrder[];
    inventoryTasks: InventoryTask[];
    inventoryRecords: Record<string, InventoryRecord[]>;
    scrapOrders: ScrapOrder[];
    assetLogs: Record<string, AssetLog[]>;
  } | null>(STORAGE_KEY, null);

  if (saved) {
    return saved;
  }

  return {
    assets: initialAssets,
    maintenanceOrders: initialMaintenanceOrders,
    transferOrders: initialTransferOrders,
    inventoryTasks: initialInventoryTasks,
    inventoryRecords: {},
    scrapOrders: [],
    assetLogs: {},
  };
}

function saveData(state: Partial<AssetState>) {
  setStorage(STORAGE_KEY, {
    assets: state.assets || [],
    maintenanceOrders: state.maintenanceOrders || [],
    transferOrders: state.transferOrders || [],
    inventoryTasks: state.inventoryTasks || [],
    inventoryRecords: state.inventoryRecords || {},
    scrapOrders: state.scrapOrders || [],
    assetLogs: state.assetLogs || {},
  });
}

const initialData = loadInitialData();

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: initialData.assets,
  assetLogs: initialData.assetLogs || {},
  maintenanceOrders: initialData.maintenanceOrders,
  transferOrders: initialData.transferOrders,
  inventoryTasks: initialData.inventoryTasks,
  inventoryRecords: initialData.inventoryRecords || {},
  scrapOrders: initialData.scrapOrders || [],
  filters: {},
  selectedAssetIds: [],
  currentPage: 1,
  pageSize: 10,

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1,
    }));
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  toggleAssetSelection: (assetId) => {
    set((state) => {
      const selected = state.selectedAssetIds.includes(assetId)
        ? state.selectedAssetIds.filter((id) => id !== assetId)
        : [...state.selectedAssetIds, assetId];
      return { selectedAssetIds: selected };
    });
  },

  clearSelection: () => set({ selectedAssetIds: [] }),

  selectAll: (assetIds) => set({ selectedAssetIds: assetIds }),

  addAsset: (asset) => {
    const state = get();
    const existingNos = state.assets.map((a) => a.assetNo);
    const seq = getNextSequence(existingNos, asset.category);
    const assetNo = generateAssetNo(asset.category, seq);
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id: `asset_${generateId()}`,
      assetNo,
      createdAt: now,
      updatedAt: now,
      vouchers: [],
    };

    const newAssets = [newAsset, ...state.assets];
    const newLogs = {
      ...state.assetLogs,
      [newAsset.id]: [
        {
          id: generateId(),
          assetId: newAsset.id,
          action: '资产入库',
          operator: '张明',
          operatorId: 'user_001',
          createdAt: now,
          remark: `资产${newAsset.name}入库，编号${newAsset.assetNo}`,
        },
        ...(state.assetLogs[newAsset.id] || []),
      ],
    };

    const newState = {
      ...state,
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
    return newAsset.id;
  },

  updateAsset: (id, updates) => {
    const state = get();
    const newAssets = state.assets.map((a) =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );

    const newState = { ...state, assets: newAssets };
    saveData(newState);
    set(newState);
  },

  deleteAsset: (id) => {
    const state = get();
    const newAssets = state.assets.filter((a) => a.id !== id);

    const newState = { ...state, assets: newAssets };
    saveData(newState);
    set(newState);
  },

  bulkAddAssets: (assetList) => {
    const state = get();
    const errors: string[] = [];
    const newAssets: Asset[] = [];
    const newLogs: Record<string, AssetLog[]> = { ...state.assetLogs };
    let existingNos = state.assets.map((a) => a.assetNo);

    assetList.forEach((asset, index) => {
      try {
        if (!asset.name) {
          errors.push(`第${index + 1}行：资产名称不能为空`);
          return;
        }
        if (!asset.category) {
          errors.push(`第${index + 1}行：资产分类不能为空`);
          return;
        }
        if (!asset.value || asset.value <= 0) {
          errors.push(`第${index + 1}行：资产价值必须大于0`);
          return;
        }
        if (!asset.purchaseDate) {
          errors.push(`第${index + 1}行：购置日期不能为空`);
          return;
        }

        const seq = getNextSequence(existingNos, asset.category);
        const assetNo = generateAssetNo(asset.category, seq);
        existingNos.push(assetNo);
        const now = new Date().toISOString();

        const newAsset: Asset = {
          ...asset,
          id: `asset_${generateId()}`,
          assetNo,
          createdAt: now,
          updatedAt: now,
          vouchers: [],
        };

        newAssets.push(newAsset);
        newLogs[newAsset.id] = [
          {
            id: generateId(),
            assetId: newAsset.id,
            action: '批量入库',
            operator: '张明',
            operatorId: 'user_001',
            createdAt: now,
            remark: `通过批量导入入库，编号${newAsset.assetNo}`,
          },
        ];
      } catch (e) {
        errors.push(`第${index + 1}行：数据格式错误`);
      }
    });

    const newState = {
      ...state,
      assets: [...newAssets, ...state.assets],
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);

    return {
      success: newAssets.length,
      failed: errors.length,
      errors,
    };
  },

  bulkUpdateStatus: (ids, status) => {
    const state = get();
    const now = new Date().toISOString();
    const newAssets = state.assets.map((a) =>
      ids.includes(a.id) ? { ...a, status, updatedAt: now } : a
    );

    const newLogs = { ...state.assetLogs };
    ids.forEach((id) => {
      const asset = state.assets.find((a) => a.id === id);
      if (asset) {
        newLogs[id] = [
          {
            id: generateId(),
            assetId: id,
            action: '状态变更',
            operator: '张明',
            operatorId: 'user_001',
            createdAt: now,
            oldValue: asset.status,
            newValue: status,
            remark: `状态从${asset.status}变更为${status}`,
          },
          ...(newLogs[id] || []),
        ];
      }
    });

    const newState = {
      ...state,
      assets: newAssets,
      selectedAssetIds: [],
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  addVoucher: (assetId, voucher) => {
    const state = get();
    const now = new Date().toISOString();
    const newVoucher: PurchaseVoucher = {
      ...voucher,
      id: `voucher_${generateId()}`,
      uploadTime: now,
    };

    const newAssets = state.assets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          vouchers: [...(a.vouchers || []), newVoucher],
          updatedAt: now,
        };
      }
      return a;
    });

    const newLogs = { ...state.assetLogs };
    newLogs[assetId] = [
      {
        id: generateId(),
        assetId,
        action: '上传凭证',
        operator: '张明',
        operatorId: 'user_001',
        createdAt: now,
        remark: `上传购置凭证：${voucher.name}`,
      },
      ...(newLogs[assetId] || []),
    ];

    const newState = { ...state, assets: newAssets, assetLogs: newLogs };
    saveData(newState);
    set(newState);
  },

  removeVoucher: (assetId, voucherId) => {
    const state = get();
    const now = new Date().toISOString();

    const newAssets = state.assets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          vouchers: (a.vouchers || []).filter((v) => v.id !== voucherId),
          updatedAt: now,
        };
      }
      return a;
    });

    const newState = { ...state, assets: newAssets };
    saveData(newState);
    set(newState);
  },

  addLog: (assetId, log) => {
    set((state) => {
      const logs = state.assetLogs[assetId] || [];
      const newLog: AssetLog = {
        ...log,
        id: generateId(),
        assetId,
        createdAt: new Date().toISOString(),
      };
      return {
        assetLogs: {
          ...state.assetLogs,
          [assetId]: [newLog, ...logs],
        },
      };
    });
  },

  getLogs: (assetId) => {
    return get().assetLogs[assetId] || [];
  },

  addMaintenanceOrder: (order) => {
    const state = get();
    const newOrder: MaintenanceOrder = {
      ...order,
      id: `mo_${generateId()}`,
    };

    const newState = {
      ...state,
      maintenanceOrders: [newOrder, ...state.maintenanceOrders],
    };
    saveData(newState);
    set(newState);
  },

  updateMaintenanceOrder: (id, updates) => {
    const state = get();
    const newOrders = state.maintenanceOrders.map((o) =>
      o.id === id ? { ...o, ...updates } : o
    );

    const newState = { ...state, maintenanceOrders: newOrders };
    saveData(newState);
    set(newState);
  },

  addTransferOrder: (order) => {
    const state = get();
    const now = new Date().toISOString();
    const asset = state.assets.find((a) => a.id === order.assetId);
    const newOrder: TransferOrder = {
      ...order,
      id: `to_${generateId()}`,
      fromLocation: asset?.location,
      originalStatus: asset?.status,
    };

    const newAssets = state.assets.map((a) =>
      a.id === order.assetId ? { ...a, status: 'transferred' as AssetStatus, updatedAt: now } : a
    );

    const newLogs = { ...state.assetLogs };
    if (order.assetId) {
      newLogs[order.assetId] = [
        {
          id: generateId(),
          assetId: order.assetId,
          action: '发起调拨',
          operator: order.applicant,
          operatorId: order.applicantId,
          createdAt: now,
          remark: `调拨至${order.toDeptName}${order.toLocation ? `，存放位置：${order.toLocation}` : ''}，原因：${order.reason}`,
        },
        ...(newLogs[order.assetId] || []),
      ];
    }

    const newState = {
      ...state,
      transferOrders: [newOrder, ...state.transferOrders],
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  updateTransferOrder: (id, updates) => {
    const state = get();
    const now = new Date().toISOString();
    const order = state.transferOrders.find((o) => o.id === id);

    if (!order) return;

    const newOrders = state.transferOrders.map((o) =>
      o.id === id ? { ...o, ...updates } : o
    );

    let newAssets = state.assets;
    let newLogs = { ...state.assetLogs };

    if (updates.status === 'approved') {
      newLogs[order.assetId] = [
        {
          id: generateId(),
          assetId: order.assetId,
          action: '调拨批准',
          operator: updates.approver || '张明',
          operatorId: 'user_001',
          createdAt: now,
          remark: `调拨申请已批准，待调入部门确认接收`,
        },
        ...(newLogs[order.assetId] || []),
      ];
    }

    if (updates.status === 'rejected') {
      newAssets = state.assets.map((a) => {
        if (a.id === order.assetId) {
          const originalStatus = order.originalStatus || 'idle';
          return { ...a, status: originalStatus as AssetStatus, updatedAt: now };
        }
        return a;
      });
      newLogs[order.assetId] = [
        {
          id: generateId(),
          assetId: order.assetId,
          action: '调拨拒绝',
          operator: updates.approver || '张明',
          operatorId: 'user_001',
          createdAt: now,
          remark: `调拨申请被拒绝，原因：${updates.approveRemark || '未填写'}，资产恢复${order.originalStatus === 'in_use' ? '在用' : '闲置'}状态`,
        },
        ...(newLogs[order.assetId] || []),
      ];
    }

    if (updates.status === 'completed') {
      newAssets = state.assets.map((a) =>
        a.id === order.assetId
          ? {
              ...a,
              departmentId: order.toDeptId,
              location: order.toLocation || a.location,
              status: order.originalStatus === 'in_use' ? 'in_use' as AssetStatus : 'idle' as AssetStatus,
              updatedAt: now,
            }
          : a
      );
      newLogs[order.assetId] = [
        {
          id: generateId(),
          assetId: order.assetId,
          action: '调拨完成',
          operator: '系统',
          operatorId: 'system',
          createdAt: now,
          oldValue: order.fromDeptName,
          newValue: order.toDeptName,
          remark: `资产从${order.fromDeptName}调拨至${order.toDeptName}${order.toLocation ? `，存放位置：${order.toLocation}` : ''}`,
        },
        ...(newLogs[order.assetId] || []),
      ];
    }

    const newState = {
      ...state,
      transferOrders: newOrders,
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  bulkTransfer: (ids, toDeptId, toDeptName, reason) => {
    const state = get();
    const now = new Date().toISOString();
    const newTransferOrders: TransferOrder[] = [];
    let newAssets = [...state.assets];
    const newLogs = { ...state.assetLogs };

    ids.forEach((id) => {
      const asset = state.assets.find((a) => a.id === id);
      if (asset && (asset.status === 'idle' || asset.status === 'in_use')) {
        const fromDeptName = getDepartmentName(asset.departmentId);
        const order: TransferOrder = {
          id: `to_${generateId()}`,
          assetId: id,
          assetName: asset.name,
          assetNo: asset.assetNo,
          fromDeptId: asset.departmentId,
          fromDeptName,
          fromLocation: asset.location,
          toDeptId,
          toDeptName,
          originalStatus: asset.status,
          status: 'pending',
          reason,
          applicant: '张明',
          applicantId: 'user_001',
          applyDate: now.split('T')[0],
        };
        newTransferOrders.push(order);

        newAssets = newAssets.map((a) =>
          a.id === id ? { ...a, status: 'transferred' as AssetStatus, updatedAt: now } : a
        );

        newLogs[id] = [
          {
            id: generateId(),
            assetId: id,
            action: '批量调拨',
            operator: '张明',
            operatorId: 'user_001',
            createdAt: now,
            remark: `批量调拨至${toDeptName}，原因：${reason}`,
          },
          ...(newLogs[id] || []),
        ];
      }
    });

    const newState = {
      ...state,
      transferOrders: [...newTransferOrders, ...state.transferOrders],
      assets: newAssets,
      selectedAssetIds: [],
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  submitScrapOrder: (assetId, reason, estimatedSalvageValue) => {
    const state = get();
    const now = new Date().toISOString();
    const asset = state.assets.find((a) => a.id === assetId);

    if (!asset) return;

    const scrapOrder: ScrapOrder = {
      id: `scrap_${generateId()}`,
      assetId,
      assetName: asset.name,
      assetNo: asset.assetNo,
      status: 'pending',
      reason,
      estimatedSalvageValue,
      applicant: '张明',
      applicantId: 'user_001',
      applyDate: now.split('T')[0],
    };

    const newAssets = state.assets.map((a) =>
      a.id === assetId ? { ...a, status: 'scrapping' as AssetStatus, updatedAt: now } : a
    );

    const newLogs = { ...state.assetLogs };
    newLogs[assetId] = [
      {
        id: generateId(),
        assetId,
        action: '提交报废',
        operator: '张明',
        operatorId: 'user_001',
        createdAt: now,
        remark: `提交报废申请，原因：${reason}，预计残值：${estimatedSalvageValue}`,
      },
      ...(newLogs[assetId] || []),
    ];

    const newState = {
      ...state,
      scrapOrders: [scrapOrder, ...state.scrapOrders],
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  approveScrapOrder: (id, remark) => {
    const state = get();
    const now = new Date().toISOString();
    const order = state.scrapOrders.find((o) => o.id === id);

    if (!order) return;

    const newOrders = state.scrapOrders.map((o) =>
      o.id === id
        ? { ...o, status: 'approved' as const, approver: '张明', approveDate: now.split('T')[0], approveRemark: remark }
        : o
    );

    const newAssets = state.assets.map((a) =>
      a.id === order.assetId ? { ...a, status: 'scrapped' as AssetStatus, updatedAt: now } : a
    );

    const newLogs = { ...state.assetLogs };
    newLogs[order.assetId] = [
      {
        id: generateId(),
        assetId: order.assetId,
        action: '报废批准',
        operator: '张明',
        operatorId: 'user_001',
        createdAt: now,
        remark: `报废申请已批准${remark ? `，备注：${remark}` : ''}`,
      },
      ...(newLogs[order.assetId] || []),
    ];

    const newState = {
      ...state,
      scrapOrders: newOrders,
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  rejectScrapOrder: (id, remark) => {
    const state = get();
    const now = new Date().toISOString();
    const order = state.scrapOrders.find((o) => o.id === id);

    if (!order) return;

    const newOrders = state.scrapOrders.map((o) =>
      o.id === id
        ? { ...o, status: 'rejected' as const, approver: '张明', approveDate: now.split('T')[0], approveRemark: remark }
        : o
    );

    const newAssets = state.assets.map((a) =>
      a.id === order.assetId ? { ...a, status: 'idle' as AssetStatus, updatedAt: now } : a
    );

    const newLogs = { ...state.assetLogs };
    newLogs[order.assetId] = [
      {
        id: generateId(),
        assetId: order.assetId,
        action: '报废拒绝',
        operator: '张明',
        operatorId: 'user_001',
        createdAt: now,
        remark: `报废申请被拒绝，原因：${remark}`,
      },
      ...(newLogs[order.assetId] || []),
    ];

    const newState = {
      ...state,
      scrapOrders: newOrders,
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  bulkSubmitScrap: (ids, reason, estimatedSalvageValue) => {
    const state = get();
    const now = new Date().toISOString();
    const newScrapOrders: ScrapOrder[] = [];
    let newAssets = [...state.assets];
    const newLogs = { ...state.assetLogs };

    ids.forEach((id) => {
      const asset = state.assets.find((a) => a.id === id);
      if (asset && asset.status !== 'scrapped' && asset.status !== 'scrapping') {
        const scrapOrder: ScrapOrder = {
          id: `scrap_${generateId()}`,
          assetId: id,
          assetName: asset.name,
          assetNo: asset.assetNo,
          status: 'pending',
          reason,
          estimatedSalvageValue,
          applicant: '张明',
          applicantId: 'user_001',
          applyDate: now.split('T')[0],
        };
        newScrapOrders.push(scrapOrder);

        newAssets = newAssets.map((a) =>
          a.id === id ? { ...a, status: 'scrapping' as AssetStatus, updatedAt: now } : a
        );

        newLogs[id] = [
          {
            id: generateId(),
            assetId: id,
            action: '批量报废申请',
            operator: '张明',
            operatorId: 'user_001',
            createdAt: now,
            remark: `批量提交报废申请，原因：${reason}`,
          },
          ...(newLogs[id] || []),
        ];
      }
    });

    const newState = {
      ...state,
      scrapOrders: [...newScrapOrders, ...state.scrapOrders],
      assets: newAssets,
      selectedAssetIds: [],
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  createInventoryTask: (task) => {
    const state = get();
    const now = new Date().toISOString();

    let totalAssets = 0;
    if (task.departmentIds.length > 0) {
      totalAssets = state.assets.filter(
        (a) =>
          task.departmentIds.includes(a.departmentId) &&
          a.status !== 'scrapped' &&
          a.status !== 'lost'
      ).length;
    } else {
      totalAssets = state.assets.filter(
        (a) => a.status !== 'scrapped' && a.status !== 'lost'
      ).length;
    }

    const newTask: InventoryTask = {
      ...task,
      id: `it_${generateId()}`,
      status: 'pending',
      totalAssets,
      checkedAssets: 0,
      profitAssets: 0,
      lossAssets: 0,
    };

    const records: InventoryRecord[] = [];
    let assetsToCheck = state.assets.filter(
      (a) => a.status !== 'scrapped' && a.status !== 'lost'
    );
    if (task.departmentIds.length > 0) {
      assetsToCheck = assetsToCheck.filter((a) =>
        task.departmentIds.includes(a.departmentId)
      );
    }

    assetsToCheck.forEach((asset) => {
      records.push({
        id: `ir_${newTask.id}_${asset.id}`,
        taskId: newTask.id,
        assetId: asset.id,
        assetName: asset.name,
        assetNo: asset.assetNo,
        status: 'normal',
        checkedBy: '',
        checkedAt: '',
        remark: '',
      });
    });

    const newState = {
      ...state,
      inventoryTasks: [newTask, ...state.inventoryTasks],
      inventoryRecords: {
        ...state.inventoryRecords,
        [newTask.id]: records,
      },
    };
    saveData(newState);
    set(newState);
    return newTask.id;
  },

  startInventoryTask: (id) => {
    const state = get();
    const now = new Date().toISOString();

    const newTasks = state.inventoryTasks.map((t) =>
      t.id === id ? { ...t, status: 'in_progress' as const, startDate: now.split('T')[0] } : t
    );

    const newState = { ...state, inventoryTasks: newTasks };
    saveData(newState);
    set(newState);
  },

  checkInventoryAsset: (taskId, assetNo) => {
    const state = get();
    const records = state.inventoryRecords[taskId] || [];
    const task = state.inventoryTasks.find((t) => t.id === taskId);

    if (!task) {
      return { success: false, message: '盘点任务不存在' };
    }

    const record = records.find((r) => r.assetNo === assetNo);

    if (!record) {
      const newRecord: InventoryRecord = {
        id: `ir_${taskId}_${generateId()}`,
        taskId,
        assetId: `profit_${generateId()}`,
        assetName: `盘盈资产(${assetNo})`,
        assetNo,
        status: 'profit',
        checkedBy: '张明',
        checkedAt: new Date().toISOString(),
        remark: '扫码发现未登记资产',
      };

      const newRecords = [...records, newRecord];
      const newTasks = state.inventoryTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checkedAssets: t.checkedAssets + 1,
              profitAssets: t.profitAssets + 1,
            }
          : t
      );

      const newState = {
        ...state,
        inventoryRecords: {
          ...state.inventoryRecords,
          [taskId]: newRecords,
        },
        inventoryTasks: newTasks,
      };
      saveData(newState);
      set(newState);

      return {
        success: true,
        message: `盘盈资产：${newRecord.assetName}`,
        record: newRecord,
      };
    }

    if (record.checkedAt) {
      return { success: false, message: '该资产已盘点过' };
    }

    const now = new Date().toISOString();
    const updatedRecord = { ...record, checkedBy: '张明', checkedAt: now };
    const newRecords = records.map((r) => (r.id === record.id ? updatedRecord : r));
    const newTasks = state.inventoryTasks.map((t) =>
      t.id === taskId ? { ...t, checkedAssets: t.checkedAssets + 1 } : t
    );

    const newState = {
      ...state,
      inventoryRecords: {
        ...state.inventoryRecords,
        [taskId]: newRecords,
      },
      inventoryTasks: newTasks,
    };
    saveData(newState);
    set(newState);

    return {
      success: true,
      message: `盘点成功：${record.assetName}`,
      record: updatedRecord,
    };
  },

  completeInventoryTask: (id) => {
    const state = get();
    const now = new Date().toISOString();
    const records = state.inventoryRecords[id] || [];

    const profitCount = records.filter((r) => r.status === 'profit').length;
    const lossCount = records.filter((r) => !r.checkedAt).length;

    const updatedRecords = records.map((r) => {
      if (!r.checkedAt) {
        return { ...r, status: 'loss' as const, checkedBy: '系统', checkedAt: now, remark: '盘点未找到' };
      }
      return r;
    });

    const newTasks = state.inventoryTasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'completed' as const,
            endDate: now.split('T')[0],
            profitAssets: profitCount,
            lossAssets: lossCount,
            checkedAssets: t.totalAssets - lossCount + profitCount,
          }
        : t
    );

    const newState = {
      ...state,
      inventoryTasks: newTasks,
      inventoryRecords: {
        ...state.inventoryRecords,
        [id]: updatedRecords,
      },
    };
    saveData(newState);
    set(newState);
  },

  getInventoryRecords: (taskId) => {
    return get().inventoryRecords[taskId] || [];
  },

  processInventoryProfit: (taskId, recordId, processType, assetData) => {
    const state = get();
    const now = new Date().toISOString();
    const records = state.inventoryRecords[taskId] || [];
    const record = records.find((r) => r.id === recordId);

    if (!record || record.status !== 'profit' || record.processed) return;

    let newAssets = [...state.assets];
    let newLogs = { ...state.assetLogs };
    let newAssetId = '';

    if (processType === 'add_asset' && assetData) {
      const newAsset: Asset = {
        id: `asset_${generateId()}`,
        assetNo: assetData.assetNo || record.assetNo,
        name: assetData.name || record.assetName,
        category: (assetData.category as AssetCategory) || 'other',
        status: 'idle',
        value: assetData.value || 0,
        purchaseDate: assetData.purchaseDate || now.split('T')[0],
        departmentId: assetData.departmentId || 'dept_001',
        userId: '',
        location: assetData.location || '',
        description: assetData.description || `盘盈资产，来源：盘点任务${taskId}`,
        warrantyPeriod: assetData.warrantyPeriod || 12,
        salvageValue: assetData.salvageValue || 0,
        usefulLife: assetData.usefulLife || 5,
        vouchers: [],
        createdAt: now,
        updatedAt: now,
      };
      newAssets = [newAsset, ...newAssets];
      newAssetId = newAsset.id;

      newLogs[newAsset.id] = [
        {
          id: generateId(),
          assetId: newAsset.id,
          action: '盘盈补录',
          operator: '张明',
          operatorId: 'user_001',
          createdAt: now,
          remark: `盘点任务盘盈补录，原资产编号：${record.assetNo}`,
        },
      ];
    }

    const updatedRecords = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            processed: true,
            processType,
            processRemark: processType === 'add_asset' ? '已补录为新资产' : '已忽略',
            processedAt: now,
            processedBy: '张明',
          }
        : r
    );

    const newState = {
      ...state,
      inventoryRecords: {
        ...state.inventoryRecords,
        [taskId]: updatedRecords,
      },
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  processInventoryLoss: (taskId, recordId, processType, remark) => {
    const state = get();
    const now = new Date().toISOString();
    const records = state.inventoryRecords[taskId] || [];
    const record = records.find((r) => r.id === recordId);

    if (!record || record.status !== 'loss' || record.processed) return;

    let newAssets = state.assets;
    let newLogs = { ...state.assetLogs };

    if (processType === 'confirm_loss') {
      newAssets = state.assets.map((a) => {
        if (a.id === record.assetId) {
          return { ...a, status: 'lost' as AssetStatus, updatedAt: now };
        }
        return a;
      });

      newLogs[record.assetId] = [
        {
          id: generateId(),
          assetId: record.assetId,
          action: '确认盘亏',
          operator: '张明',
          operatorId: 'user_001',
          createdAt: now,
          remark: remark || '盘点确认盘亏',
        },
        ...(newLogs[record.assetId] || []),
      ];
    }

    const updatedRecords = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            processed: true,
            processType,
            processRemark: remark || '已确认盘亏',
            processedAt: now,
            processedBy: '张明',
          }
        : r
    );

    const newState = {
      ...state,
      inventoryRecords: {
        ...state.inventoryRecords,
        [taskId]: updatedRecords,
      },
      assets: newAssets,
      assetLogs: newLogs,
    };
    saveData(newState);
    set(newState);
  },

  getFilteredAssets: () => {
    const { assets, filters, currentPage, pageSize } = get();

    let filtered = [...assets];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(keyword) ||
          a.assetNo.toLowerCase().includes(keyword) ||
          a.location.toLowerCase().includes(keyword)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter((a) => a.category === filters.category);
    }

    if (filters.departmentId) {
      filtered = filtered.filter((a) => a.departmentId === filters.departmentId);
    }

    if (filters.userId) {
      filtered = filtered.filter((a) => a.userId === filters.userId);
    }

    const total = filtered.length;
    const start = (currentPage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total };
  },

  getAssetById: (id) => {
    return get().assets.find((a) => a.id === id);
  },

  getAssetStats: () => {
    const { assets } = get();
    const total = assets.length;
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const idleCount = assets.filter((a) => a.status === 'idle').length;
    const inUseCount = assets.filter((a) => a.status === 'in_use').length;
    const maintenanceCount = assets.filter((a) => a.status === 'maintenance').length;
    const scrappedCount = assets.filter((a) => a.status === 'scrapped').length;
    const scrappingCount = assets.filter((a) => a.status === 'scrapping').length;

    return {
      total,
      totalValue,
      idleCount,
      inUseCount,
      maintenanceCount,
      scrappedCount,
      scrappingCount,
    };
  },
}));
