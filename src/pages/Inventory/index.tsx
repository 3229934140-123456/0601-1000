import { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Search,
  Filter,
  QrCode,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Calendar,
  Building2,
  Eye,
  Scan,
  X,
  Check,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { departments } from '@/data/departments';
import { generateInventoryRecords } from '@/inventory/inventory';
import { InventoryTask, InventoryRecord } from '@/types';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed'>('in_progress');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InventoryTask | null>(null);
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [recordTab, setRecordTab] = useState<'all' | 'normal' | 'profit' | 'loss'>('all');
  const [scanInput, setScanInput] = useState('');

  const inventoryTasks = useAssetStore((state) => state.inventoryTasks);

  const [createForm, setCreateForm] = useState({
    name: '',
    departmentIds: [] as string[],
  });

  const filteredTasks = inventoryTasks.filter((task) => {
    if (activeTab === 'in_progress') return task.status === 'in_progress' || task.status === 'pending';
    return task.status === 'completed';
  });

  const stats = {
    inProgress: inventoryTasks.filter((t) => t.status === 'in_progress').length,
    completed: inventoryTasks.filter((t) => t.status === 'completed').length,
    total: inventoryTasks.length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-slate-100 text-slate-700">待开始</span>;
      case 'in_progress':
        return <span className="badge bg-primary-100 text-primary-700">进行中</span>;
      case 'completed':
        return <span className="badge bg-success-100 text-success-700">已完成</span>;
      default:
        return <span className="badge">未知</span>;
    }
  };

  const handleViewDetail = (task: InventoryTask) => {
    setSelectedTask(task);
    setRecords(generateInventoryRecords(task.id));
    setShowDetailModal(true);
  };

  const handleStartTask = (taskId: string) => {
    if (confirm('确认开始该盘点任务吗？')) {
      alert('盘点任务已开始！');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    if (confirm('确认完成该盘点任务吗？完成后将生成盘点报告。')) {
      alert('盘点任务已完成！');
    }
  };

  const handleCreateTask = () => {
    if (createForm.name) {
      alert('盘点任务创建成功！');
      setShowCreateModal(false);
      setCreateForm({ name: '', departmentIds: [] });
    }
  };

  const handleScan = () => {
    if (scanInput) {
      const record = records.find((r) => r.assetNo === scanInput);
      if (record) {
        alert(`已盘点：${record.assetName} (${record.assetNo})`);
        setScanInput('');
      } else {
        alert('未找到该资产编号对应的盘点记录');
      }
    }
  };

  const filteredRecords = records.filter((r) => {
    if (recordTab === 'all') return true;
    return r.status === recordTab;
  });

  const getRecordStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return (
          <span className="badge bg-success-100 text-success-700 flex items-center gap-1">
            <Check className="w-3 h-3" />
            正常
          </span>
        );
      case 'profit':
        return (
          <span className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            盘盈
          </span>
        );
      case 'loss':
        return (
          <span className="badge bg-danger-100 text-danger-700 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            盘亏
          </span>
        );
      default:
        return <span className="badge">未知</span>;
    }
  };

  const profitCount = records.filter((r) => r.status === 'profit').length;
  const lossCount = records.filter((r) => r.status === 'loss').length;
  const normalCount = records.filter((r) => r.status === 'normal').length;

  const inProgressCount = stats.inProgress;
  const completedCount = stats.completed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">盘点任务</h1>
          <p className="text-sm text-slate-500 mt-1">管理资产盘点任务和盘盈盘亏处理</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建盘点
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">全部任务</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
              <p className="text-xs text-slate-500">进行中</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
              <p className="text-xs text-slate-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-600">扫码盘点</p>
              <p className="text-xs text-slate-500">快速盘点</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { key: 'in_progress', label: '进行中', count: inProgressCount },
              { key: 'completed', label: '已完成', count: completedCount },
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
                placeholder="搜索盘点任务名称..."
                className="input pl-9"
              />
            </div>
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

        <div className="divide-y divide-slate-100">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-medium text-slate-900">{task.name}</h3>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">盘点资产数</p>
                      <p className="text-lg font-semibold text-slate-900">{task.totalAssets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">已盘点</p>
                      <p className="text-lg font-semibold text-primary-600">{task.checkedAssets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">盘盈</p>
                      <p className="text-lg font-semibold text-success-600">{task.profitAssets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">盘亏</p>
                      <p className="text-lg font-semibold text-danger-600">{task.lossAssets}</p>
                    </div>
                  </div>

                  {task.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>盘点进度</span>
                        <span>{Math.round((task.checkedAssets / task.totalAssets) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${(task.checkedAssets / task.totalAssets) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>创建人：{task.creator}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>开始：{task.startDate}</span>
                    </div>
                    {task.endDate && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>完成：{task.endDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>涉及 {task.departmentIds.length} 个部门</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status === 'pending' && (
                    <button
                      className="btn-primary text-xs py-1.5 px-3"
                      onClick={() => handleStartTask(task.id)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      开始
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button
                        className="btn-ghost text-xs py-1.5 px-3"
                        onClick={() => {
                          setSelectedTask(task);
                          setRecords(generateInventoryRecords(task.id));
                          setShowScanModal(true);
                        }}
                      >
                        <Scan className="w-3 h-3 mr-1" />
                        扫码盘点
                      </button>
                      <button
                        className="btn-success text-xs py-1.5 px-3"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        完成
                      </button>
                    </>
                  )}
                  <button
                    className="btn-ghost text-xs py-1.5 px-3"
                    onClick={() => handleViewDetail(task)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    详情
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              暂无盘点任务
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">创建盘点任务</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  盘点名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="请输入盘点任务名称"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  盘点部门
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <label key={dept.id} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-primary-600"
                        checked={createForm.departmentIds.includes(dept.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCreateForm({
                              ...createForm,
                              departmentIds: [...createForm.departmentIds, dept.id],
                            });
                          } else {
                            setCreateForm({
                              ...createForm,
                              departmentIds: createForm.departmentIds.filter((id) => id !== dept.id),
                            });
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">{dept.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  盘点范围
                </label>
                <select className="select">
                  <option value="all">全部资产</option>
                  <option value="in_use">在用资产</option>
                  <option value="idle">闲置资产</option>
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
              <button className="btn-primary" onClick={handleCreateTask}>
                <Plus className="w-4 h-4 mr-2" />
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div
            className="modal-content max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTask.name}</h2>
                <p className="text-sm text-slate-500 mt-1">盘点详情</p>
              </div>
              <button
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowDetailModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 border-b border-slate-200">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{records.length}</p>
                  <p className="text-xs text-slate-500">总计</p>
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <p className="text-2xl font-bold text-success-600">{normalCount}</p>
                  <p className="text-xs text-slate-500">正常</p>
                </div>
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{profitCount}</p>
                  <p className="text-xs text-slate-500">盘盈</p>
                </div>
                <div className="text-center p-3 bg-danger-50 rounded-lg">
                  <p className="text-2xl font-bold text-danger-600">{lossCount}</p>
                  <p className="text-xs text-slate-500">盘亏</p>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200">
              <div className="flex">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'normal', label: '正常' },
                  { key: 'profit', label: '盘盈' },
                  { key: 'loss', label: '盘亏' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      recordTab === tab.key
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                    onClick={() => setRecordTab(tab.key as any)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">资产编号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">资产名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">盘点人</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-slate-900">{record.assetNo}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{record.assetName}</td>
                      <td className="px-4 py-3">{getRecordStatusBadge(record.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{record.checkedBy}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{record.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </button>
              <button className="btn-primary">
                导出盘点报告
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowScanModal(false)}>
          <div
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">扫码盘点</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedTask.name}</p>
              </div>
              <button
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowScanModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-center w-full h-48 bg-slate-900 rounded-lg mb-4">
                  <div className="text-center">
                    <Scan className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">将条码/二维码放入扫描框内</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="或手动输入资产编号"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                  <button className="btn-primary" onClick={handleScan}>
                    确认
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">最近盘点</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {records.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{record.assetName}</p>
                        <p className="text-xs text-slate-500 font-mono">{record.assetNo}</p>
                      </div>
                      {getRecordStatusBadge(record.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
