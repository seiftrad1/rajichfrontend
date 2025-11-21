import React, { useState } from 'react';
import { User, PedagogicalFile, UserRole, FileCategory, ScoutSection } from '../types';
import { FileText, Upload, Download, Filter, Trash2, Pencil, X } from 'lucide-react';

interface PedagogicalKitProps {
  currentUser: User;
  files: PedagogicalFile[];
  onUpload: (file: PedagogicalFile) => void;
  onUpdateFile: (file: PedagogicalFile) => void;
  onDeleteFile: (fileId: string) => void;
}

export const PedagogicalKit: React.FC<PedagogicalKitProps> = ({ currentUser, files, onUpload, onUpdateFile, onDeleteFile }) => {
  const [activeTab, setActiveTab] = useState<FileCategory>(FileCategory.LEGAL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [editingFile, setEditingFile] = useState<PedagogicalFile | null>(null);

  // Upload permissions: Admin, Head, Commissioner
  const canUpload = [UserRole.ADMIN, UserRole.PROGRAM_HEAD, UserRole.COMMISSIONER].includes(currentUser.role);
  
  // Filter Files Logic
  const visibleFiles = files.filter(file => {
    if (file.category !== activeTab) return false;
    
    // Unit Leaders usually only see their section unless it's marked for ALL
    if (currentUser.role === UserRole.UNIT_LEADER) {
        return file.section === 'ALL' || file.section === currentUser.section;
    }

    // Admin/Head see all, but can filter using the dropdown
    if (sectionFilter !== 'ALL' && file.section !== 'ALL') {
        return file.section === sectionFilter;
    }

    return true;
  });

  const openUploadModal = () => {
      setEditingFile(null);
      setIsModalOpen(true);
  }

  const openEditModal = (file: PedagogicalFile) => {
      setEditingFile(file);
      setIsModalOpen(true);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    
    // Determine Section for the file
    let section: ScoutSection | 'ALL' = 'ALL';
    if (currentUser.role === UserRole.COMMISSIONER) {
        section = currentUser.section!;
    } else if (form.elements.namedItem('section')) {
        // Admin/Head selected section
        const selectedSection = (form.elements.namedItem('section') as HTMLSelectElement).value;
        section = selectedSection as ScoutSection | 'ALL';
    } else if (editingFile) {
        section = editingFile.section!;
    }

    if (editingFile) {
        const updatedFile: PedagogicalFile = {
            ...editingFile,
            title,
            section
        };
        onUpdateFile(updatedFile);
    } else {
        const newFile: PedagogicalFile = {
            id: Date.now().toString(),
            title,
            category: activeTab,
            section,
            uploaderId: currentUser.id,
            uploaderName: `${currentUser.firstName} ${currentUser.lastName}`,
            uploadDate: new Date().toLocaleDateString('ar-TN'),
            url: '#' // Mock URL
        };
        onUpload(newFile);
    }

    setIsModalOpen(false);
    form.reset();
  };

  const handleDelete = (fileId: string) => {
      if(window.confirm('هل أنت متأكد من حذف هذا الملف؟')) {
          onDeleteFile(fileId);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">الحقيبة</h2>
            <p className="text-gray-500">الموارد القانونية والفنية للكشافة</p>
        </div>
        {canUpload && (
            <button
            onClick={openUploadModal}
            className="bg-scout-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
            >
            <Upload size={18} />
            رفع ملف
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[FileCategory.LEGAL, FileCategory.TECHNICAL].map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === tab 
                    ? 'text-scout-red' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-scout-red"></div>
                )}
            </button>
        ))}
      </div>

      {/* Filters for Admin/Head */}
      {[UserRole.ADMIN, UserRole.PROGRAM_HEAD].includes(currentUser.role) && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border w-fit">
              <Filter size={16} className="text-gray-400" />
              <select 
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 text-gray-600"
              >
                  <option value="ALL">كل الأقسام</option>
                  {Object.values(ScoutSection).map(s => (
                      <option key={s} value={s}>{s}</option>
                  ))}
              </select>
          </div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleFiles.map(file => {
            const isOwner = file.uploaderId === currentUser.id;
            const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROGRAM_HEAD;
            const canModify = isOwner || isAdmin;

            return (
                <div key={file.id} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${file.category === FileCategory.LEGAL ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 line-clamp-2">{file.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {file.section === 'ALL' ? 'عام' : file.section}
                                </span>
                                <span className="text-xs text-gray-400">{file.uploadDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-xs text-gray-400">بواسطة: {file.uploaderName}</span>
                        <div className="flex items-center gap-1">
                             {canModify && (
                                <>
                                    <button 
                                        onClick={() => openEditModal(file)} 
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"
                                        title="تعديل"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(file.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                             )}
                            <button className="text-scout-red hover:bg-red-50 p-2 rounded-full transition" title="تحميل">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
        {visibleFiles.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                لا توجد ملفات في هذا القسم حالياً
            </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold">{editingFile ? 'تعديل الملف' : 'رفع ملف جديد'}</h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
               
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">عنوان الملف</label>
                        <input 
                            name="title" 
                            required 
                            type="text" 
                            className="w-full border rounded p-2" 
                            defaultValue={editingFile?.title || ''}
                        />
                    </div>
                    
                    {[UserRole.ADMIN, UserRole.PROGRAM_HEAD].includes(currentUser.role) && (
                         <div>
                            <label className="block text-sm font-medium mb-1">يظهر للقسم</label>
                            <select 
                                name="section" 
                                className="w-full border rounded p-2"
                                defaultValue={editingFile?.section || 'ALL'}
                            >
                                <option value="ALL">عام (للجميع)</option>
                                {Object.values(ScoutSection).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                         </div>
                    )}

                    {!editingFile && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
                            <Upload className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">اضغط لاختيار ملف (محاكاة)</p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="flex-1 bg-scout-red text-white py-2 rounded hover:bg-red-700">
                            {editingFile ? 'حفظ التعديلات' : 'رفع'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};