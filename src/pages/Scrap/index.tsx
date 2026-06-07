import { useState } from 'react';
import {
  Trash2,
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
  DollarSign,
  Download,
  Eye,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { formatDate, formatCurrency } from '@/utils/format';
import { exportScrapOrders } from '@/utils/export';
import { ScrapOrder } from '@/types';

export default function Scrap() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ScrapOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const scrapOrders = useAssetStore((state) => state.scrapOrders);
  const approveScrapOrder = useAssetStore((state) => state.approveScrapOrder);
  const rejectScrapOrder = useAssetStore((state) => state.rejectScrapOrder);
  const getLogs = useAssetStore((state) => state.getLogs);
  const getAssetById = useAssetStore((state) => state.getAssetById);

  const filteredOrders = scrapOrders.filter((order) => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'approved') return order.status === 'approved';
    return order.status === 'rejected';
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = {
    pending: scrapOrders.filter((o) => o.status === 'pending').length,
    approved: scrapOrders.filter((o) => o.status === 'approved').length,
    rejected: scrapOrders.filter((o) => o.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning-100 text-warning-700">待审批</span>;
      case 'approved':
        return <span className="badge bg-success-100 text-success-700">已批准</span>;
      case 'rejected':
        return <span className="badge bg-danger-100 text-danger-700">已拒绝</span>;
      default:
        return <span className="badge">未知</span>;
    }
  };

  const handleApprove = (id: string) => {
    if (confirm('确认批准该报废申请吗？批准后资产将被标记为已报废。')) {
      approveScrapOrder(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason !== null && reason.trim() !== '') {
      rejectScrapOrder(id, reason);
    }
  };

  const handleViewDetail = (order: ScrapOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    exportScrapOrders(scrapOrders, `报废申请清单_${dateStr}.csv`);
  };

  const pendingCount = stats.pending;
  const approvedCount = stats.approved;
  const rejectedCount = stats.rejected;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">报废审批</h1>
          <p className="text-sm text-slate-500 mt-1">管理资产报废申请和审批流程</p>
        </div>
        <button className="btn-primary" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          导出清单
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{scrapOrders.length}</p>
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
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success-600">{stats.approved}</p>
              <p className="text-xs text-slate-500">已批准</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-danger-600">{stats.rejected}</p>
              <p className="text-xs text-slate-500">已拒绝</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { key: 'pending', label: '待审批', count: pendingCount },
              { key: 'approved', label: '已批准', count: approvedCount },
              { key: 'rejected', label: '已拒绝', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
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
                {tab.count > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
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
                placeholder="搜索资产名称或编号..."
                className="input pl-9"
              />
            </div>
            <button className="btn-ghost">
              <Filter className="w-4 h-4 mr-2" />
              更多筛选
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">资产编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">资产名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">报废原因</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">预计残值</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">申请人</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">申请日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">{order.assetNo}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{order.assetName}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{order.reason}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(order.estimatedSalvageValue)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{order.applicant}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(order.applyDate)}</td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            className="text-success-600 hover:text-success-700 text-sm flex items-center gap-1"
                            onClick={() => handleApprove(order.id)}
                          >
                            <Check className="w-4 h-4" />
                            批准
                          </button>
                          <button
                            className="text-danger-600 hover:text-danger-700 text-sm flex items-center gap-1"
                            onClick={() => handleReject(order.id)}
                          >
                            <X className="w-4 h-4" />
                            拒绝
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedOrders.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              暂无报废申请
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              共 {filteredOrders.length} 条记录
            </p>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600">
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div
            className="modal-content max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">报废申请详情</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedOrder.assetName}</p>
              </div>
              <button
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowDetailModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">资产编号</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{selectedOrder.assetNo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">资产名称</p>
                  <p className="text-sm font-medium text-slate-900">{selectedOrder.assetName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">申请状态</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">预计残值</p>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedOrder.estimatedSalvageValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">申请人</p>
                  <p className="text-sm font-medium text-slate-900">{selectedOrder.applicant}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">申请日期</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedOrder.applyDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">报废原因</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedOrder.reason}</p>
              </div>

              {selectedOrder.approver && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">审批人</p>
                    <p className="text-sm font-medium text-slate-900">{selectedOrder.approver}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">审批日期</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedOrder.approveDate ? formatDate(selectedOrder.approveDate) : '-'}
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.approveRemark && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">审批备注</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedOrder.approveRemark}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-2">操作日志</p>
                <div className="space-y-2">
                  {getLogs(selectedOrder.assetId).slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{log.action}</p>
                          <p className="text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">操作人：{log.operator}</p>
                        {log.remark && (
                          <p className="text-xs text-slate-500 mt-0.5">{log.remark}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </button>
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      handleReject(selectedOrder.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    拒绝
                  </button>
                  <button
                    className="btn-success"
                    onClick={() => {
                      handleApprove(selectedOrder.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    批准
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
