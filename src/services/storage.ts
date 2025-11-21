import { User, PedagogicalFile, UnitStats, INITIAL_ADMIN, UserRole } from '../types';

const KEYS = {
  USERS: 'mahdia_scouts_users',
  FILES: 'mahdia_scouts_files',
  STATS: 'mahdia_scouts_stats',
  SESSION: 'mahdia_scouts_session'
};

// Helper to safely parse JSON from localStorage
const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
};

// Helper to safely save JSON to localStorage
const safeSet = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

// Initialize DB if empty
const initDB = () => {
  try {
    if (!localStorage.getItem(KEYS.USERS)) {
      safeSet(KEYS.USERS, [INITIAL_ADMIN]);
    }
    if (!localStorage.getItem(KEYS.FILES)) {
      safeSet(KEYS.FILES, []);
    }
    if (!localStorage.getItem(KEYS.STATS)) {
      safeSet(KEYS.STATS, []);
    }
  } catch (e) {
    console.error("Storage initialization failed", e);
  }
};

export const storageService = {
  init: initDB,

  // Auth
  login: (username: string, password: string): User | null => {
    const users: User[] = safeGet(KEYS.USERS, []);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      safeSet(KEYS.SESSION, user);
      return user;
    }
    return null;
  },

  logout: () => {
    try {
      localStorage.removeItem(KEYS.SESSION);
    } catch (e) {
      console.error("Logout failed", e);
    }
  },

  getCurrentUser: (): User | null => {
    return safeGet(KEYS.SESSION, null);
  },

  // Users
  getUsers: (): User[] => {
    return safeGet(KEYS.USERS, []);
  },

  addUser: (user: User): void => {
    const users = storageService.getUsers();
    if (users.find(u => u.username === user.username)) {
      throw new Error('اسم المستخدم موجود بالفعل');
    }
    
    // Check constraint: One commissioner per section
    if (user.role === UserRole.COMMISSIONER) {
        const existingComm = users.find(u => u.role === UserRole.COMMISSIONER && u.section === user.section);
        if (existingComm) {
            throw new Error(`يوجد بالفعل مفوض لقسم ${user.section}`);
        }
    }

    users.push(user);
    safeSet(KEYS.USERS, users);
  },

  updateUser: (updatedUser: User): void => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index === -1) throw new Error("المستخدم غير موجود");

    // Check unique username only if it changed
    if (users[index].username !== updatedUser.username) {
         if (users.find(u => u.username === updatedUser.username)) {
            throw new Error('اسم المستخدم موجود بالفعل');
        }
    }

    users[index] = updatedUser;
    safeSet(KEYS.USERS, users);
    
    // Update session if updating self
    const currentSession = storageService.getCurrentUser();
    if (currentSession && currentSession.id === updatedUser.id) {
        safeSet(KEYS.SESSION, updatedUser);
    }
  },

  deleteUser: (userId: string): void => {
    let users = storageService.getUsers();
    users = users.filter(u => u.id !== userId);
    safeSet(KEYS.USERS, users);
  },

  // Files
  getFiles: (): PedagogicalFile[] => {
    return safeGet(KEYS.FILES, []);
  },

  addFile: (file: PedagogicalFile): void => {
    const files = storageService.getFiles();
    files.push(file);
    safeSet(KEYS.FILES, files);
  },

  updateFile: (updatedFile: PedagogicalFile): void => {
    const files = storageService.getFiles();
    const index = files.findIndex(f => f.id === updatedFile.id);
    if (index !== -1) {
        files[index] = updatedFile;
        safeSet(KEYS.FILES, files);
    }
  },

  deleteFile: (fileId: string): void => {
    let files = storageService.getFiles();
    files = files.filter(f => f.id !== fileId);
    safeSet(KEYS.FILES, files);
  },

  // Stats
  getStats: (): UnitStats[] => {
    return safeGet(KEYS.STATS, []);
  },

  saveStats: (stats: UnitStats): void => {
    const allStats = storageService.getStats();
    const index = allStats.findIndex(s => s.leaderId === stats.leaderId);
    if (index >= 0) {
      allStats[index] = stats;
    } else {
      allStats.push(stats);
    }
    safeSet(KEYS.STATS, allStats);
  },

  deleteStats: (leaderId: string): void => {
    let allStats = storageService.getStats();
    allStats = allStats.filter(s => s.leaderId !== leaderId);
    safeSet(KEYS.STATS, allStats);
  }
};