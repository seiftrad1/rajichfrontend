import React, { useState } from 'react';
import { User, UserRole, ScoutSection } from '../types';
import { Plus, UserPlus, Search, Trash2, Pencil, X, Check } from 'lucide-react';

interface UserManagerProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ currentUser, users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState: Partial<User> = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: UserRole.COMMISSIONER,
    section: ScoutSection.ASHBAL,
    unitName: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  // Logic: Who can create whom?
  const canCreateCommissioner = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROGRAM_HEAD;
  const canCreateLeader = currentUser.role === UserRole.COMMISSIONER;

  const openAddModal = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setFormData({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password, // Pre-fill password for editing (simplified)
        role: user.role,
        section: user.section,
        unitName: user.unitName
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string, userName: string) => {
      if (window.confirm(`هل أنت متأكد من حذف المستخدم ${userName}؟`)) {
          onDeleteUser(userId);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password || !formData.firstName || !formData.lastName) {
        setError('الرجاء ملء جميع الحقول الإجبارية');
        return;
    }

    try {
        if (isEditing && formData.id) {
            // Update Logic
            const updatedUser: User = {
                id: formData.id,
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role as UserRole,
                section: formData.section as ScoutSection,
                unitName: formData.unitName,
                createdBy: currentUser.id // Preserve original creator or update? Keeping simple.
            };
            onUpdateUser(updatedUser);
        } else {
            // Create Logic
            const newUser: User = {
                id: Date.now().toString(),
                username: formData.username!,
                password: formData.password!,
                firstName: formData.firstName!,
                lastName: formData.lastName!,
                role: canCreateLeader ? UserRole.UNIT_LEADER : formData.role!,
                section: canCreateLeader ? currentUser.section : formData.section,
                unitName: formData.unitName,
                createdBy: currentUser.id
            };
            onAddUser(newUser);
        }

        setIsModalOpen(false);
        setFormData(initialFormState);
    } catch (err: any) {
        setError(err.message);
    }
  };

  // Filter visible users based on hierarchy
  const visibleUsers = users.filter(u => {
      // Hide self or higher ranks usually, but for simplicity allow seeing peers if admin
      // Don't show the main admin to prevent accidental deletion if not careful
      if (u.username === 'admin' && currentUser.username !== 'admin') return false;

      const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROGRAM_HEAD) {
          return true;
      }
      if (currentUser.role === UserRole.COMMISSIONER) {
          // Commissioners see leaders they created or leaders in their section
          return u.section === currentUser.section && u.role === UserRole.UNIT_LEADER;
      }
      return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h2>
            <p className="text-gray-500">إضافة وإدارة حسابات القادة والمفوضين</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-scout-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <UserPlus size={18} />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 text-gray-400" size={20} />
        <input 
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                    <th className="p-4">الاسم الكامل</th>
                    <th className="p-4">اسم المستخدم</th>
                    <th className="p-4">الدور</th>
                    <th className="p-4">القسم</th>
                    {currentUser.role === UserRole.COMMISSIONER && <th className="p-4">الوحدة</th>}
                    <th className="p-4">إجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {visibleUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
                        <td className="p-4 text-gray-500">{user.username}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                                user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                                user.role === UserRole.COMMISSIONER ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="p-4 text-gray-600">{user.section || '-'}</td>
                        {currentUser.role === UserRole.COMMISSIONER && <td className="p-4">{user.unitName || '-'}</td>}
                        <td className="p-4">
                            {user.id !== currentUser.id && user.username !== 'admin' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openEditModal(user)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                        title="تعديل"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id, user.username)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                {visibleUsers.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">لا يوجد مستخدمين لعرضهم</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{isEditing ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">الاسم</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border rounded p-2"
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">اللقب</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border rounded p-2"
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border rounded p-2"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">كلمة السر</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border rounded p-2"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {canCreateCommissioner && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">الدور</label>
                                <select 
                                    className="w-full border rounded p-2"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                                    disabled={isEditing} // Prevent changing role during edit to simplify logic
                                >
                                    <option value={UserRole.COMMISSIONER}>مفوض</option>
                                    {currentUser.role === UserRole.ADMIN && (
                                        <option value={UserRole.PROGRAM_HEAD}>رئيس لجنة البرنامج</option>
                                    )}
                                </select>
                            </div>
                            
                            {formData.role === UserRole.COMMISSIONER && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">القسم الفني</label>
                                    <select 
                                        className="w-full border rounded p-2"
                                        value={formData.section}
                                        onChange={e => setFormData({...formData, section: e.target.value as ScoutSection})}
                                    >
                                        {Object.values(ScoutSection).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {canCreateLeader && (
                        <div>
                            <label className="block text-sm font-medium mb-1">اسم الوحدة (الفوج)</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border rounded p-2"
                                value={formData.unitName}
                                onChange={e => setFormData({...formData, unitName: e.target.value})}
                            />
                            <p className="text-xs text-gray-500 mt-1">سيتم تعيين القسم تلقائياً: {currentUser.section}</p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button 
                            type="submit" 
                            className="flex-1 bg-scout-red text-white py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            حفظ
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};