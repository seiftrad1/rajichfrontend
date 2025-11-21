import React, { useState } from 'react';
import { User, PedagogicalFile, UserRole, FileCategory, ScoutSection } from '../types';
import { UploadCloud, FileText, CheckCircle, Clock, Download, Check, Trash2, Filter, X } from 'lucide-react';

interface UnitReportsViewProps {
  currentUser: User;
  files: PedagogicalFile[];
  onUpload: (file: PedagogicalFile) => void;
  onUpdateFile: (file: PedagogicalFile) => void;
  onDeleteFile: (fileId: string) => void;
}

export const UnitReportsView: React.FC<UnitReportsViewProps> = ({ currentUser, files, onUpload, onUpdateFile, onDeleteFile }) => {
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const isLeader = currentUser.role === UserRole.UNIT_LEADER;
  const isCommissioner = currentUser.role === UserRole.COMMISSIONER;
  const isHeadOrAdmin = currentUser.role === UserRole.PROGRAM_HEAD || currentUser.role === UserRole.ADMIN;

  // --- Upload Logic (Leader Only) ---
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const titleInput = form.elements.namedItem('title') as HTMLInputElement;
    
    if (!titleInput.value.trim()) return;

    const newFile: PedagogicalFile = {
        id: Date.now().toString(),
        title: titleInput.value,
        category: FileCategory.UNIT_REPORT,
        section: currentUser.section || ScoutSection.KACHAFA, // Fallback safe
        uploaderId: currentUser.id,
        uploaderName: currentUser.unitName || `${currentUser.firstName} ${currentUser.lastName}`,
        uploadDate: new Date().toLocaleDateString('ar-TN'),
        url: '#',
        isApproved: false 
    };
    onUpload(newFile);
    form.reset();
  };

  // --- Approval Logic (Commissioner Only) ---
  const handleApprove = (file: PedagogicalFile) => {
      if (window.confirm(`هل تريد اعتماد التقرير "${file.title}"؟`)) {
          onUpdateFile({ ...file, isApproved: true });
      }
  };

  // --- Filter Logic ---
  const visibleFiles = files.filter(file => {
      // Only look at Unit Reports
      if (file.category !== FileCategory.UNIT_REPORT) return false;

      // 1. Leader: Sees ONLY their own uploads
      if (isLeader) {
          return file.uploaderId === currentUser.id;
      }

      // 2. Commissioner: Sees ALL files in their section (Pending & Approved)
      if (isCommissioner) {
          return file.section === currentUser.section;
      }

      // 3. Program Head / Admin: Sees ONLY APPROVED files from ALL sections
      if (isHeadOrAdmin) {
          // Must be approved
          if (!file.isApproved) return false;
          
          // Apply dropdown filter
          if (filterSection !== 'ALL' && file.section !== filterSection) return false;
          
          return true;
      }

      return false;
  });

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {isLeader ? 'ملفات الوحدة' : 'تقارير الوحدات'}
                </h2>
                <p className="text-gray-500">
                    {isLeader 
                        ? 'رفع التقارير الشهرية والوثائق للمفوض' 
                        : isCommissioner 
                            ? 'متابعة واعتماد تقارير الوحدات'
                            : 'أرشيف تقارير الوحدات المعتمدة'}
                </p>
            </div>

            {/* Filter for Head/Admin */}
            {isHeadOrAdmin && (
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

        {/* Upload Area for Leaders */}
        {isLeader && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <UploadCloud size={20} className="text-scout-red" />
                    رفع تقرير جديد
                </h3>
                <form onSubmit={handleUpload} className="flex gap-4">
                    <input 
                        name="title" 
                        required 
                        type="text" 
                        placeholder="عنوان التقرير / الملف..." 
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-100" 
                    />
                    <button type="submit" className="bg-scout-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition">
                        رفع وإرسال
                    </button>
                </form>
            </div>
        )}

        {/* Files List */}
        <div className="grid grid-cols-1 gap-4">
            {visibleFiles.map(file => (
                <div key={file.id} className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                    
                    {/* File Info */}
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${file.isApproved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800 text-lg">{file.title}</h4>
                                {isHeadOrAdmin && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                        {file.section}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                    بواسطة: <span className="font-medium text-gray-700">{file.uploaderName}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    بتاريخ: {file.uploadDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        
                        {/* Status Badge */}
                        {file.isApproved ? (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                <CheckCircle size={14} />
                                معتمد
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100">
                                <Clock size={14} />
                                بانتظار الموافقة
                            </div>
                        )}

                        {/* Download Button (Everyone who can see it can download it) */}
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition" title="تحميل">
                            <Download size={20} />
                        </button>

                        {/* Approve Button (Commissioner Only & Not Approved Yet) */}
                        {isCommissioner && !file.isApproved && (
                            <button 
                                onClick={() => handleApprove(file)}
                                className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
                            >
                                <Check size={16} />
                                موافقة
                            </button>
                        )}

                        {/* Delete Button (Owner if not approved, or Admin) */}
                        {( (isLeader && !file.isApproved) || currentUser.role === UserRole.ADMIN || (isCommissioner && !file.isApproved) ) && (
                             <button 
                                onClick={() => { if(confirm('هل أنت متأكد من الحذف؟')) onDeleteFile(file.id) }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                title="حذف"
                             >
                                <Trash2 size={18} />
                             </button>
                        )}
                    </div>
                </div>
            ))}

            {visibleFiles.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">لا توجد تقارير</h3>
                    <p className="text-gray-500">
                        {isLeader ? 'لم تقم برفع أي تقارير بعد' : 'لا توجد تقارير للمراجعة حالياً'}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};