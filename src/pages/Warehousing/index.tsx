import { useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowDownToLine,
  Package,
  Calendar,
  DollarSign,
  Building2,
  MapPin,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { categoryMap, AssetCategory } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { departments } from '@/data/departments';

export default function Warehousing() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const addAsset = useAssetStore((state) => state.addAsset);
  const assets = useAssetStore((state) => state.assets);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'computer' as AssetCategory,
    value: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    departmentId: 'dept_001',
    location: '',
    description: '',
    warrantyPeriod: 12,
    usefulLife: 5,
  });

  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [importResult, setImportResult] = useState({ success: 0, failed: 0, total: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAsset({
      ...formData,
      status: 'idle',
      userId: '',
      salvageValue: Math.floor(formData.value * 0.05),
    });
    alert('资产入库成功！');
    setFormData({
      name: '',
      category: 'computer',
      value: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      departmentId: 'dept_001',
      location: '',
      description: '',
      warrantyPeriod: 12,
      usefulLife: 5,
    });
  };

  const simulateImport = () => {
    const mockData = [
      { no: 1, name: '笔记本电脑', category: 'computer', value: 5999, purchaseDate: '2024-05-01', department: '技术部', location: 'A栋3层', status: '正常' },
      { no: 2, name: '台式电脑', category: 'computer', value: 4500, purchaseDate: '2024-05-02', department: '市场部', location: 'B栋2层', status: '正常' },
      { no: 3, name: '打印机', category: 'computer', value: 2800, purchaseDate: '2024-05-03', department: '行政部', location: 'A栋5层', status: '正常' },
      { no: 4, name: '办公椅', category: 'furniture', value: 850, purchaseDate: '2024-05-04', department: '人力资源部', location: 'C栋1层', status: '警告：缺少分类' },
      { no: 5, name: '手机', category: 'electronics', value: 3999, purchaseDate: '2024-05-05', department: '客服部', location: 'D栋3层', status: '正常' },
    ];
    setImportPreview(mockData);
    setImportStep('preview');
  };

  const handleConfirmImport = () => {
    const successCount = importPreview.filter((item) => item.status === '正常').length;
    const failedCount = importPreview.length - successCount;
    setImportResult({ success: successCount, failed: failedCount, total: importPreview.length });
    setImportStep('result');
  };

  const recentAssets = assets.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">入库登记</h1>
          <p className="text-sm text-slate-500 mt-1">管理资产入库，支持单个录入和批量导入</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{assets.length}</p>
              <p className="text-xs text-slate-500">资产总数</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">12</p>
              <p className="text-xs text-slate-500">本月入库</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">¥68.5万</p>
              <p className="text-xs text-slate-500">入库总值</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-xs text-slate-500">批量导入次数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'single'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('single')}
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                单个入库
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'batch'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('batch')}
              >
                <Upload className="w-4 h-4 inline-block mr-2" />
                批量导入
              </button>
            </div>
          </div>

          {activeTab === 'single' ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary-600" />
                  资产信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      资产名称 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="请输入资产名称"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      资产分类 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      className="select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    >
                      {Object.entries(categoryMap).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      资产价值 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="请输入资产价值"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      购置日期 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      所属部门 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      className="select"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
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
                      placeholder="请输入存放位置"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  财务信息
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      保修期限（月）
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={formData.warrantyPeriod}
                      onChange={(e) => setFormData({ ...formData, warrantyPeriod: Number(e.target.value) })}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      使用年限（年）
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={formData.usefulLife}
                      onChange={(e) => setFormData({ ...formData, usefulLife: Number(e.target.value) })}
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      预计残值（5%）
                    </label>
                    <input
                      type="text"
                      className="input bg-slate-50"
                      value={formatCurrency(Math.floor(formData.value * 0.05))}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary-600" />
                  购置凭证
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">点击或拖拽上传购置凭证</p>
                  <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG、PDF 格式，单个文件不超过 10MB</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" className="btn-secondary">
                  重置
                </button>
                <button type="submit" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  确认入库
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              {importStep === 'upload' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-base font-medium text-slate-700 mb-2">点击或拖拽文件到此处</p>
                    <p className="text-sm text-slate-500 mb-4">支持 Excel、CSV 格式</p>
                    <div className="flex items-center justify-center gap-3">
                      <button className="btn-primary" onClick={simulateImport}>
                        <Upload className="w-4 h-4 mr-2" />
                        选择文件
                      </button>
                      <button className="btn-secondary">
                        <Download className="w-4 h-4 mr-2" />
                        下载模板
                      </button>
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-primary-700 mb-2">导入说明</h4>
                    <ul className="text-xs text-primary-600 space-y-1">
                      <li>• 请使用系统提供的导入模板，确保数据格式正确</li>
                      <li>• 资产编号由系统自动生成，无需填写</li>
                      <li>• 必填字段：资产名称、分类、价值、购置日期</li>
                      <li>• 单次导入最多支持 1000 条数据</li>
                    </ul>
                  </div>
                </div>
              )}

              {importStep === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">数据预览</h3>
                    <span className="text-sm text-slate-500">
                      共 {importPreview.length} 条数据
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="table-header text-xs">序号</th>
                          <th className="table-header text-xs">资产名称</th>
                          <th className="table-header text-xs">分类</th>
                          <th className="table-header text-xs">价值</th>
                          <th className="table-header text-xs">购置日期</th>
                          <th className="table-header text-xs">所属部门</th>
                          <th className="table-header text-xs">存放位置</th>
                          <th className="table-header text-xs">校验状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item) => (
                          <tr key={item.no} className="table-row">
                            <td className="table-cell text-xs">{item.no}</td>
                            <td className="table-cell text-xs">{item.name}</td>
                            <td className="table-cell text-xs">
                              {categoryMap[item.category as keyof typeof categoryMap]?.label || item.category}
                            </td>
                            <td className="table-cell text-xs">{formatCurrency(item.value)}</td>
                            <td className="table-cell text-xs">{formatDate(item.purchaseDate)}</td>
                            <td className="table-cell text-xs">{item.department}</td>
                            <td className="table-cell text-xs">{item.location}</td>
                            <td className="table-cell text-xs">
                              {item.status === '正常' ? (
                                <span className="inline-flex items-center gap-1 text-success-600">
                                  <CheckCircle className="w-3 h-3" />
                                  正常
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-warning-600">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      className="btn-secondary"
                      onClick={() => setImportStep('upload')}
                    >
                      返回上一步
                    </button>
                    <div className="flex gap-3">
                      <button className="btn-secondary">
                        <Trash2 className="w-4 h-4 mr-2" />
                        清空数据
                      </button>
                      <button className="btn-primary" onClick={handleConfirmImport}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        确认导入
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {importStep === 'result' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">导入完成</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    共 {importResult.total} 条数据，成功 {importResult.success} 条，失败 {importResult.failed} 条
                  </p>
                  <div className="flex justify-center gap-3">
                    <button className="btn-secondary">
                      下载错误报告
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setImportStep('upload');
                        setImportPreview([]);
                      }}
                    >
                      继续导入
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              最近入库
            </h3>
            <div className="space-y-3">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{asset.name}</p>
                    <p className="text-xs text-slate-500">{formatDate(asset.purchaseDate)}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(asset.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" />
              各部门入库统计
            </h3>
            <div className="space-y-3">
              {departments.slice(0, 5).map((dept, index) => {
                const count = Math.floor(Math.random() * 15) + 3;
                const value = count * (Math.floor(Math.random() * 3000) + 1000);
                const percent = Math.floor((count / 20) * 100);
                
                return (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{dept.name}</span>
                      <span className="text-sm font-medium text-slate-900">{count} 台</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-right">
                      {formatCurrency(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
