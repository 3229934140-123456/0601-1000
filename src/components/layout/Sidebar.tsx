import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowLeftRight,
  Repeat,
  Wrench,
  ClipboardList,
  BarChart3,
  Settings,
  Building2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/assets', label: '资产台账', icon: Package },
  { path: '/warehousing', label: '入库登记', icon: ArrowDownToLine },
  { path: '/usage', label: '领用归还', icon: Repeat },
  { path: '/transfer', label: '调拨申请', icon: ArrowLeftRight },
  { path: '/maintenance', label: '维修工单', icon: Wrench },
  { path: '/inventory', label: '盘点任务', icon: ClipboardList },
  { path: '/scrap', label: '报废审批', icon: Trash2 },
  { path: '/reports', label: '报表中心', icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col shadow-sidebar fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">资产管理系统</h1>
          <p className="text-xs text-slate-500">企业资产全生命周期管理</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          资产管理
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'sidebar-item group',
                  isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button className="sidebar-item sidebar-item-inactive w-full">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>系统设置</span>
        </button>
      </div>
    </aside>
  );
}
