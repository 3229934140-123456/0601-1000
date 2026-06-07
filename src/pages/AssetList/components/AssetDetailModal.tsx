import { X, Calendar, MapPin, User, Building2, Tag, DollarSign, Clock, FileText, Wrench, ArrowLeftRight, Package } from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { statusMap, categoryMap } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { getDepartmentName, getUserName } from '@/data/users';
import { calculateStraightLineDepreciation } from '@/utils/depreciation';
import { generateAssetLogs } from '@/data/logs';

interface AssetDetailModalProps {
  assetId: string;
  onClose: () => void;
}

export default function AssetDetailModal({ assetId, onClose }: AssetDetailModalProps) {
  const asset = useAssetStore((state) => state.getAssetById(assetId));

  if (!asset) return null;

  const statusInfo = statusMap[asset.status];
  const categoryInfo = categoryMap[asset.category];
  const depreciation = calculateStraightLineDepreciation({
    originalValue: asset.value,
    salvageValue: asset.salvageValue,
    usefulLife: asset.usefulLife,
    purchaseDate: asset.purchaseDate,
  });

  const logs = generateAssetLogs(asset.id, asset.name);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{asset.name}</h2>
              <span className={statusInfo.className}>{statusInfo.label}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">{asset.assetNo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                基本信息
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">资产分类</span>
                  <span className="text-slate-900">{categoryInfo.label}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">资产价值</span>
                  <span className="text-slate-900 font-medium">{formatCurrency(asset.value)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">购置日期</span>
                  <span className="text-slate-900">{formatDate(asset.purchaseDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">保修期限</span>
                  <span className="text-slate-900">{asset.warrantyPeriod} 个月</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                使用信息
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">所属部门</span>
                  <span className="text-slate-900">{getDepartmentName(asset.departmentId)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">使用人</span>
                  <span className="text-slate-900">{asset.userId ? getUserName(asset.userId) : '未分配'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 w-20">存放位置</span>
                  <span className="text-slate-900">{asset.location}</span>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-primary-600" />
                折旧信息
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">月折旧额</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(depreciation.monthlyDepreciation)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">累计折旧</p>
                  <p className="text-lg font-bold text-warning-600 mt-1">
                    {formatCurrency(depreciation.accumulatedDepreciation)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">账面净值</p>
                  <p className="text-lg font-bold text-success-600 mt-1">
                    {formatCurrency(depreciation.netValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">剩余使用</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {depreciation.remainingMonths} 个月
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary-600" />
                备注说明
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {asset.description || '暂无备注'}
              </p>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary-600" />
                操作日志
              </h3>
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-primary-500' : 'bg-slate-300'
                      }`}></div>
                      {index < logs.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">{log.action}</span>
                        <span className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        操作人：{log.operator}
                        {log.remark && ` · ${log.remark}`}
                      </p>
                      {log.oldValue && log.newValue && (
                        <p className="text-xs text-slate-500 mt-1">
                          {log.oldValue} → {log.newValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
          <button className="btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            编辑资产
          </button>
        </div>
      </div>
    </div>
  );
}
