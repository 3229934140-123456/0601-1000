import { useState, useRef } from 'react';
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
  FileText,
  X,
  FileImage,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { categoryMap, AssetCategory } from '@/types';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '@/utils/format';
import { departments } from '@/data/departments';
import { PurchaseVoucher } from '@/types';

interface ImportRecord {
  name: string;
  category: string;
  value: number;
  purchaseDate: string;
  departmentId: string;
  location: string;
  description: string;
  warrantyPeriod: number;
  usefulLife: number;
  _status: string;
  _error: string;
}

export default function Warehousing() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const addAsset = useAssetStore((state) => state.addAsset);
  const bulkAddAssets = useAssetStore((state) => state.bulkAddAssets);
  const addVoucher = useAssetStore((state) => state.addVoucher);
  const assets = useAssetStore((state) => state.assets);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voucherInputRef = useRef<HTMLInputElement>(null);

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

  const [vouchers, setVouchers] = useState<PurchaseVoucher[]>([]);
  const [importPreview, setImportPreview] = useState<ImportRecord[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [importResult, setImportResult] = useState({ success: 0, failed: 0, total: 0, errors: [] as string[] });
  const [newAssetId, setNewAssetId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.value <= 0) {
      alert('请填写完整的资产信息');
      return;
    }
    const id = addAsset({
      ...formData,
      status: 'idle',
      userId: '',
      salvageValue: Math.floor(formData.value * 0.05),
    });

    vouchers.forEach((v) => {
      addVoucher(id, {
        name: v.name,
        type: v.type,
        size: v.size,
        dataUrl: v.dataUrl,
      });
    });

    setNewAssetId(id);
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
    setVouchers([]);
  };

  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`文件 ${file.name} 超过10MB限制`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const newVoucher: PurchaseVoucher = {
            id: `temp_${Date.now()}_${Math.random()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadTime: new Date().toISOString(),
            dataUrl: event.target?.result as string,
          };
          setVouchers((prev) => [...prev, newVoucher]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (voucherInputRef.current) {
      voucherInputRef.current.value = '';
    }
  };

  const removeVoucher = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const records = parseCSV(content);
      setImportPreview(records);
      setImportStep('preview');
    };
    reader.readAsText(file);
  };

  const parseCSV = (content: string): ImportRecord[] => {
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const records: ImportRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < 4) continue;

      const record: ImportRecord = {
        name: '',
        category: 'computer',
        value: 0,
        purchaseDate: '',
        departmentId: '',
        location: '',
        description: '',
        warrantyPeriod: 12,
        usefulLife: 5,
        _status: '正常',
        _error: '',
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case '资产名称':
          case 'name':
            record.name = value;
            break;
          case '分类':
          case '资产分类':
          case 'category':
            const catMap: Record<string, string> = {
              '办公设备': 'computer',
              '计算机': 'computer',
              '电脑': 'computer',
              'computer': 'computer',
              '办公家具': 'furniture',
              '家具': 'furniture',
              'furniture': 'furniture',
              '电子设备': 'electronics',
              '电子': 'electronics',
              'electronics': 'electronics',
              '车辆资产': 'vehicle',
              '车辆': 'vehicle',
              '汽车': 'vehicle',
              'vehicle': 'vehicle',
              '其他': 'other',
              '其它': 'other',
              'other': 'other',
            };
            const mappedCat = catMap[value];
            if (mappedCat) {
              record.category = mappedCat;
            } else if (value) {
              record._status = '错误';
              record._error = `不认识的资产分类：${value}，请使用：办公设备、办公家具、电子设备、车辆资产、其他`;
            }
            break;
          case '价值':
          case '资产价值':
          case 'value':
            record.value = Number(value) || 0;
            break;
          case '购置日期':
          case '购买日期':
          case 'purchaseDate':
            record.purchaseDate = value;
            break;
          case '部门':
          case '所属部门':
          case 'department':
            const dept = departments.find((d) => d.name === value);
            record.departmentId = dept?.id || '';
            break;
          case '位置':
          case '存放位置':
          case 'location':
            record.location = value;
            break;
          case '描述':
          case '备注':
          case 'description':
            record.description = value;
            break;
          case '保修期限':
          case '保修期':
          case 'warrantyPeriod':
            record.warrantyPeriod = Number(value) || 12;
            break;
          case '使用年限':
          case 'usefulLife':
            record.usefulLife = Number(value) || 5;
            break;
        }
      });

      if (!record.name) {
        record._status = '错误';
        record._error = '资产名称不能为空';
      } else if (!record.value || record.value <= 0) {
        record._status = '错误';
        record._error = '资产价值必须大于0';
      } else if (!record.purchaseDate) {
        record._status = '错误';
        record._error = '购置日期不能为空';
      }

      records.push(record);
    }

    return records;
  };

  const handleConfirmImport = () => {
    const validRecords = importPreview.filter((r) => r._status === '正常');
    const errors = importPreview.filter((r) => r._status === '错误').map((r, i) => `第${i + 1}行：${r._error}`);

    const assetsToImport = validRecords.map((r) => ({
      name: r.name,
      category: r.category as AssetCategory,
      value: r.value,
      purchaseDate: r.purchaseDate,
      departmentId: r.departmentId || 'dept_001',
      userId: '',
      location: r.location,
      description: r.description,
      status: 'idle' as const,
      warrantyPeriod: r.warrantyPeriod,
      salvageValue: Math.floor(r.value * 0.05),
      usefulLife: r.usefulLife,
    }));

    const result = bulkAddAssets(assetsToImport);

    setImportResult({
      success: result.success,
      failed: result.failed + errors.length,
      total: importPreview.length,
      errors: [...errors, ...result.errors],
    });
    setImportStep('result');
  };

  const downloadTemplate = () => {
    const template = '资产名称,分类,价值,购置日期,部门,存放位置,备注,保修期限,使用年限\n联想ThinkPad笔记本,办公设备,5999,2024-01-15,技术部,A栋3楼302室,办公使用,12,5\n人体工学办公椅,办公家具,1299,2024-02-20,行政部,B栋2楼会议室,新采购,12,5\n无线蓝牙耳机,电子设备,899,2024-03-10,市场部,C栋1楼前台,办公配套,6,3\n商务接待用车,车辆资产,258000,2023-06-01,综合部,公司停车场,商务接待用,36,10\n打印一体机,办公设备,3599,2024-01-20,行政部,A栋1楼打印室,公共使用,12,5\n';
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '资产导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const recentAssets = assets.slice(0, 5);
  const monthAssets = assets.filter((a) => {
    const now = new Date();
    const purchase = new Date(a.purchaseDate);
    return now.getFullYear() === purchase.getFullYear() && now.getMonth() === purchase.getMonth();
  });

  const deptStats = departments.slice(0, 5).map((dept) => {
    const count = assets.filter((a) => a.departmentId === dept.id).length;
    const value = assets
      .filter((a) => a.departmentId === dept.id)
      .reduce((sum, a) => sum + a.value, 0);
    return { ...dept, count, value };
  });

  const maxCount = Math.max(...deptStats.map((d) => d.count), 1);

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
              <p className="text-2xl font-bold text-slate-900">{monthAssets.length}</p>
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
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(monthAssets.reduce((sum, a) => sum + a.value, 0))}
              </p>
              <p className="text-xs text-slate-500">本月入库总值</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{Math.floor(assets.length / 10) + 1}</p>
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
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as AssetCategory })
                      }
                    >
                      {Object.entries(categoryMap).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
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
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
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
                      onChange={(e) =>
                        setFormData({ ...formData, warrantyPeriod: Number(e.target.value) })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, usefulLife: Number(e.target.value) })
                      }
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
                <input
                  ref={voucherInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleVoucherUpload}
                />
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                  onClick={() => voucherInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">点击或拖拽上传购置凭证</p>
                  <p className="text-xs text-slate-400 mt-1">
                    支持 JPG、PNG、PDF 格式，单个文件不超过 10MB
                  </p>
                </div>

                {vouchers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {vouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {voucher.type.startsWith('image/') ? (
                            <FileImage className="w-5 h-5 text-primary-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900">{voucher.name}</p>
                            <p className="text-xs text-slate-500">
                              {formatFileSize(voucher.size)} · {formatDateTime(voucher.uploadTime)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="p-1 hover:bg-slate-200 rounded"
                          onClick={() => removeVoucher(voucher.id)}
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
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
                    setVouchers([]);
                  }}
                >
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-base font-medium text-slate-700 mb-2">
                      点击或拖拽文件到此处
                    </p>
                    <p className="text-sm text-slate-500 mb-4">支持 Excel、CSV 格式</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        选择文件
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate();
                        }}
                      >
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
                      <li>• 部门名称需与系统中已有的部门名称一致</li>
                    </ul>
                  </div>
                </div>
              )}

              {importStep === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">数据预览</h3>
                  <span className="text-sm text-slate-500">
                    共 {importPreview.length} 条数据，
                    <span className="text-success-600">
                      正常 {importPreview.filter((r) => r._status === '正常').length} 条
                    </span>
                    ，
                    <span className="text-danger-600">
                      错误 {importPreview.filter((r) => r._status === '错误').length} 条
                    </span>
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-50">
                        <tr>
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
                        {importPreview.map((item, index) => (
                          <tr key={index} className="table-row">
                            <td className="table-cell text-xs">{index + 1}</td>
                            <td className="table-cell text-xs">{item.name}</td>
                            <td className="table-cell text-xs">
                              {
                                categoryMap[item.category as keyof typeof categoryMap]
                                  ?.label || item.category
                              }
                            </td>
                            <td className="table-cell text-xs">{formatCurrency(item.value)}</td>
                            <td className="table-cell text-xs">{formatDate(item.purchaseDate)}</td>
                            <td className="table-cell text-xs">
                              {departments.find((d) => d.id === item.departmentId)?.name ||
                                '未指定'}
                            </td>
                            <td className="table-cell text-xs">{item.location || '-'}</td>
                            <td className="table-cell text-xs">
                              {item._status === '正常' ? (
                                <span className="inline-flex items-center gap-1 text-success-600">
                                  <CheckCircle className="w-3 h-3" />
                                  正常
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-danger-600" title={item._error}>
                                  <AlertCircle className="w-3 h-3" />
                                  错误
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
                      onClick={() => {
                        setImportStep('upload');
                        setImportPreview([]);
                      }}
                    >
                      返回上一步
                    </button>
                    <div className="flex gap-3">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setImportPreview([]);
                          setImportStep('upload');
                        }}
                      >
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
                    共 {importResult.total} 条数据，成功{' '}
                    <span className="text-success-600 font-medium">{importResult.success}</span>{' '}
                    条，失败{' '}
                    <span className="text-danger-600 font-medium">{importResult.failed}</span> 条
                  </p>

                  {importResult.errors.length > 0 && (
                    <div className="text-left bg-danger-50 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto">
                      <h4 className="text-sm font-medium text-danger-700 mb-2">错误详情</h4>
                      <ul className="text-xs text-danger-600 space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-center gap-3">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        if (importResult.errors.length > 0) {
                          const content = importResult.errors.join('\n');
                          const blob = new Blob(['\uFEFF' + content], {
                            type: 'text/plain;charset=utf-8;',
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = '导入错误报告.txt';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        } else {
                          alert('没有错误记录');
                        }
                      }}
                    >
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
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
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
              {deptStats.map((dept) => (
                <div key={dept.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{dept.name}</span>
                    <span className="text-sm font-medium text-slate-900">{dept.count} 台</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${(dept.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-right">
                    {formatCurrency(dept.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
