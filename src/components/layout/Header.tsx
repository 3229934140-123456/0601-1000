import { Bell, Search, User, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-slate-100 rounded-md">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索资产编号、名称..."
            className="w-80 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-900">张明</p>
              <p className="text-xs text-slate-500">资产管理员</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-fade-in z-50">
              <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50">
                个人信息
              </button>
              <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50">
                修改密码
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button className="w-full px-4 py-2 text-sm text-left text-danger-600 hover:bg-danger-50">
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
