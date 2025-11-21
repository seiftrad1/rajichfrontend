import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Users, FolderOpen, FileBarChart, LogOut, Shield, UploadCloud, FileCheck } from 'lucide-react';

interface SidebarProps {
  user: User;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onChangeView, onLogout }) => {
  const isAdminOrHead = user.role === UserRole.ADMIN || user.role === UserRole.PROGRAM_HEAD;
  const isCommissioner = user.role === UserRole.COMMISSIONER;
  const isLeader = user.role === UserRole.UNIT_LEADER;

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => onChangeView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentView === id
          ? 'bg-scout-red text-white shadow-md'
          : 'text-gray-600 hover:bg-red-50 hover:text-scout-red'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-white h-screen shadow-xl flex flex-col fixed right-0 top-0 z-50 border-l border-gray-100">
      <div className="p-6 border-b border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-scout-red rounded-full flex items-center justify-center text-white mb-3 shadow-lg">
            <Shield size={32} />
        </div>
        <h1 className="text-xl font-bold text-scout-dark">جهة المهدية</h1>
        <span className="text-xs text-gray-500 mt-1">الكشافة التونسية</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <NavItem id="dashboard" label="لوحة القيادة" icon={LayoutDashboard} />
        
        {(isAdminOrHead || isCommissioner) && (
          <NavItem id="users" label="إدارة المستخدمين" icon={Users} />
        )}

        <NavItem id="kit" label="الحقيبة" icon={FolderOpen} />

        {/* Unit Reports: Visible to Everyone but with different functionality */}
        <NavItem 
            id="unit-reports" 
            label={isLeader ? "ملفات الوحدة" : "تقارير الوحدات"} 
            icon={isLeader ? UploadCloud : FileCheck} 
        />

        <NavItem id="stats" label={isLeader ? "بيانات الوحدة" : "الإحصائيات والبيانات"} icon={FileBarChart} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                {user.firstName[0]}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-bold"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};