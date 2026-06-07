import { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Check,
  X,
  Clock,
  User,
  Building2,
  Calendar,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Download,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { formatDate, formatCurrency } from '@/utils/format';
import { departments } from '@/data/departments';
import { users } from '@/data/users';
import { getDepartmentName, getUserName } from '@/data/users';
import { exportTransferOrders } from '@/utils/export';
import { Asset } from '@/types';

export default function Transfer() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'completed'>('pending');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const transferOrders = useAssetStore((state) => state.transferOrders);
  const assets = useAssetStore((state) => state.assets);
  const updateTransferOrder = useAssetStore((state) => state.updateTransferOrder);
  const addTransferOrder = useAssetStore((state) => state.addTransferOrder);

  const [applyForm, setApplyForm] = useState({
    assetId: '',
    assetName: '',
    assetNo: '',
    fromDeptId: '',
    fromDeptName: '',
    fromLocation: '',
    toDeptId: '',
    toLocation: '',
    reason: '',
  });

  const [assetSearch, setAssetSearch] = useState('');

  const availableAssets = useMemo(() => {
    return assets.filter((a) => a.status === 'idle' || a.status === 'in_use');
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (!assetSearch) return availableAssets;
    const keyword = assetSearch.toLowerCase();
    return availableAssets.filter(
      (a) =>
        a.name.toLowerCase().includes(keyword) ||
        a.assetNo.toLowerCase().includes(keyword)
    );
  }, [availableAssets, assetSearch]);

  const filteredOrders = transferOrders.filter((order) => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'approved') return order.status === 'approved';
    return order.status === 'completed' || order.status === 'rejected';
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning-100 text-warning-700">待审批</span>;
      case 'approved':
        return <span className="badge bg-primary-100 text-primary-700">已批准</span>;
      case 'completed':
        return <span className="badge bg-success-100 text-success-700">已完成</span>;
      case 'rejected':
        return <span className="badge bg-danger-100 text-danger-700">已拒绝</span>;
      default:
        return <span className="badge">未知</span>;
    }
  };

  const handleApprove = (id: string) => {
    if (confirm('确认批准该调拨申请吗？')) {
      updateTransferOrder(id, { status: 'approved', approver: '张明', approveDate: new Date().toISOString().split('T')[0] });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason !== null && reason.trim() !== '') {
      updateTransferOrder(id, { status: 'rejected', approver: '张明', approveDate: new Date().toISOString().split('T')[0], approveRemark: reason });
    }
  };

  const handleComplete = (id: string) => {
    if (confirm('确认完成该资产调拨吗？')) {
      updateTransferOrder(id, { status: 'completed' });
    }
  };

  const stats = {
    pending: transferOrders.filter((o) => o.status === 'pending').length,
    approved: transferOrders.filter((o) => o.status === 'approved').length,
    completed: transferOrders.filter((o) => o.status === 'completed').length,
    total: transferOrders.length,
  };

  const selectAsset = (asset: Asset) => {
    const deptName = getDepartmentName(asset.departmentId);
    setApplyForm({
      ...applyForm,
      assetId: asset.id,
      assetName: asset.name,
      assetNo: asset.assetNo,
      fromDeptId: asset.departmentId,
      fromDeptName: deptName,
      fromLocation: asset.location || '',
    });
    setShowAssetSelector(false);
    setAssetSearch('');
  };

  const submitApply = () => {
    if (!applyForm.assetId || !applyForm.toDeptId || !applyForm.reason) {
      alert('请填写完整的调拨信息');
      return;
    }
    const toDept = departments.find((d) => d.id === applyForm.toDeptId);
    addTransferOrder({
      assetId: applyForm.assetId,
      assetName: applyForm.assetName,
      assetNo: applyForm.assetNo,
      fromDeptId: applyForm.fromDeptId,
      fromDeptName: applyForm.fromDeptName,
      fromLocation: applyForm.fromLocation,
      toDeptId: applyForm.toDeptId,
      toDeptName: toDept?.name || '',
      toLocation: applyForm.toLocation,
      status: 'pending',
      reason: applyForm.reason,
      applicant: '张明',
      applicantId: 'user_001',
      applyDate: new Date().toISOString().split('T')[0],
    });
    setShowApplyModal(false);
    setApplyForm({
      assetId: '',
      assetName: '',
      assetNo: '',
      fromDeptId: '',
      fromDeptName: '',
      fromLocation: '',
      toDeptId: '',
      toLocation: '',
      reason: '',
    });
    alert('调拨申请提交成功！');
  };

  const handleExport = () => {
    exportTransferOrders(transferOrders, `调拨记录_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">调拨申请</h1>
          <p className="text-sm text-slate-500 mt-1">管理跨部门资产调拨流程</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出记录
          </button>
          <button className="btn-primary" onClick={() => setShowApplyModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            发起调拨
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">全部申请</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
              <p className="text-xs text-slate-500">待审批</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{stats.approved}</p>
              <p className="text-xs text-slate-500">调拨中</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
              <p className="text-xs text-slate-500">已完成</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { key: 'pending', label: '待审批' },
              { key: 'approved', label: '已批准' },
              { key: 'completed', label: '已完成/拒绝' },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
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
              <option value="">全部调出部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select className="select w-40">
              <option value="">全部调入部门</option>
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

        <div className="divide-y divide-slate-100">
          {paginatedOrders.map((order) => (
            <div key={order.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-medium text-slate-900">{order.assetName}</h3>
                    <span className="font-mono text-xs text-slate-500">{order.assetNo}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{order.fromDeptName}</span>
                      <ArrowLeftRight className="w-4 h-4 text-primary-500" />
                      <span className="text-slate-600">{order.toDeptName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">申请人：{order.applicant}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{order.applyDate}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 mt-2">
                    调拨原因：{order.reason}
                  </p>
                  
                  {order.approver && (
                    <p className="text-xs text-slate-400 mt-2">
                      审批人：{order.approver} · {order.approveDate}
                      {order.approveRemark && ` · ${order.approveRemark}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        className="btn-success text-xs py-1.5 px-3"
                        onClick={() => handleApprove(order.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        批准
                      </button>
                      <button
                        className="btn-danger text-xs py-1.5 px-3"
                        onClick={() => handleReject(order.id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        拒绝
                      </button>
                    </>
                  )}
                  {order.status === 'approved' && (
                    <button
                      className="btn-primary text-xs py-1.5 px-3"
                      onClick={() => handleComplete(order.id)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      确认接收
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="text-xs text-success-600 font-medium">
                      调拨完成
                    </span>
                  )}
                  {order.status === 'rejected' && (
                    <span className="text-xs text-danger-600 font-medium">
                      已拒绝
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {paginatedOrders.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              暂无调拨申请
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              共 <span className="font-medium text-slate-900">{filteredOrders.length}</span> 条记录
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
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">发起调拨申请</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  选择资产 <span className="text-danger-500">*</span>
                </label>
                <div
                  className="relative">
                  {applyForm.assetId ? (
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{applyForm.assetName}</p>
                          <p className="text-xs text-slate-500 font-mono">{applyForm.assetNo}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-primary-600 hover:underline"
                        onClick={() => setShowAssetSelector(true)}
                      >
                        重新选择
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-primary-400 transition-colors"
                      onClick={() => setShowAssetSelector(true)}
                    >
                      <Plus className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-sm text-slate-600">点击选择资产</span>
                    </button>
                  )}
                </div>
              </div>

              {applyForm.fromDeptName && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    调出部门
                  </label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{applyForm.fromDeptName}</span>
                    </div>
                  </div>
                </div>
              )}

              {applyForm.fromLocation && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    原存放位置
                  </label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{applyForm.fromLocation}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  调入部门 <span className="text-danger-500">*</span>
                </label>
                <select
                  className="select"
                  value={applyForm.toDeptId}
                  onChange={(e) => setApplyForm({ ...applyForm, toDeptId: e.target.value })}
                >
                  <option value="">请选择调入部门</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  调入后存放位置
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="请输入调入后的存放位置"
                  value={applyForm.toLocation}
                  onChange={(e) => setApplyForm({ ...applyForm, toLocation: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  调拨原因 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="请详细说明调拨原因"
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowApplyModal(false)}
              >
                取消
              </button>
              <button className="btn-primary" onClick={submitApply}>
                <Plus className="w-4 h-4 mr-2" />
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssetSelector && (
        <div className="modal-overlay" onClick={() => setShowAssetSelector(false)}>
          <div
            className="modal-content max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">选择资产</h2>
              <button
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowAssetSelector(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索资产名称、编号..."
                  className="input pl-9 w-full"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredAssets.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => selectAsset(asset)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{asset.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{asset.assetNo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-700">{formatCurrency(asset.value)}</p>
                        <p className="text-xs text-slate-500">
                          {getDepartmentName(asset.departmentId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {asset.location}
                      </span>
                      <span>
                        {asset.userId ? `使用人：${getUserName(asset.userId)}` : '未分配'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                暂无可用资产
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
