import React, { useEffect, useState } from 'react';
import { storageService } from './services/storage';
import { User, PedagogicalFile, UnitStats, UserRole, FileCategory } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManager } from './components/UserManager';
import { PedagogicalKit } from './components/PedagogicalKit';
import { UnitStatsView } from './components/UnitStatsView';
import { UnitReportsView } from './components/UnitReportsView'; // Import new component
import { UploadCloud, Lock, Loader2, Trash2, Pencil, X, Check } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Data State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [filesList, setFilesList] = useState<PedagogicalFile[]>([]);
  const [statsList, setStatsList] = useState<UnitStats[]>([]);
  
  // Auth Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const initApp = () => {
      try {
        storageService.init();
        const session = storageService.getCurrentUser();
        if (session) {
          setUser(session);
          // Load data immediately if session exists
          setUsersList(storageService.getUsers());
          setFilesList(storageService.getFiles());
          setStatsList(storageService.getStats());
        }
      } catch (error) {
        console.error("Failed to initialize application:", error);
        // Ensure we don't get stuck in loading state even if something fails
        storageService.logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  const loadData = () => {
    try {
      setUsersList(storageService.getUsers());
      setFilesList(storageService.getFiles());
      setStatsList(storageService.getStats());
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedUser = storageService.login(loginUsername, loginPassword);
      if (loggedUser) {
        setUser(loggedUser);
        setLoginError('');
        loadData();
        setView('dashboard');
      } else {
        setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setLoginError('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    setLoginUsername('');
    setLoginPassword('');
  };

  // Actions passed to components
  const addUser = (newUser: User) => {
    storageService.addUser(newUser);
    loadData();
  };

  const updateUser = (updatedUser: User) => {
      storageService.updateUser(updatedUser);
      loadData();
  }

  const deleteUser = (userId: string) => {
      storageService.deleteUser(userId);
      loadData();
  }

  const addFile = (newFile: PedagogicalFile) => {
    storageService.addFile(newFile);
    loadData();
  };

  const updateFile = (updatedFile: PedagogicalFile) => {
      storageService.updateFile(updatedFile);
      loadData();
  }

  const deleteFile = (fileId: string) => {
      storageService.deleteFile(fileId);
      loadData();
  }

  const saveStats = (newStats: UnitStats) => {
    storageService.saveStats(newStats);
    loadData();
  };

  const deleteStats = (leaderId: string) => {
      storageService.deleteStats(leaderId);
      loadData();
  }

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-scout-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-scout-red animate-spin" />
          <p className="text-gray-500 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-scout-red p-8 text-center text-white">
             <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Lock size={32} className="text-white" />
             </div>
             <h1 className="text-2xl font-bold">فضاء جهة المهدية</h1>
             <p className="text-red-100 mt-2">تسجيل الدخول للمنظومة</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">{loginError}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input 
                type="password" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="123"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-scout-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition duration-200"
            >
              دخول
            </button>

            <div className="text-center text-xs text-gray-400 mt-4">
               استخدم admin / 123 للدخول لأول مرة
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Main App
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} currentView={view} onChangeView={setView} onLogout={handleLogout} />
      
      <main className="flex-1 mr-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && <Dashboard user={user} users={usersList} stats={statsList} files={filesList} />}
            {view === 'users' && <UserManager currentUser={user} users={usersList} onAddUser={addUser} onUpdateUser={updateUser} onDeleteUser={deleteUser} />}
            {view === 'kit' && <PedagogicalKit currentUser={user} files={filesList} onUpload={addFile} onUpdateFile={updateFile} onDeleteFile={deleteFile} />}
            {view === 'stats' && <UnitStatsView currentUser={user} stats={statsList} onSaveStats={saveStats} onDeleteStats={deleteStats} />}
            
            {/* New Unit Reports View replacing LeaderUploads */}
            {view === 'unit-reports' && <UnitReportsView currentUser={user} files={filesList} onUpload={addFile} onUpdateFile={updateFile} onDeleteFile={deleteFile} />}
        </div>
      </main>
    </div>
  );
};

export default App;