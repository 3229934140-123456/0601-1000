import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Wrench,
  ArrowLeftRight,
  PackageX,
  Check,
  X,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { statusMap, categoryMap, AssetCategory, AssetStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { departments } from '@/data/departments';
import { users } from '@/data/users';
import { getUserName, getDepartmentName } from '@/data/users';
import { exportAssetList } from '@/utils/export';
import AssetDetailModal from './components/AssetDetailModal';
import AddAssetModal from './components/AddAssetModal';

export default function AssetList() {
  const {
    assets,
    filters,
    selectedAssetIds,
    currentPage,
    pageSize,
    setFilters,
    setCurrentPage,
    toggleAssetSelection,
    clearSelection,
    selectAll,
    getFilteredAssets,
    bulkSubmitScrap,
  } = useAssetStore();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [scrapForm, setScrapForm] = useState({ reason: '', estimatedSalvageValue: 0 });

  const { items, total } = getFilteredAssets();
  const totalPages = Math.ceil(total / pageSize);
  const allSelected = items.length > 0 && items.every((a) => selectedAssetIds.includes(a.id));

  const handleViewDetail = (id: string) => {
    setSelectedAssetId(id);
    setShowDetailModal(true);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(items.map((a) => a.id));
    }
  };

  const handleBulkScrap = () => {
    if (selectedAssetIds.length > 0) {
      setShowScrapModal(true);
      setShowBulkMenu(false);
    }
  };

  const submitBulkScrap = () => {
    if (!scrapForm.reason) {
      alert('请填写报废原因');
      return;
    }
    bulkSubmitScrap(selectedAssetIds, scrapForm.reason, scrapForm.estimatedSalvageValue);
    setShowScrapModal(false);
    setScrapForm({ reason: '', estimatedSalvageValue: 0 });
    alert(`已提交 ${selectedAssetIds.length} 项资产的报废审批`);
  };

  const handleExport = () => {
    const { items: filteredItems } = getFilteredAssets();
    exportAssetList(filteredItems, `资产清单_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const stats = useMemo(() => {
    return {
      total: assets.length,
      totalValue: assets.reduce((sum, a) => sum + a.value, 0),
      idle: assets.filter((a) => a.status === 'idle').length,
      inUse: assets.filter((a) => a.status === 'in_use').length,
      maintenance: assets.filter((a) => a.status === 'maintenance').length,
      scrapping: assets.filter((a) => a.status === 'scrapping').length,
    };
  }, [assets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">资产台账</h1>
          <p className="text-sm text-slate-500 mt-1">管理和查看所有资产信息</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出清单
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新增资产
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">资产总数</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 text-xl font-bold">台</span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">资产总值</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <span className="text-success-600 text-xl font-bold">¥</span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">闲置资产</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.idle}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="text-slate-600 text-xl font-bold">闲</span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">维修中</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{stats.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">待报废</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">{stats.scrapping}</p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <PackageX className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索资产编号、名称、位置..."
                  className="input pl-9"
                  value={filters.keyword || ''}
                  onChange={(e) => setFilters({ keyword: e.target.value })}
                />
              </div>
              
              <select
                className="select w-36"
                value={filters.status || ''}
                onChange={(e) => setFilters({ status: (e.target.value as AssetStatus) || undefined })}
              >
                <option value="">全部状态</option>
                {Object.entries(statusMap).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>

              <select
                className="select w-36"
                value={filters.category || ''}
                onChange={(e) => setFilters({ category: (e.target.value as AssetCategory) || undefined })}
              >
                <option value="">全部分类</option>
                {Object.entries(categoryMap).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>

              <select
                className="select w-36"
                value={filters.departmentId || ''}
                onChange={(e) => setFilters({ departmentId: e.target.value || undefined })}
              >
                <option value="">全部部门</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <button className="btn-ghost">
              <Filter className="w-4 h-4 mr-2" />
              高级筛选
            </button>
          </div>
        </div>

        {selectedAssetIds.length > 0 && (
          <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary-700">
                已选择 <span className="font-semibold">{selectedAssetIds.length}</span> 项资产
              </span>
            </div>
            <div className="flex items-center gap-2 relative">
              <button className="btn-secondary btn-sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                批量导出
              </button>
              <button className="btn-secondary btn-sm">
                <ArrowLeftRight className="w-4 h-4 mr-1" />
                批量调拨
              </button>
              <button
                className="btn-danger btn-sm"
                onClick={handleBulkScrap}
              >
                <PackageX className="w-4 h-4 mr-1" />
                批量报废申请
              </button>
              <button
                className="text-sm text-slate-500 hover:text-slate-700 ml-2"
                onClick={clearSelection}
              >
                取消选择
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="table-header">
                  <button className="flex items-center gap-1 hover:text-slate-700">
                    资产编号
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="table-header">资产名称</th>
                <th className="table-header">分类</th>
                <th className="table-header">状态</th>
                <th className="table-header">使用人</th>
                <th className="table-header">所属部门</th>
                <th className="table-header">存放位置</th>
                <th className="table-header text-right">资产价值</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((asset) => {
                const statusInfo = statusMap[asset.status];
                const categoryInfo = categoryMap[asset.category];
                
                return (
                  <tr key={asset.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedAssetIds.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                      />
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm text-primary-600 font-medium">
                        {asset.assetNo}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-slate-900">{asset.name}</div>
                      <div className="text-xs text-slate-500">
                        购置日期：{formatDate(asset.purchaseDate)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{categoryInfo.label}</span>
                    </td>
                    <td className="table-cell">
                      <span className={statusInfo.className}>{statusInfo.label}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">
                        {asset.userId ? getUserName(asset.userId) : '-'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">
                        {getDepartmentName(asset.departmentId)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{asset.location}</span>
                    </td>
                    <td className="table-cell text-right">
                      <span className="font-medium text-slate-900">
                        {formatCurrency(asset.value)}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors"
                          onClick={() => handleViewDetail(asset.id)}
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-warning-50 rounded-md text-slate-500 hover:text-warning-600 transition-colors"
                          title="维修"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-primary-50 rounded-md text-slate-500 hover:text-primary-600 transition-colors"
                          title="调拨"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    暂无资产数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            共 <span className="font-medium text-slate-900">{total}</span> 条记录，
            第 <span className="font-medium text-slate-900">{currentPage}</span> / {totalPages} 页
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {showDetailModal && selectedAssetId && (
        <AssetDetailModal
          assetId={selectedAssetId}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showAddModal && (
        <AddAssetModal onClose={() => setShowAddModal(false)} />
      )}

      {showScrapModal && (
        <div className="modal-overlay" onClick={() => setShowScrapModal(false)}>
          <div
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">批量报废申请</h2>
              <p className="text-sm text-slate-500 mt-1">
                已选择 <span className="font-medium text-primary-600">{selectedAssetIds.length}</span> 项资产
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  报废原因 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="请详细说明报废原因"
                  value={scrapForm.reason}
                  onChange={(e) => setScrapForm({ ...scrapForm, reason: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  预计残值（元）
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="请输入预计残值"
                  value={scrapForm.estimatedSalvageValue || ''}
                  onChange={(e) => setScrapForm({ ...scrapForm, estimatedSalvageValue: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="bg-warning-50 rounded-lg p-3">
                <p className="text-xs text-warning-700">
                  提交后资产将进入「待报废」状态，需审批通过后才正式报废。
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowScrapModal(false)}
              >
                取消
              </button>
              <button className="btn-primary" onClick={submitBulkScrap}>
                <PackageX className="w-4 h-4 mr-2" />
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
