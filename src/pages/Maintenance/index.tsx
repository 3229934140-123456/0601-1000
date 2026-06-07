import { useState } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building2,
  Search,
  Filter,
  Bell,
  Settings,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { formatCurrency, formatDate } from '@/utils/format';
import { departments } from '@/data/departments';

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const maintenanceOrders = useAssetStore((state) => state.maintenanceOrders);
  const addMaintenanceOrder = useAssetStore((state) => state.addMaintenanceOrder);
  const updateMaintenanceOrder = useAssetStore((state) => state.updateMaintenanceOrder);

  const [formData, setFormData] = useState({
    assetName: '',
    assetId: '',
    type: 'repair' as 'repair' | 'maintenance',
    description: '',
    provider: '',
    estimatedCost: 0,
  });

  const filteredOrders = maintenanceOrders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning-100 text-warning-700">待处理</span>;
      case 'in_progress':
        return <span className="badge bg-primary-100 text-primary-700">维修中</span>;
      case 'completed':
        return <span className="badge bg-success-100 text-success-700">已完成</span>;
      default:
        return <span className="badge">未知</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'repair' ? '维修' : '保养';
  };

  const stats = {
    pending: maintenanceOrders.filter((o) => o.status === 'pending').length,
    inProgress: maintenanceOrders.filter((o) => o.status === 'in_progress').length,
    completed: maintenanceOrders.filter((o) => o.status === 'completed').length,
    totalCost: maintenanceOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.cost, 0),
  };

  const maintenanceReminders = [
    { id: 1, assetName: '打印机', assetNo: 'BJT-IT-2024-0003', type: '季度保养', dueDate: '2024-06-15', daysLeft: 7 },
    { id: 2, assetName: '空调', assetNo: 'BJT-OT-2024-0001', type: '月度清洗', dueDate: '2024-06-10', daysLeft: 2 },
    { id: 3, assetName: '公务轿车', assetNo: 'BJT-VH-2024-0001', type: '里程保养', dueDate: '2024-06-20', daysLeft: 12 },
  ];

  const handleCreate = () => {
    if (formData.assetName && formData.description) {
      addMaintenanceOrder({
        assetId: formData.assetId,
        assetName: formData.assetName,
        type: formData.type,
        status: 'pending',
        cost: formData.estimatedCost,
        date: new Date().toISOString().split('T')[0],
        description: formData.description,
        provider: formData.provider,
        operator: '张明',
      });
      setShowCreateModal(false);
      setFormData({
        assetName: '',
        assetId: '',
        type: 'repair',
        description: '',
        provider: '',
        estimatedCost: 0,
      });
      alert('工单创建成功！');
    }
  };

  const handleStart = (id: string) => {
    updateMaintenanceOrder(id, { status: 'in_progress' });
  };

  const handleComplete = (id: string, cost: number) => {
    updateMaintenanceOrder(id, { status: 'completed', cost, completedDate: new Date().toISOString().split('T')[0] });
  };

  const pendingCount = stats.pending;
  const inProgressCount = stats.inProgress;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">维修工单</h1>
          <p className="text-sm text-slate-500 mt-1">管理资产维修和保养工单</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建工单
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
              <p className="text-xs text-slate-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
              <p className="text-xs text-slate-500">维修中</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-xs text-slate-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalCost)}</p>
              <p className="text-xs text-slate-500">维修总费用</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { key: 'all', label: '全部工单' },
                { key: 'pending', label: '待处理', count: pendingCount },
                { key: 'in_progress', label: '维修中', count: inProgressCount },
                { key: 'completed', label: '已完成' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
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
                  placeholder="搜索资产名称、编号..."
                  className="input pl-9"
                />
              </div>
              <select className="select w-40">
                <option value="">全部类型</option>
                <option value="repair">维修</option>
                <option value="maintenance">保养</option>
              </select>
              <button className="btn-ghost">
                <Filter className="w-4 h-4 mr-2" />
                更多筛选
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-slate-900">{order.assetName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.type === 'repair' 
                          ? 'bg-danger-100 text-danger-700' 
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {getTypeLabel(order.type)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{order.description}</p>
                    
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{order.provider || '待分配服务商'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{order.cost > 0 ? formatCurrency(order.cost) : '待确定'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{order.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>操作人：{order.operator}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <button
                        className="btn-primary text-xs py-1.5 px-3"
                        onClick={() => handleStart(order.id)}
                      >
                        开始处理
                      </button>
                    )}
                    {order.status === 'in_progress' && (
                      <button
                        className="btn-success text-xs py-1.5 px-3"
                        onClick={() => handleComplete(order.id, order.cost || 200)}
                      >
                        完成
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-xs text-slate-500">
                        {order.completedDate} 完成
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                暂无工单
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-warning-600" />
                保养提醒
              </h3>
              <span className="text-xs text-primary-600 cursor-pointer hover:underline">
                全部
              </span>
            </div>
            
            <div className="space-y-3">
              {maintenanceReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 bg-warning-50 rounded-lg border border-warning-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{reminder.assetName}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{reminder.assetNo}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      reminder.daysLeft <= 3 
                        ? 'bg-danger-100 text-danger-700' 
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                      {reminder.daysLeft} 天后
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{reminder.type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-600" />
              保养周期设置
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-700">电脑设备</span>
                <span className="text-sm text-slate-500">每季度</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-700">打印设备</span>
                <span className="text-sm text-slate-500">每月</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-700">空调设备</span>
                <span className="text-sm text-slate-500">每月</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">车辆</span>
                <span className="text-sm text-slate-500">5000公里/半年</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" />
              维修服务商
            </h3>
            
            <div className="space-y-2">
              <div className="p-2 hover:bg-slate-50 rounded cursor-pointer">
                <p className="text-sm font-medium text-slate-900">科技维修服务中心</p>
                <p className="text-xs text-slate-500">IT设备 · 评分 4.8</p>
              </div>
              <div className="p-2 hover:bg-slate-50 rounded cursor-pointer">
                <p className="text-sm font-medium text-slate-900">办公设备维修站</p>
                <p className="text-xs text-slate-500">办公设备 · 评分 4.6</p>
              </div>
              <div className="p-2 hover:bg-slate-50 rounded cursor-pointer">
                <p className="text-sm font-medium text-slate-900">空调维修服务中心</p>
                <p className="text-xs text-slate-500">空调 · 评分 4.7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">创建维修工单</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  资产名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="请选择或输入资产名称"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    工单类型 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    className="select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="repair">维修</option>
                    <option value="maintenance">保养</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    预计费用
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="预计费用"
                    value={formData.estimatedCost || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  故障/保养描述 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="请详细描述故障情况或保养需求"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  指定服务商
                </label>
                <select
                  className="select"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                >
                  <option value="">自动分配</option>
                  <option value="科技维修服务中心">科技维修服务中心</option>
                  <option value="办公设备维修站">办公设备维修站</option>
                  <option value="空调维修服务中心">空调维修服务中心</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                创建工单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
