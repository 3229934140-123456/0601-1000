import { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { AssetCategory, AssetStatus } from '@/types';
import { categoryMap } from '@/types';
import { departments } from '@/data/departments';
import { users } from '@/data/users';

interface AddAssetModalProps {
  onClose: () => void;
}

export default function AddAssetModal({ onClose }: AddAssetModalProps) {
  const addAsset = useAssetStore((state) => state.addAsset);
  const [formData, setFormData] = useState({
    name: '',
    category: 'computer' as AssetCategory,
    status: 'idle' as AssetStatus,
    value: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    departmentId: 'dept_001',
    userId: '',
    location: '',
    description: '',
    warrantyPeriod: 12,
    salvageValue: 0,
    usefulLife: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAsset({
      ...formData,
      salvageValue: Math.floor(formData.value * 0.05),
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">新增资产</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">基本信息</h3>
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
                    onChange={(e) => handleChange('name', e.target.value)}
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
                    onChange={(e) => handleChange('category', e.target.value)}
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
                    value={formData.value}
                    onChange={(e) => handleChange('value', Number(e.target.value))}
                    min={0}
                    step={0.01}
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
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">使用信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    所属部门 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    className="select"
                    value={formData.departmentId}
                    onChange={(e) => handleChange('departmentId', e.target.value)}
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    使用人
                  </label>
                  <select
                    className="select"
                    value={formData.userId}
                    onChange={(e) => handleChange('userId', e.target.value)}
                  >
                    <option value="">未分配</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    资产状态
                  </label>
                  <select
                    className="select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="idle">闲置</option>
                    <option value="in_use">在用</option>
                    <option value="maintenance">维修中</option>
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
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">财务信息</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    保修期限（月）
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.warrantyPeriod}
                    onChange={(e) => handleChange('warrantyPeriod', Number(e.target.value))}
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
                    onChange={(e) => handleChange('usefulLife', Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    残值（元）
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.salvageValue}
                    onChange={(e) => handleChange('salvageValue', Number(e.target.value))}
                    min={0}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">购置凭证</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">点击或拖拽上传购置凭证</p>
                <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG、PDF 格式</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                备注说明
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="请输入备注信息"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
