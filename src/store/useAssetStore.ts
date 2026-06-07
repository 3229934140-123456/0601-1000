import { create } from 'zustand';
import { Asset, AssetFilter, AssetStatus, AssetCategory, AssetLog, MaintenanceOrder, TransferOrder, InventoryTask } from '@/types';
import { initialAssets } from '@/data/assets';
import { maintenanceOrders as initialMaintenanceOrders } from '@/data/maintenance';
import { transferOrders as initialTransferOrders } from '@/data/transfers';
import { inventoryTasks as initialInventoryTasks } from '@/inventory/inventory';
import { getStorage, setStorage } from '@/utils/storage';
import { generateAssetNo, getNextSequence } from '@/utils/assetNo';
import { generateId } from '@/utils/format';

interface AssetState {
  assets: Asset[];
  assetLogs: Record<string, AssetLog[]>;
  maintenanceOrders: MaintenanceOrder[];
  transferOrders: TransferOrder[];
  inventoryTasks: InventoryTask[];
  filters: AssetFilter;
  selectedAssetIds: string[];
  currentPage: number;
  pageSize: number;
  
  setFilters: (filters: Partial<AssetFilter>) => void;
  setCurrentPage: (page: number) => void;
  toggleAssetSelection: (assetId: string) => void;
  clearSelection: () => void;
  selectAll: (assetIds: string[]) => void;
  
  addAsset: (asset: Omit<Asset, 'id' | 'assetNo' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  bulkUpdateStatus: (ids: string[], status: AssetStatus) => void;
  bulkTransfer: (ids: string[], toDeptId: string, toDeptName: string) => void;
  scrapAsset: (id: string, reason: string) => void;
  
  addLog: (assetId: string, log: Omit<AssetLog, 'id' | 'assetId' | 'createdAt'>) => void;
  getLogs: (assetId: string) => AssetLog[];
  
  addMaintenanceOrder: (order: Omit<MaintenanceOrder, 'id'>) => void;
  updateMaintenanceOrder: (id: string, updates: Partial<MaintenanceOrder>) => void;
  
  addTransferOrder: (order: Omit<TransferOrder, 'id'>) => void;
  updateTransferOrder: (id: string, updates: Partial<TransferOrder>) => void;
  
  getFilteredAssets: () => { items: Asset[]; total: number };
  getAssetById: (id: string) => Asset | undefined;
  getAssetStats: () => {
    total: number;
    totalValue: number;
    idleCount: number;
    inUseCount: number;
    maintenanceCount: number;
    scrappedCount: number;
  };
}

const STORAGE_KEY = 'asset_data';

function loadInitialData() {
  const saved = getStorage<{
    assets: Asset[];
    maintenanceOrders: MaintenanceOrder[];
    transferOrders: TransferOrder[];
    inventoryTasks: InventoryTask[];
  } | null>(STORAGE_KEY, null);
  
  if (saved) {
    return saved;
  }
  
  return {
    assets: initialAssets,
    maintenanceOrders: initialMaintenanceOrders,
    transferOrders: initialTransferOrders,
    inventoryTasks: initialInventoryTasks,
  };
}

const initialData = loadInitialData();

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: initialData.assets,
  assetLogs: {},
  maintenanceOrders: initialData.maintenanceOrders,
  transferOrders: initialData.transferOrders,
  inventoryTasks: initialData.inventoryTasks,
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
    set((state) => {
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
      };
      
      const newState = {
        assets: [newAsset, ...state.assets],
      };
      
      setStorage(STORAGE_KEY, {
        assets: newState.assets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return newState;
    });
  },
  
  updateAsset: (id, updates) => {
    set((state) => {
      const newAssets = state.assets.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      );
      
      setStorage(STORAGE_KEY, {
        assets: newAssets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { assets: newAssets };
    });
  },
  
  deleteAsset: (id) => {
    set((state) => {
      const newAssets = state.assets.filter((a) => a.id !== id);
      
      setStorage(STORAGE_KEY, {
        assets: newAssets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { assets: newAssets };
    });
  },
  
  bulkUpdateStatus: (ids, status) => {
    set((state) => {
      const newAssets = state.assets.map((a) =>
        ids.includes(a.id) ? { ...a, status, updatedAt: new Date().toISOString() } : a
      );
      
      setStorage(STORAGE_KEY, {
        assets: newAssets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { assets: newAssets, selectedAssetIds: [] };
    });
  },
  
  bulkTransfer: (ids, toDeptId, toDeptName) => {
    set((state) => {
      const now = new Date().toISOString();
      const newTransferOrders: TransferOrder[] = ids.map((id) => {
        const asset = state.assets.find((a) => a.id === id);
        return {
          id: `to_${generateId()}`,
          assetId: id,
          assetName: asset?.name || '',
          assetNo: asset?.assetNo || '',
          fromDeptId: asset?.departmentId || '',
          fromDeptName: '',
          toDeptId,
          toDeptName,
          status: 'pending',
          reason: '批量调拨',
          applicant: '系统管理员',
          applicantId: 'user_001',
          applyDate: now.split('T')[0],
        };
      });
      
      setStorage(STORAGE_KEY, {
        assets: state.assets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: [...newTransferOrders, ...state.transferOrders],
        inventoryTasks: state.inventoryTasks,
      });
      
      return {
        transferOrders: [...newTransferOrders, ...state.transferOrders],
        selectedAssetIds: [],
      };
    });
  },
  
  scrapAsset: (id, reason) => {
    set((state) => {
      const newAssets = state.assets.map((a) =>
        a.id === id ? { ...a, status: 'scrapped' as AssetStatus, updatedAt: new Date().toISOString() } : a
      );
      
      setStorage(STORAGE_KEY, {
        assets: newAssets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { assets: newAssets };
    });
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
    set((state) => {
      const newOrder: MaintenanceOrder = {
        ...order,
        id: `mo_${generateId()}`,
      };
      
      setStorage(STORAGE_KEY, {
        assets: state.assets,
        maintenanceOrders: [newOrder, ...state.maintenanceOrders],
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { maintenanceOrders: [newOrder, ...state.maintenanceOrders] };
    });
  },
  
  updateMaintenanceOrder: (id, updates) => {
    set((state) => {
      const newOrders = state.maintenanceOrders.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      );
      
      setStorage(STORAGE_KEY, {
        assets: state.assets,
        maintenanceOrders: newOrders,
        transferOrders: state.transferOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { maintenanceOrders: newOrders };
    });
  },
  
  addTransferOrder: (order) => {
    set((state) => {
      const newOrder: TransferOrder = {
        ...order,
        id: `to_${generateId()}`,
      };
      
      setStorage(STORAGE_KEY, {
        assets: state.assets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: [newOrder, ...state.transferOrders],
        inventoryTasks: state.inventoryTasks,
      });
      
      return { transferOrders: [newOrder, ...state.transferOrders] };
    });
  },
  
  updateTransferOrder: (id, updates) => {
    set((state) => {
      const newOrders = state.transferOrders.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      );
      
      if (updates.status === 'completed') {
        const order = state.transferOrders.find((o) => o.id === id);
        if (order) {
          const newAssets = state.assets.map((a) =>
            a.id === order.assetId
              ? { ...a, departmentId: order.toDeptId, status: 'idle' as AssetStatus, updatedAt: new Date().toISOString() }
              : a
          );
          
          setStorage(STORAGE_KEY, {
            assets: newAssets,
            maintenanceOrders: state.maintenanceOrders,
            transferOrders: newOrders,
            inventoryTasks: state.inventoryTasks,
          });
          
          return { transferOrders: newOrders, assets: newAssets };
        }
      }
      
      setStorage(STORAGE_KEY, {
        assets: state.assets,
        maintenanceOrders: state.maintenanceOrders,
        transferOrders: newOrders,
        inventoryTasks: state.inventoryTasks,
      });
      
      return { transferOrders: newOrders };
    });
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
    
    return {
      total,
      totalValue,
      idleCount,
      inUseCount,
      maintenanceCount,
      scrappedCount,
    };
  },
}));
