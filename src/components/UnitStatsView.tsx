import React, { useState } from 'react';
import { User, UnitStats, UserRole, ScoutSection, LeaderDetail, TrainingLevel, LeaderUnitRole } from '../types';
import { Save, Filter, Trash2, Plus, UserMinus, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';

interface UnitStatsViewProps {
  currentUser: User;
  stats: UnitStats[];
  onSaveStats: (stats: UnitStats) => void;
  onDeleteStats: (leaderId: string) => void;
}

export const UnitStatsView: React.FC<UnitStatsViewProps> = ({ currentUser, stats, onSaveStats, onDeleteStats }) => {
  const isLeader = currentUser.role === UserRole.UNIT_LEADER;
  const existingStat = stats.find(s => s.leaderId === currentUser.id);
  
  // --- LEADER VIEW STATE ---
  const [memberCount, setMemberCount] = useState<number>(existingStat?.memberCount || 0);
  // Initialize leaders list, or fallback to empty array
  const [leadersList, setLeadersList] = useState<LeaderDetail[]>(existingStat?.leaders || []);
  const [savedMsg, setSavedMsg] = useState('');

  // --- ADMIN/COMMISSIONER VIEW STATE ---
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [expandedStatId, setExpandedStatId] = useState<string | null>(null);

  // --- HANDLERS FOR LEADER ---
  const addLeaderRow = () => {
      const newLeader: LeaderDetail = {
          id: Date.now().toString(),
          name: '',
          trainingLevel: TrainingLevel.PRELIMINARY,
          role: LeaderUnitRole.ASSISTANT
      };
      setLeadersList([...leadersList, newLeader]);
  };

  const removeLeaderRow = (id: string) => {
      setLeadersList(leadersList.filter(l => l.id !== id));
  };

  const updateLeaderRow = (id: string, field: keyof LeaderDetail, value: string) => {
      setLeadersList(leadersList.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLeader) return;

    // Validation
    if (leadersList.some(l => !l.name.trim())) {
        alert('يرجى إدخال أسماء جميع القادة');
        return;
    }

    const newStat: UnitStats = {
        id: existingStat?.id || Date.now().toString(),
        leaderId: currentUser.id,
        section: currentUser.section!,
        unitName: currentUser.unitName || 'وحدة',
        memberCount: Number(memberCount),
        leaders: leadersList,
        lastUpdated: new Date().toLocaleDateString('ar-TN')
    };
    onSaveStats(newStat);
    setSavedMsg('تم حفظ البيانات بنجاح');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleReset = () => {
      if (window.confirm("هل أنت متأكد من حذف/تصفير كافة بيانات الوحدة؟")) {
          onDeleteStats(currentUser.id);
          setMemberCount(0);
          setLeadersList([]);
          setSavedMsg('تم حذف البيانات');
      }
  };

  // --- FILTER LOGIC FOR ADMIN ---
  const visibleStats = stats.filter(s => {
      if (currentUser.role === UserRole.COMMISSIONER) return s.section === currentUser.section;
      if (filterSection !== 'ALL') return s.section === filterSection;
      return true;
  });

  // ---------------- RENDER FOR LEADER ----------------
  if (isLeader) {
    return (
      <div className="max-w-4xl mx-auto">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">بيانات الوحدة: {currentUser.unitName}</h2>
            <p className="text-gray-500">يرجى تحديث عدد الأفراد وقائمة القادة</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
             {/* General Stats */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">الإحصائيات العامة</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأفراد (المنتسبين)</label>
                        <input 
                            type="number" min="0"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-100 outline-none transition"
                            value={memberCount}
                            onChange={e => setMemberCount(parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">عدد القادة (محسوب تلقائياً)</label>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 font-bold">
                            {leadersList.length}
                        </div>
                    </div>
                </div>
             </div>

             {/* Leaders List */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">إطار الوحدة (القادة)</h3>
                    <button type="button" onClick={addLeaderRow} className="text-sm flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition">
                        <Plus size={16} />
                        إضافة قائد
                    </button>
                </div>

                <div className="space-y-3">
                    {leadersList.length === 0 && <p className="text-center text-gray-400 py-4">لا يوجد قادة مسجلين. اضغط على "إضافة قائد"</p>}
                    
                    {leadersList.map((leader, index) => (
                        <div key={leader.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                             <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1 block">الاسم واللقب</label>
                                <input 
                                    type="text"
                                    placeholder="اسم القائد"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-300"
                                    value={leader.name}
                                    onChange={e => updateLeaderRow(leader.id, 'name', e.target.value)}
                                />
                             </div>
                             <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1 block">المستوى التدريبي</label>
                                <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-300 bg-white"
                                    value={leader.trainingLevel}
                                    onChange={e => updateLeaderRow(leader.id, 'trainingLevel', e.target.value)}
                                >
                                    {Object.values(TrainingLevel).map(lvl => (
                                        <option key={lvl} value={lvl}>{lvl}</option>
                                    ))}
                                </select>
                             </div>
                             <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1 block">المهمة بالوحدة</label>
                                <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-300 bg-white"
                                    value={leader.role}
                                    onChange={e => updateLeaderRow(leader.id, 'role', e.target.value)}
                                >
                                    {Object.values(LeaderUnitRole).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                             </div>
                             <button 
                                type="button" 
                                onClick={() => removeLeaderRow(leader.id)}
                                className="text-red-500 hover:bg-red-100 p-2 rounded mt-5 md:mt-4"
                                title="حذف"
                             >
                                <UserMinus size={18} />
                             </button>
                        </div>
                    ))}
                </div>
             </div>

             <div className="pt-4 flex gap-3 sticky bottom-4">
                <button type="submit" className="flex-1 bg-scout-red text-white py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg transition flex justify-center items-center gap-2">
                    <Save size={20} />
                    حفظ البيانات
                </button>
                {existingStat && (
                     <button type="button" onClick={handleReset} className="px-4 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 shadow-lg transition flex justify-center items-center gap-2">
                        <Trash2 size={20} />
                    </button>
                )}
             </div>
             {savedMsg && <p className="text-green-600 text-center mt-2 font-medium animate-pulse">{savedMsg}</p>}
        </form>
      </div>
    );
  }

  // ---------------- RENDER FOR ADMIN / COMMISSIONER ----------------
  return (
    <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">الإحصائيات التفصيلية</h2>
                <p className="text-gray-500">متابعة بيانات الوحدات وقائمة القادة</p>
            </div>
            
            {[UserRole.ADMIN, UserRole.PROGRAM_HEAD].includes(currentUser.role) && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                    <Filter size={16} className="text-gray-400" />
                    <select 
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-transparent border-none text-sm focus:ring-0 text-gray-600"
                    >
                        <option value="ALL">كل الأقسام</option>
                        {Object.values(ScoutSection).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>

        <div className="space-y-4">
            {visibleStats.map(stat => {
                const isExpanded = expandedStatId === stat.id;
                return (
                    <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Header Row */}
                        <div 
                            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => setExpandedStatId(isExpanded ? null : stat.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isExpanded ? 'bg-scout-red' : 'bg-gray-300'}`}>
                                    {stat.unitName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{stat.unitName}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                        {stat.section}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center hidden md:block">
                                    <p className="text-xs text-gray-400">عدد الأفراد</p>
                                    <p className="font-bold text-blue-600 text-lg">{stat.memberCount}</p>
                                </div>
                                <div className="text-center hidden md:block">
                                    <p className="text-xs text-gray-400">عدد القادة</p>
                                    <p className="font-bold text-gray-800 text-lg">{stat.leaders?.length || 0}</p>
                                </div>
                                <div className="text-gray-400">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 p-5 bg-gray-50/30">
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <UserIcon size={16} />
                                    قائمة الإطار (القادة)
                                </h4>
                                {stat.leaders && stat.leaders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-right bg-white rounded-lg border border-gray-200">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="p-3 border-b">الاسم</th>
                                                    <th className="p-3 border-b">المستوى التدريبي</th>
                                                    <th className="p-3 border-b">المهمة</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stat.leaders.map(leader => (
                                                    <tr key={leader.id} className="border-b last:border-0">
                                                        <td className="p-3 font-medium">{leader.name}</td>
                                                        <td className="p-3">
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                                {leader.trainingLevel}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-gray-600">{leader.role}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm italic">لم يتم إدخال قائمة القادة بعد.</p>
                                )}
                                <div className="mt-4 text-xs text-gray-400 text-left">
                                    آخر تحديث: {stat.lastUpdated}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {visibleStats.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    لا توجد بيانات متاحة حالياً
                </div>
            )}
        </div>
    </div>
  );
};