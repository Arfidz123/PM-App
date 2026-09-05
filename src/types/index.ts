/**
 * CMMS App - Global Type Definitions
 */

// ===== Asset Types =====
export type AssetCategory = 'telecom' | 'power' | 'cooling' | 'hvac' | 'electrical' | 'plumbing' | 'other';
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'offline';

export interface AssetData {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: number; // timestamp
  qrCode: string;
  photoPath: string;
  specifications: string; // JSON string of Record<string, string>
  checklistTemplateId: string;
  status: AssetStatus;
  createdAt: number;
  updatedAt: number;
}

// ===== Checklist Template Types =====
export type ChecklistItemType = 'pass_fail' | 'numeric' | 'text' | 'select' | 'photo';

export interface ChecklistItemTemplateData {
  id: string;
  templateId: string;
  label: string;
  type: ChecklistItemType;
  unit: string;
  options: string; // JSON string of string[]
  minValue: number | null;
  maxValue: number | null;
  required: boolean;
  order: number;
}

export interface ChecklistTemplateData {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  createdAt: number;
  updatedAt: number;
}

// ===== Inspection Types =====
export type InspectionType = 'preventive' | 'corrective' | 'predictive';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'reviewed';
export type ItemStatus = 'ok' | 'warning' | 'critical' | 'na';

export interface InspectionData {
  id: string;
  assetId: string;
  inspectorName: string;
  inspectionDate: number; // timestamp
  type: InspectionType;
  status: InspectionStatus;
  photos: string; // JSON string of string[] (photo paths)
  notes: string;
  signaturePath: string;
  pdfPath: string;
  createdAt: number;
  updatedAt: number;
}

export interface InspectionItemData {
  id: string;
  inspectionId: string;
  templateItemId: string;
  label: string;
  type: ChecklistItemType;
  value: string; // stored as string, parsed by type
  unit: string;
  status: ItemStatus;
  photoPath: string;
  notes: string;
  order: number;
}

// ===== UI Types =====
export interface SelectOption {
  label: string;
  value: string;
}

export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  todayPM: number;
  overduePM: number;
  completedThisMonth: number;
  pendingThisMonth: number;
}

// ===== Navigation Types =====
export type RootStackParamList = {
  MainTabs: undefined;
  StartInspection: undefined;
  CapturePhoto: {assetId: string};
  Checklist: {assetId: string; inspectionId: string};
  Review: {inspectionId: string};
  Signature: {inspectionId: string};
  InspectionDetail: {inspectionId: string};
  ReportPreview: {inspectionId: string};
  CategoryForm: {categoryId: string; categoryLabel: string};
  SelectPop: undefined;
  AddPop: undefined;
  InfoPop: undefined;
  KwhMeter: undefined;
  Acpdb: undefined;
  Dcpdb: undefined;
  Rectifier: undefined;
  PowerSystem: undefined;
  Genset: undefined;
  Battery: undefined;
  MechanicalElect: undefined;
  Dokumentasi: undefined;
  ExternalAlarm: undefined;
  FotIp: undefined;
  FotDwdm: undefined;
  ReviewPdf: undefined;
  HistoryReviewPdf: {inspectionId: string};
  AssetDetail: {assetId: string};
  AddAsset: {assetId?: string} | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
};
