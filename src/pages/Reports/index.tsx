import { useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  Users,
  Building2,
  Wrench,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAssetStore } from '@/store/useAssetStore';
import { formatCurrency, formatDate } from '@/utils/format';
import { departments } from '@/data/departments';
import { categoryMap } from '@/types';
import { calculateYearlyDepreciation } from '@/utils/depreciation';
import {
  exportAssetList,
  exportDepreciationReport,
  exportTransferOrders,
  exportMaintenanceOrders,
  exportScrapOrders,
  exportInventoryReport,
  downloadCSV,
} from '@/utils/export';

const CHART_COLORS = ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'overview' | 'category' | 'department' | 'depreciation' | 'maintenance'>('overview');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('year');

  const assets = useAssetStore((state) => state.assets);
  const maintenanceOrders = useAssetStore((state) => state.maintenanceOrders);
  const transferOrders = useAssetStore((state) => state.transferOrders);
  const scrapOrders = useAssetStore((state) => state.scrapOrders);
  const inventoryTasks = useAssetStore((state) => state.inventoryTasks);
  const getInventoryRecords = useAssetStore((state) => state.getInventoryRecords);
  const assetLogs = useAssetStore((state) => state.assetLogs);

  const stats = {
    totalAssets: assets.length,
    totalValue: assets.reduce((sum, a) => sum + a.value, 0),
    inUse: assets.filter((a) => a.status === 'in_use').length,
    idle: assets.filter((a) => a.status === 'idle').length,
    maintenance: assets.filter((a) => a.status === 'maintenance').length,
    scrapped: assets.filter((a) => a.status === 'scrapped').length,
  };

  const categoryData = Object.entries(categoryMap).map(([key, value]) => ({
    name: value.label,
    value: assets.filter((a) => a.category === key).reduce((sum, a) => sum + a.value, 0),
    count: assets.filter((a) => a.category === key).length,
  }));

  const departmentData = departments.map((dept) => ({
    name: dept.name,
    count: assets.filter((a) => a.departmentId === dept.id).length,
    value: assets.filter((a) => a.departmentId === dept.id).reduce((sum, a) => sum + a.value, 0),
  }));

  const statusData = [
    { name: '在用', value: assets.filter((a) => a.status === 'in_use').length, color: '#2563eb' },
    { name: '闲置', value: assets.filter((a) => a.status === 'idle').length, color: '#64748b' },
    { name: '维修中', value: assets.filter((a) => a.status === 'maintenance').length, color: '#f59e0b' },
    { name: '已报废', value: assets.filter((a) => a.status === 'scrapped').length, color: '#ef4444' },
    { name: '调拨中', value: assets.filter((a) => a.status === 'transferred').length, color: '#8b5cf6' },
  ];

  const depreciationData = assets.slice(0, 10).map((asset) => {
    const yearly = calculateYearlyDepreciation(asset.value, asset.salvageValue, asset.usefulLife);
    return {
      name: asset.name,
      原值: asset.value,
      累计折旧: asset.value - asset.salvageValue - yearly.netValue,
      净值: yearly.netValue,
    };
  });

  const monthlyData = [
    { month: '1月', 新增: 5, 报废: 1, 维修: 3, 调拨: 2 },
    { month: '2月', 新增: 3, 报废: 0, 维修: 5, 调拨: 1 },
    { month: '3月', 新增: 8, 报废: 2, 维修: 4, 调拨: 3 },
    { month: '4月', 新增: 4, 报废: 1, 维修: 6, 调拨: 2 },
    { month: '5月', 新增: 6, 报废: 0, 维修: 3, 调拨: 4 },
    { month: '6月', 新增: 5, 报废: 1, 维修: 7, 调拨: 2 },
    { month: '7月', 新增: 7, 报废: 3, 维修: 5, 调拨: 1 },
    { month: '8月', 新增: 4, 报废: 1, 维修: 4, 调拨: 3 },
    { month: '9月', 新增: 3, 报废: 0, 维修: 6, 调拨: 2 },
    { month: '10月', 新增: 5, 报废: 2, 维修: 3, 调拨: 5 },
    { month: '11月', 新增: 6, 报废: 1, 维修: 5, 调拨: 2 },
    { month: '12月', 新增: 4, 报废: 0, 维修: 4, 调拨: 3 },
  ];

  const maintenanceCostData = [
    { month: '1月', 费用: 2500 },
    { month: '2月', 费用: 3800 },
    { month: '3月', 费用: 4200 },
    { month: '4月', 费用: 3100 },
    { month: '5月', 费用: 2800 },
    { month: '6月', 费用: 5200 },
  ];

  const handleExport = (type: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    switch (type) {
      case '资产台账清单':
        exportAssetList(assets, `资产清单_${dateStr}.csv`);
        break;
      case '部门资产报表': {
        const headers = ['部门名称', '资产数量', '资产总值', '占比'];
        const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
        const rows = departments.map((dept) => {
          const deptAssets = assets.filter((a) => a.departmentId === dept.id);
          const deptValue = deptAssets.reduce((sum, a) => sum + a.value, 0);
          return [
            dept.name,
            deptAssets.length,
            formatCurrency(deptValue),
            `${((deptValue / totalValue) * 100).toFixed(1)}%`,
          ];
        });
        const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
        downloadCSV(csvContent, `部门资产报表_${dateStr}.csv`);
        break;
      }
      case '折旧明细表':
        exportDepreciationReport(assets, `折旧明细表_${dateStr}.csv`);
        break;
      case '维修费用报表':
        exportMaintenanceOrders(maintenanceOrders, `维修工单_${dateStr}.csv`);
        break;
      case '盘点报告': {
        const completedTasks = inventoryTasks.filter((t) => t.status === 'completed');
        if (completedTasks.length === 0) {
          alert('暂无已完成的盘点任务');
          return;
        }
        const latestTask = completedTasks[0];
        const records = getInventoryRecords(latestTask.id);
        exportInventoryReport(latestTask.name, records, `盘点报告_${latestTask.name}_${dateStr}.csv`);
        break;
      }
      case '调拨记录':
        exportTransferOrders(transferOrders, `调拨记录_${dateStr}.csv`);
        break;
      case '报废清单':
        exportScrapOrders(scrapOrders, `报废清单_${dateStr}.csv`);
        break;
      case '操作日志': {
        const headers = ['资产编号', '资产名称', '操作类型', '操作人', '操作时间', '备注'];
        const allLogs: Array<{
          assetNo: string;
          assetName: string;
          action: string;
          operator: string;
          createdAt: string;
          remark: string;
        }> = [];
        
        assets.forEach((asset) => {
          const logs = assetLogs[asset.id] || [];
          logs.forEach((log) => {
            allLogs.push({
              assetNo: asset.assetNo,
              assetName: asset.name,
              action: log.action,
              operator: log.operator,
              createdAt: log.createdAt,
              remark: log.remark || '',
            });
          });
        });
        
        allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const rows = allLogs.map((log) => [
          log.assetNo,
          log.assetName,
          log.action,
          log.operator,
          formatDate(log.createdAt),
          log.remark,
        ]);
        
        const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
        downloadCSV(csvContent, `操作日志_${dateStr}.csv`);
        break;
      }
      case '全部报表':
        exportAssetList(assets, `资产清单_${dateStr}.csv`);
        exportDepreciationReport(assets, `折旧明细表_${dateStr}.csv`);
        exportTransferOrders(transferOrders, `调拨记录_${dateStr}.csv`);
        exportMaintenanceOrders(maintenanceOrders, `维修工单_${dateStr}.csv`);
        exportScrapOrders(scrapOrders, `报废清单_${dateStr}.csv`);
        alert('已导出全部报表到下载文件夹');
        break;
      default:
        alert(`正在导出${type}...`);
    }
  };

  const totalMaintenanceCost = maintenanceOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">报表中心</h1>
          <p className="text-sm text-slate-500 mt-1">资产数据统计分析和报表导出</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select w-32"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年度</option>
          </select>
          <button className="btn-primary" onClick={() => handleExport('全部报表')}>
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-xs text-success-600 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalAssets}</p>
          <p className="text-xs text-slate-500 mt-1">资产总数</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success-600" />
            </div>
            <span className="text-xs text-success-600 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +8.5%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
          <p className="text-xs text-slate-500 mt-1">资产总值</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-warning-600" />
            </div>
            <span className="text-xs text-danger-600 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              -5.2%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMaintenanceCost)}</p>
          <p className="text-xs text-slate-500 mt-1">维修费用</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Minus className="w-3 h-3" />
              持平
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
          <p className="text-xs text-slate-500 mt-1">使用部门</p>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { key: 'overview', label: '总览', icon: BarChart3 },
              { key: 'category', label: '分类统计', icon: PieChart },
              { key: 'department', label: '部门分布', icon: Building2 },
              { key: 'depreciation', label: '折旧估算', icon: TrendingUp },
              { key: 'maintenance', label: '维修分析', icon: Wrench },
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
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">月度资产变动趋势</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="新增" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="报废" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="维修" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="调拨" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">资产状态分布</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">资产分类数量</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#64748b" width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'category' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">资产分类价值分布</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">分类明细表</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 text-xs font-medium text-slate-500 uppercase">资产分类</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">数量</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">总价值</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">占比</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 text-sm text-slate-900">{item.name}</td>
                        <td className="py-3 text-sm text-right text-slate-700">{item.count}</td>
                        <td className="py-3 text-sm text-right text-slate-700">{formatCurrency(item.value)}</td>
                        <td className="py-3 text-sm text-right text-slate-700">
                          {((item.value / stats.totalValue) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-primary-600 text-sm hover:underline">查看明细</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'department' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">各部门资产数量</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">各部门资产价值排名</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData.sort((a, b) => b.value - a.value)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#64748b" width={100} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'depreciation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">资产原值总计</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">累计折旧</p>
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(stats.totalValue * 0.35)}</p>
                </div>
                <div className="p-4 bg-success-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">资产净值</p>
                  <p className="text-xl font-bold text-success-600">{formatCurrency(stats.totalValue * 0.65)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">资产折旧明细（部分）</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 text-xs font-medium text-slate-500 uppercase">资产名称</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">原值</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">预计残值</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">使用年限</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">年折旧额</th>
                      <th className="text-right py-3 text-xs font-medium text-slate-500 uppercase">净值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 10).map((asset) => {
                      const yearly = calculateYearlyDepreciation(asset.value, asset.salvageValue, asset.usefulLife);
                      return (
                        <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 text-sm text-slate-900">{asset.name}</td>
                          <td className="py-3 text-sm text-right text-slate-700">{formatCurrency(asset.value)}</td>
                          <td className="py-3 text-sm text-right text-slate-700">{formatCurrency(asset.salvageValue)}</td>
                          <td className="py-3 text-sm text-right text-slate-700">{asset.usefulLife} 年</td>
                          <td className="py-3 text-sm text-right text-primary-600">{formatCurrency(yearly.yearlyDepreciation)}</td>
                          <td className="py-3 text-sm text-right text-success-600">{formatCurrency(yearly.netValue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">总工单数</p>
                  <p className="text-xl font-bold text-slate-900">{maintenanceOrders.length}</p>
                </div>
                <div className="p-4 bg-warning-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">待处理</p>
                  <p className="text-xl font-bold text-warning-600">
                    {maintenanceOrders.filter((o) => o.status === 'pending').length}
                  </p>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">维修中</p>
                  <p className="text-xl font-bold text-primary-600">
                    {maintenanceOrders.filter((o) => o.status === 'in_progress').length}
                  </p>
                </div>
                <div className="p-4 bg-success-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">已完成</p>
                  <p className="text-xl font-bold text-success-600">
                    {maintenanceOrders.filter((o) => o.status === 'completed').length}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">月度维修费用趋势</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={maintenanceCostData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="费用"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: '#2563eb', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">维修费用TOP5</h3>
                <div className="space-y-3">
                  {maintenanceOrders
                    .filter((o) => o.status === 'completed')
                    .sort((a, b) => b.cost - a.cost)
                    .slice(0, 5)
                    .map((order, index) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-400 text-white' :
                            index === 1 ? 'bg-slate-400 text-white' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{order.assetName}</p>
                            <p className="text-xs text-slate-500">{order.provider}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-danger-600">{formatCurrency(order.cost)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            常用报表导出
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: '资产台账清单', desc: '全部资产明细列表', icon: Package },
              { name: '部门资产报表', desc: '各部门资产统计', icon: Building2 },
              { name: '折旧明细表', desc: '资产折旧计算表', icon: TrendingUp },
              { name: '维修费用报表', desc: '维修费用统计', icon: Wrench },
              { name: '盘点报告', desc: '盘点结果汇总', icon: BarChart3 },
              { name: '调拨记录', desc: '资产调拨历史', icon: Users },
              { name: '报废清单', desc: '已报废资产列表', icon: FileText },
              { name: '操作日志', desc: '资产变更记录', icon: Calendar },
            ].map((item, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-colors"
                onClick={() => handleExport(item.name)}
              >
                <item.icon className="w-8 h-8 text-primary-600 mb-3" />
                <h4 className="text-sm font-medium text-slate-900">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                <button className="mt-3 text-xs text-primary-600 flex items-center gap-1 hover:underline">
                  <Download className="w-3 h-3" />
                  立即导出
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
