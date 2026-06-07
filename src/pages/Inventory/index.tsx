import { useState, useMemo } from 'react';
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
  User,
  Calendar,
  Building2,
  Eye,
  Scan,
  X,
  Check,
  Download,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { departments } from '@/data/departments';
import { InventoryTask, InventoryRecord, AssetCategory } from '@/types';
import { categoryMap } from '@/types';
import { formatDateTime } from '@/utils/format';
import { exportInventoryReport } from '@/utils/export';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed' | 'abnormal'>('in_progress');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InventoryTask | null>(null);
  const [recordTab, setRecordTab] = useState<'all' | 'normal' | 'profit' | 'loss'>('all');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InventoryRecord | null>(null);
  const [profitForm, setProfitForm] = useState({
    name: '',
    category: 'other' as AssetCategory,
    value: 0,
    departmentId: 'dept_001',
    location: '',
    description: '',
  });
  const [abnormalFilters, setAbnormalFilters] = useState({
    taskId: '',
    status: 'all' as 'all' | 'profit' | 'loss',
    processed: 'all' as 'all' | 'pending' | 'processed',
  });

  const inventoryTasks = useAssetStore((state) => state.inventoryTasks);
  const inventoryRecords = useAssetStore((state) => state.inventoryRecords);
  const createInventoryTask = useAssetStore((state) => state.createInventoryTask);
  const startInventoryTask = useAssetStore((state) => state.startInventoryTask);
  const checkInventoryAsset = useAssetStore((state) => state.checkInventoryAsset);
  const completeInventoryTask = useAssetStore((state) => state.completeInventoryTask);
  const getInventoryRecords = useAssetStore((state) => state.getInventoryRecords);
  const processInventoryProfit = useAssetStore((state) => state.processInventoryProfit);
  const processInventoryLoss = useAssetStore((state) => state.processInventoryLoss);

  const [createForm, setCreateForm] = useState({
    name: '',
    departmentIds: [] as string[],
  });

  const filteredTasks = inventoryTasks.filter((task) => {
    if (activeTab === 'in_progress') return task.status === 'in_progress' || task.status === 'pending';
    return task.status === 'completed';
  });

  const records = useMemo(() => {
    if (!selectedTask) return [];
    return getInventoryRecords(selectedTask.id);
  }, [selectedTask, getInventoryRecords, inventoryTasks]);

  const stats = {
    inProgress: inventoryTasks.filter((t) => t.status === 'in_progress' || t.status === 'pending').length,
    completed: inventoryTasks.filter((t) => t.status === 'completed').length,
    total: inventoryTasks.length,
  };

  const allAbnormalRecords = useMemo(() => {
    const result: Array<InventoryRecord & { taskName: string; taskStatus: string }> = [];
    inventoryTasks.forEach((task) => {
      const taskRecords = getInventoryRecords(task.id);
      taskRecords
        .filter((r) => r.status === 'profit' || r.status === 'loss')
        .forEach((r) => {
          result.push({ ...r, taskName: task.name, taskStatus: task.status });
        });
    });
    return result;
  }, [inventoryTasks, inventoryRecords, getInventoryRecords]);

  const filteredAbnormalRecords = useMemo(() => {
    return allAbnormalRecords.filter((r) => {
      if (abnormalFilters.taskId && r.taskId !== abnormalFilters.taskId) return false;
      if (abnormalFilters.status !== 'all' && r.status !== abnormalFilters.status) return false;
      if (abnormalFilters.processed === 'pending' && r.processed) return false;
      if (abnormalFilters.processed === 'processed' && !r.processed) return false;
      return true;
    });
  }, [allAbnormalRecords, abnormalFilters]);

  const abnormalStats = {
    total: allAbnormalRecords.length,
    pending: allAbnormalRecords.filter((r) => !r.processed).length,
    profit: allAbnormalRecords.filter((r) => r.status === 'profit').length,
    loss: allAbnormalRecords.filter((r) => r.status === 'loss').length,
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
    setRecordTab('all');
    setShowDetailModal(true);
  };

  const handleStartTask = (taskId: string) => {
    if (confirm('确认开始该盘点任务吗？')) {
      startInventoryTask(taskId);
      setSelectedTask(inventoryTasks.find(t => t.id === taskId) || null);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    if (confirm('确认完成该盘点任务吗？完成后将生成盘点报告。')) {
      completeInventoryTask(taskId);
      const updatedTask = inventoryTasks.find(t => t.id === taskId);
      if (updatedTask) {
        setSelectedTask({ ...updatedTask, status: 'completed' });
      }
      setShowScanModal(false);
    }
  };

  const handleCreateTask = () => {
    if (!createForm.name) {
      alert('请输入盘点任务名称');
      return;
    }
    createInventoryTask({
      name: createForm.name,
      departmentIds: createForm.departmentIds,
      creator: '张明',
      startDate: new Date().toISOString().split('T')[0],
    });
    setShowCreateModal(false);
    setCreateForm({ name: '', departmentIds: [] });
    alert('盘点任务创建成功！');
  };

  const handleScan = () => {
    if (!scanInput || !selectedTask) return;
    
    const result = checkInventoryAsset(selectedTask.id, scanInput.trim());
    setScanResult({ success: result.success, message: result.message });
    setScanInput('');
    
    const updatedTask = inventoryTasks.find(t => t.id === selectedTask.id);
    if (updatedTask) {
      setSelectedTask(updatedTask);
    }
    
    setTimeout(() => setScanResult(null), 2000);
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
  const normalCount = records.filter((r) => r.status === 'normal' && r.checkedAt).length;
  const uncheckedCount = records.filter((r) => !r.checkedAt && r.status === 'normal').length;

  const inProgressCount = stats.inProgress;
  const completedCount = stats.completed;
  const abnormalCount = abnormalStats.pending;

  const handleExportReport = (task?: InventoryTask) => {
    const targetTask = task || selectedTask;
    if (targetTask) {
      const taskRecords = getInventoryRecords(targetTask.id);
      exportInventoryReport(targetTask.name, taskRecords, `盘点报告_${targetTask.name}_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

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
              { key: 'abnormal', label: '异常处理', count: abnormalCount },
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

        {activeTab !== 'abnormal' && (
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
        )}

        {activeTab === 'abnormal' && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <select
                className="select w-48"
                value={abnormalFilters.taskId}
                onChange={(e) => setAbnormalFilters({ ...abnormalFilters, taskId: e.target.value })}
              >
                <option value="">全部盘点任务</option>
                {inventoryTasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.name}</option>
                ))}
              </select>
              <select
                className="select w-36"
                value={abnormalFilters.status}
                onChange={(e) => setAbnormalFilters({ ...abnormalFilters, status: e.target.value as any })}
              >
                <option value="all">全部异常类型</option>
                <option value="profit">盘盈</option>
                <option value="loss">盘亏</option>
              </select>
              <select
                className="select w-36"
                value={abnormalFilters.processed}
                onChange={(e) => setAbnormalFilters({ ...abnormalFilters, processed: e.target.value as any })}
              >
                <option value="all">全部处理状态</option>
                <option value="pending">未处理</option>
                <option value="processed">已处理</option>
              </select>
              <div className="flex-1" />
              <div className="text-sm text-slate-500">
                共 <span className="font-medium text-slate-900">{filteredAbnormalRecords.length}</span> 条异常记录
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'abnormal' ? (
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

                    {task.status === 'in_progress' && task.totalAssets > 0 && (
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
                    {task.status === 'completed' && (
                      <button
                        className="btn-secondary text-xs py-1.5 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportReport(task);
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        导出报告
                      </button>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-header">盘点任务</th>
                  <th className="table-header">资产编号</th>
                  <th className="table-header">资产名称</th>
                  <th className="table-header">异常类型</th>
                  <th className="table-header">处理状态</th>
                  <th className="table-header">盘点人</th>
                  <th className="table-header">盘点时间</th>
                  <th className="table-header">备注</th>
                  <th className="table-header text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAbnormalRecords.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">
                      <span className="text-sm text-slate-900">{record.taskName}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm font-mono text-slate-900">{record.assetNo}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-900">{record.assetName}</span>
                    </td>
                    <td className="table-cell">
                      {getRecordStatusBadge(record.status)}
                    </td>
                    <td className="table-cell">
                      {record.processed ? (
                        <span className="badge bg-success-100 text-success-700 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" />
                          已处理
                        </span>
                      ) : (
                        <span className="badge bg-warning-100 text-warning-700 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          未处理
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{record.checkedBy}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{formatDateTime(record.checkedAt)}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{record.remark || '-'}</span>
                    </td>
                    <td className="table-cell text-right">
                      {!record.processed && (
                        <div className="flex items-center justify-end gap-2">
                          {record.status === 'profit' && (
                            <>
                              <button
                                className="text-xs text-primary-600 hover:text-primary-700"
                                onClick={() => {
                                  const task = inventoryTasks.find((t) => t.id === record.taskId);
                                  setSelectedTask(task || null);
                                  setSelectedRecord(record);
                                  setProfitForm({
                                    name: record.assetName,
                                    category: 'other',
                                    value: 0,
                                    departmentId: 'dept_001',
                                    location: '',
                                    description: record.remark || '',
                                  });
                                  setShowProfitModal(true);
                                }}
                              >
                                补录资产
                              </button>
                              <button
                                className="text-xs text-slate-500 hover:text-slate-700"
                                onClick={() => {
                                  if (confirm('确认标记为忽略吗？')) {
                                    processInventoryProfit(record.taskId, record.id, 'ignore');
                                  }
                                }}
                              >
                                忽略
                              </button>
                            </>
                          )}
                          {record.status === 'loss' && (
                            <button
                              className="text-xs text-danger-600 hover:text-danger-700"
                              onClick={() => {
                                const task = inventoryTasks.find((t) => t.id === record.taskId);
                                setSelectedTask(task || null);
                                setSelectedRecord(record);
                                setShowLossModal(true);
                              }}
                            >
                              确认盘亏
                            </button>
                          )}
                        </div>
                      )}
                      {record.processed && (
                        <span className="text-xs text-slate-400">
                          {record.processType === 'add_asset' && '已补录'}
                          {record.processType === 'ignore' && '已忽略'}
                          {record.processType === 'confirm_loss' && '已确认盘亏'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAbnormalRecords.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                暂无异常记录
              </div>
            )}
          </div>
        )}
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
                <p className="text-xs text-slate-500 mt-2">不选择则盘点全部部门</p>
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
            className="modal-content max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTask.name}</h2>
                <p className="text-sm text-slate-500 mt-1">盘点详情</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTask.status === 'completed' && (
                  <button className="btn-secondary btn-sm" onClick={() => handleExportReport()}>
                    <Download className="w-4 h-4 mr-1" />
                    导出报告
                  </button>
                )}
                <button
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-slate-200">
              <div className="grid grid-cols-5 gap-4">
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
                  <p className="text-xs text-primary-500 mt-0.5">
                    未处理 {records.filter(r => r.status === 'profit' && !r.processed).length} / 已处理 {records.filter(r => r.status === 'profit' && r.processed).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-danger-50 rounded-lg">
                  <p className="text-2xl font-bold text-danger-600">{lossCount}</p>
                  <p className="text-xs text-slate-500">盘亏</p>
                  <p className="text-xs text-danger-500 mt-0.5">
                    未处理 {records.filter(r => r.status === 'loss' && !r.processed).length} / 已处理 {records.filter(r => r.status === 'loss' && r.processed).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-warning-50 rounded-lg">
                  <p className="text-2xl font-bold text-warning-600">
                    {records.filter(r => r.status !== 'normal' && !r.processed).length}
                  </p>
                  <p className="text-xs text-slate-500">待处理</p>
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

            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">资产编号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">资产名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">盘点人</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">盘点时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">备注</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-slate-900">{record.assetNo}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{record.assetName}</td>
                      <td className="px-4 py-3">{getRecordStatusBadge(record.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{record.checkedBy || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {record.checkedAt ? formatDateTime(record.checkedAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {record.processed ? record.processRemark : (record.remark || '-')}
                      </td>
                      <td className="px-4 py-3">
                        {record.status === 'profit' && !record.processed && selectedTask && (
                          <div className="flex items-center gap-2">
                            <button
                              className="text-xs text-primary-600 hover:text-primary-700"
                              onClick={() => {
                                setSelectedRecord(record);
                                setProfitForm({
                                  name: record.assetName,
                                  category: 'other',
                                  value: 0,
                                  departmentId: 'dept_001',
                                  location: '',
                                  description: `盘盈资产，原编号：${record.assetNo}`,
                                });
                                setShowProfitModal(true);
                              }}
                            >
                              补录资产
                            </button>
                            <button
                              className="text-xs text-slate-600 hover:text-slate-700"
                              onClick={() => {
                                if (confirm('确认标记为忽略吗？')) {
                                  processInventoryProfit(selectedTask.id, record.id, 'ignore');
                                  setSelectedTask({ ...selectedTask });
                                }
                              }}
                            >
                              忽略
                            </button>
                          </div>
                        )}
                        {record.status === 'loss' && !record.processed && selectedTask && (
                          <button
                            className="text-xs text-danger-600 hover:text-danger-700"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowLossModal(true);
                            }}
                          >
                            确认盘亏
                          </button>
                        )}
                        {record.processed && (
                          <span className="text-xs text-slate-400">已处理</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  暂无记录
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                关闭
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
                    autoFocus
                  />
                  <button className="btn-primary" onClick={handleScan}>
                    确认
                  </button>
                </div>
                {scanResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    scanResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                  }`}>
                    {scanResult.message}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-700">盘点进度</h3>
                  <span className="text-xs text-slate-500">
                    {selectedTask.checkedAssets} / {selectedTask.totalAssets}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{
                      width: `${selectedTask.totalAssets > 0 ? (selectedTask.checkedAssets / selectedTask.totalAssets) * 100 : 0}%`,
                    }}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-700 mb-3">最近盘点</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {records
                    .filter(r => r.checkedAt)
                    .slice(-5)
                    .reverse()
                    .map((record) => (
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
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowScanModal(false)}
              >
                关闭
              </button>
              <button
                className="btn-success"
                onClick={() => handleCompleteTask(selectedTask.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                完成盘点
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfitModal && selectedRecord && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowProfitModal(false)}>
          <div
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">盘盈资产补录</h2>
                <p className="text-sm text-slate-500 mt-1">将盘盈资产登记为正式资产</p>
              </div>
              <button
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowProfitModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-900">原盘点信息</p>
                  <p className="text-xs text-primary-700 mt-1">
                    资产编号：{selectedRecord.assetNo}
                  </p>
                  <p className="text-xs text-primary-700">
                    资产名称：{selectedRecord.assetName}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  资产名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={profitForm.name}
                  onChange={(e) => setProfitForm({ ...profitForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    资产分类 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    className="select"
                    value={profitForm.category}
                    onChange={(e) => setProfitForm({ ...profitForm, category: e.target.value as AssetCategory })}
                  >
                    {Object.entries(categoryMap).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    资产价值（元）
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={profitForm.value}
                    onChange={(e) => setProfitForm({ ...profitForm, value: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    所属部门
                  </label>
                  <select
                    className="select"
                    value={profitForm.departmentId}
                    onChange={(e) => setProfitForm({ ...profitForm, departmentId: e.target.value })}
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    存放位置
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={profitForm.location}
                    onChange={(e) => setProfitForm({ ...profitForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  备注说明
                </label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  value={profitForm.description}
                  onChange={(e) => setProfitForm({ ...profitForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowProfitModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!profitForm.name) {
                    alert('请填写资产名称');
                    return;
                  }
                  processInventoryProfit(selectedTask.id, selectedRecord.id, 'add_asset', {
                    ...profitForm,
                    assetNo: selectedRecord.assetNo,
                  });
                  setShowProfitModal(false);
                  setSelectedTask({ ...selectedTask });
                  alert('盘盈资产补录成功！');
                }}
              >
                <Package className="w-4 h-4 mr-2" />
                确认补录
              </button>
            </div>
          </div>
        </div>
      )}

      {showLossModal && selectedRecord && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowLossModal(false)}>
          <div
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">确认盘亏</h2>
                <p className="text-sm text-slate-500 mt-1">确认该资产盘亏后将标记为丢失状态</p>
              </div>
              <button
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowLossModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-danger-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-danger-900">确认盘亏资产</p>
                    <p className="text-xs text-danger-700 mt-1">
                      资产编号：{selectedRecord.assetNo}
                    </p>
                    <p className="text-xs text-danger-700">
                      资产名称：{selectedRecord.assetName}
                    </p>
                    <p className="text-xs text-danger-700 mt-2">
                      确认后资产状态将变更为「丢失」，此操作不可撤销。
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  盘亏原因
                </label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="请输入盘亏原因..."
                  id="lossRemark"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowLossModal(false)}
              >
                取消
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  const remarkInput = document.getElementById('lossRemark') as HTMLTextAreaElement;
                  const remark = remarkInput?.value || '';
                  processInventoryLoss(selectedTask.id, selectedRecord.id, 'confirm_loss', remark);
                  setShowLossModal(false);
                  setSelectedTask({ ...selectedTask });
                  alert('已确认盘亏');
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                确认盘亏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
