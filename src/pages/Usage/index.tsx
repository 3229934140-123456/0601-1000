import { useState } from 'react';
import {
  Package,
  User,
  Calendar,
  Clock,
  Plus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { statusMap } from '@/types';
import { formatDate } from '@/utils/format';
import { users } from '@/data/users';
import { departments } from '@/data/departments';

export default function Usage() {
  const [activeTab, setActiveTab] = useState<'borrow' | 'return' | 'history'>('borrow');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const assets = useAssetStore((state) => state.assets);
  const updateAsset = useAssetStore((state) => state.updateAsset);
  
  const borrowableAssets = assets.filter((a) => a.status === 'idle');
  const inUseAssets = assets.filter((a) => a.status === 'in_use');
  
  const [borrowForm, setBorrowForm] = useState({
    assetId: '',
    userId: '',
    reason: '',
    expectReturnDate: '',
  });

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const handleBorrow = (asset: any) => {
    setSelectedAsset(asset);
    setShowBorrowModal(true);
  };

  const submitBorrow = () => {
    if (selectedAsset && borrowForm.userId) {
      updateAsset(selectedAsset.id, {
        status: 'in_use',
        userId: borrowForm.userId,
      });
      setShowBorrowModal(false);
      setBorrowForm({ assetId: '', userId: '', reason: '', expectReturnDate: '' });
      alert('领用申请提交成功！');
    }
  };

  const handleReturn = (assetId: string) => {
    if (confirm('确认归还该资产吗？')) {
      updateAsset(assetId, { status: 'idle', userId: '' });
    }
  };

  const displayAssets = activeTab === 'borrow' ? borrowableAssets : inUseAssets;
  const totalPages = Math.ceil(displayAssets.length / pageSize);
  const paginatedAssets = displayAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const usageHistory = [
    { id: 1, assetName: '笔记本电脑', assetNo: 'BJT-IT-2024-0001', userName: '王强', action: '领用', date: '2024-06-01', expectReturn: '2024-12-31' },
    { id: 2, assetName: '显示器', assetNo: 'BJT-IT-2024-0002', userName: '赵磊', action: '归还', date: '2024-06-02', expectReturn: '-' },
    { id: 3, assetName: '办公椅', assetNo: 'BJT-FN-2024-0003', userName: '陈静', action: '领用', date: '2024-06-03', expectReturn: '2024-09-30' },
    { id: 4, assetName: '打印机', assetNo: 'BJT-IT-2024-0004', userName: '刘洋', action: '归还', date: '2024-06-04', expectReturn: '-' },
    { id: 5, assetName: '手机', assetNo: 'BJT-EL-2024-0005', userName: '周杰', action: '领用', date: '2024-06-05', expectReturn: '2025-06-05' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">领用归还</h1>
          <p className="text-sm text-slate-500 mt-1">管理资产的领用和归还流程</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{borrowableAssets.length}</p>
              <p className="text-xs text-slate-500">可领用</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{inUseAssets.length}</p>
              <p className="text-xs text-slate-500">使用中</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">28</p>
              <p className="text-xs text-slate-500">本月领用</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-xs text-slate-500">逾期未还</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { key: 'borrow', label: '可领用资产', icon: ArrowRight },
              { key: 'return', label: '待归还资产', icon: ArrowLeft },
              { key: 'history', label: '使用记录', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索资产名称、编号..."
                className="input pl-9"
              />
            </div>
            <select className="select w-40">
              <option value="">全部分类</option>
              <option value="computer">办公设备</option>
              <option value="furniture">办公家具</option>
              <option value="electronics">电子设备</option>
            </select>
            <select className="select w-40">
              <option value="">全部部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <button className="btn-ghost">
              <Filter className="w-4 h-4 mr-2" />
              更多筛选
            </button>
          </div>
        </div>

        {activeTab !== 'history' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="table-header">资产编号</th>
                    <th className="table-header">资产名称</th>
                    <th className="table-header">分类</th>
                    <th className="table-header">
                      {activeTab === 'borrow' ? '当前状态' : '使用人'}
                    </th>
                    <th className="table-header">所属部门</th>
                    <th className="table-header">存放位置</th>
                    <th className="table-header">
                      {activeTab === 'borrow' ? '入库日期' : '领用日期'}
                    </th>
                    <th className="table-header text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.map((asset) => {
                    const statusInfo = statusMap[asset.status];
                    const user = users.find((u) => u.id === asset.userId);
                    const dept = departments.find((d) => d.id === asset.departmentId);
                    
                    return (
                      <tr key={asset.id} className="table-row">
                        <td className="table-cell">
                          <span className="font-mono text-sm text-primary-600 font-medium">
                            {asset.assetNo}
                          </span>
                        </td>
                        <td className="table-cell font-medium text-slate-900">
                          {asset.name}
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-slate-600">
                            {asset.category === 'computer' ? '办公设备' :
                             asset.category === 'furniture' ? '办公家具' :
                             asset.category === 'electronics' ? '电子设备' :
                             asset.category === 'vehicle' ? '车辆资产' : '其他'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {activeTab === 'borrow' ? (
                            <span className={statusInfo.className}>{statusInfo.label}</span>
                          ) : (
                            <span className="text-sm text-slate-700">{user?.name || '-'}</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-slate-600">{dept?.name || '-'}</span>
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-slate-600">{asset.location}</span>
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-slate-600">
                            {formatDate(asset.purchaseDate)}
                          </span>
                        </td>
                        <td className="table-cell text-right">
                          {activeTab === 'borrow' ? (
                            <button
                              className="btn-primary text-xs py-1.5 px-3"
                              onClick={() => handleBorrow(asset)}
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              领用
                            </button>
                          ) : (
                            <button
                              className="btn-secondary text-xs py-1.5 px-3"
                              onClick={() => handleReturn(asset.id)}
                            >
                              <ArrowLeft className="w-3 h-3 mr-1" />
                              归还
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedAssets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                共 <span className="font-medium text-slate-900">{displayAssets.length}</span> 条记录，
                第 <span className="font-medium text-slate-900">{currentPage}</span> / {totalPages || 1} 页
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`w-8 h-8 rounded-md text-sm font-medium ${
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
                  className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header">资产编号</th>
                  <th className="table-header">资产名称</th>
                  <th className="table-header">使用人</th>
                  <th className="table-header">操作类型</th>
                  <th className="table-header">操作日期</th>
                  <th className="table-header">预计归还</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono text-sm text-primary-600 font-medium">
                        {record.assetNo}
                      </span>
                    </td>
                    <td className="table-cell font-medium text-slate-900">
                      {record.assetName}
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{record.userName}</span>
                    </td>
                    <td className="table-cell">
                      <span className={record.action === '领用' ? 'badge-in-use' : 'badge-idle'}>
                        {record.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{record.date}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{record.expectReturn}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showBorrowModal && selectedAsset && (
        <div className="modal-overlay" onClick={() => setShowBorrowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">资产领用</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-900">{selectedAsset.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedAsset.assetNo}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  领用人 <span className="text-danger-500">*</span>
                </label>
                <select
                  className="select"
                  value={borrowForm.userId}
                  onChange={(e) => setBorrowForm({ ...borrowForm, userId: e.target.value })}
                >
                  <option value="">请选择领用人</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  预计归还日期
                </label>
                <input
                  type="date"
                  className="input"
                  value={borrowForm.expectReturnDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, expectReturnDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  领用事由
                </label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="请输入领用事由"
                  value={borrowForm.reason}
                  onChange={(e) => setBorrowForm({ ...borrowForm, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowBorrowModal(false)}
              >
                取消
              </button>
              <button className="btn-primary" onClick={submitBorrow}>
                <Plus className="w-4 h-4 mr-2" />
                确认领用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
