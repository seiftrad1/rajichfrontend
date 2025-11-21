import React, { useMemo } from 'react';
import { User, UnitStats, UserRole, PedagogicalFile, ScoutSection } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Award } from 'lucide-react';

interface DashboardProps {
  user: User;
  users: User[];
  stats: UnitStats[];
  files: PedagogicalFile[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const Dashboard: React.FC<DashboardProps> = ({ user, users, stats, files }) => {
  
  const summary = useMemo(() => {
    let relevantStats = stats;
    if (user.role === UserRole.COMMISSIONER && user.section) {
        relevantStats = stats.filter(s => s.section === user.section);
    }

    const totalMembers = relevantStats.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);
    // Calculate total leaders based on the leaders array length
    const totalLeaders = relevantStats.reduce((acc, curr) => acc + (curr.leaders?.length || 0), 0);
    const totalFiles = files.length;

    return { totalMembers, totalLeaders, totalFiles };
  }, [stats, files, user]);

  const chartData = useMemo(() => {
    // Aggregate members by section
    const data: any = {};
    Object.values(ScoutSection).forEach(s => data[s] = 0);
    
    stats.forEach(stat => {
        if (data[stat.section] !== undefined) {
            data[stat.section] += stat.memberCount;
        }
    });

    return Object.keys(data).map(key => ({
        name: key,
        members: data[key]
    }));
  }, [stats]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">مرحباً، {user.firstName}</h2>
        <p className="text-gray-500">نظرة عامة على فضاء جهة المهدية للكشافة التونسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="إجمالي الأفراد" value={summary.totalMembers} icon={Users} color="bg-blue-500" />
        <StatCard title="عدد القادة" value={summary.totalLeaders} icon={Award} color="bg-green-500" />
        <StatCard title="الملفات المرفوعة" value={summary.totalFiles} icon={FileText} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Members per Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">توزيع الأفراد حسب القسم</h3>
            <div className="h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="members" fill="#c8102e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Welcome / Updates Area */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">تعليمات هامة</h3>
            <div className="space-y-4 text-gray-600">
                <div className="p-4 bg-blue-50 rounded-lg border-r-4 border-blue-500">
                    <p className="font-medium text-blue-800">مرحلة التسجيل</p>
                    <p className="text-sm mt-1">يرجى من كافة القادة استكمال بيانات وحداتهم (الأفراد وقائمة القادة) قبل موعد 15 أكتوبر.</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border-r-4 border-yellow-500">
                    <p className="font-medium text-yellow-800">الحقيبة</p>
                    <p className="text-sm mt-1">تم تحديث الملفات القانونية الخاصة بالمخيمات الصيفية.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};