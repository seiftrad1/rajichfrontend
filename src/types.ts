export enum UserRole {
  ADMIN = 'مسؤول النظام',
  PROGRAM_HEAD = 'رئيس لجنة البرنامج',
  COMMISSIONER = 'مفوض',
  UNIT_LEADER = 'قائد وحدة'
}

export enum ScoutSection {
  ASAFIR = 'عصافير',
  ASHBAL = 'أشبال',
  ZAHRAT = 'زهرات',
  KACHAFA = 'كشافة',
  MORSHIDAT = 'مرشدات',
  JAWALA = 'جوالة',
  DALILAT = 'دليلات'
}

export enum FileCategory {
  LEGAL = 'الحقيبة القانونية',
  TECHNICAL = 'الحقيبة الفنية',
  UNIT_REPORT = 'تقارير الوحدة'
}

export enum TrainingLevel {
  NONE = 'بدون تأهيل',
  PRELIMINARY = 'تمهيدي',
  WOOD_BADGE = 'شارة خشبية',
  ASSISTANT_TRAINER = 'مساعد قائد تدريب',
  LEADER_TRAINER = 'قائد تدريب'
}

export enum LeaderUnitRole {
  UNIT_LEADER = 'قائد وحدة',
  ASSISTANT = 'مساعد قائد وحدة',
  AIDE = 'معين',
  TRAINING = 'تحت التدريب'
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
  section?: ScoutSection; // Only for Commissioner and Leader
  unitName?: string; // Only for Leader
  password?: string; // In real app, never store plain text
  createdBy: string;
}

export interface PedagogicalFile {
  id: string;
  title: string;
  category: FileCategory;
  section?: ScoutSection | 'ALL'; // ALL for admin uploads visible to everyone
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  url: string; // Mock URL
  isApproved?: boolean; // New field for approval workflow
}

export interface LeaderDetail {
    id: string;
    name: string;
    trainingLevel: TrainingLevel | string;
    role: LeaderUnitRole | string;
}

export interface UnitStats {
  id: string;
  leaderId: string;
  section: ScoutSection;
  unitName: string;
  memberCount: number;
  leaders: LeaderDetail[]; // List of leaders replaces simple counters
  lastUpdated: string;
}

// Initial Admin for seeding
export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  firstName: 'مسؤول',
  lastName: 'النظام',
  role: UserRole.ADMIN,
  password: '123', // Default password
  createdBy: 'system'
};