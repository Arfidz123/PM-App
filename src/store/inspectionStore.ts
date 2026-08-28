/**
 * Inspection Store - Manages the current inspection workflow state
 */

import {create} from 'zustand';
import type {ItemStatus, InspectionType} from '../types';

interface ChecklistEntry {
  templateItemId: string;
  category: string;
  label: string;
  type: string;
  value: string;
  unit: string;
  status: ItemStatus;
  photoPath: string;
  notes: string;
  order: number;
  minValue: number | null;
  maxValue: number | null;
  options: string[];
  required: boolean;
}

interface InspectionState {
  // Current inspection data
  currentAssetId: string | null;
  inspectionType: InspectionType;
  photos: string[];
  checklistEntries: ChecklistEntry[];
  notes: string;
  signaturePath: string;
  inspectionId: string | null;
  activePopId: string | null;
  activePopName: string | null;
  activePopLocation: string | null;
  currentLocation: {lat: number; lng: number; address?: string} | null;

  // Workflow step
  currentStep: number; // 0=select, 1=photo, 2=checklist, 3=review, 4=signature

  // Form Data storage for multiple screens
  formData: Record<string, any>;
  photoTimestamps: Record<string, string>;

  // Actions
  setAsset: (assetId: string) => void;
  setInspectionType: (type: InspectionType) => void;
  addPhoto: (path: string) => void;
  removePhoto: (index: number) => void;
  addPhotoBySection: (section: string, path: string) => void;
  removePhotoBySection: (section: string, index: number) => void;
  getPhotoTimestamp: (path: string) => string;
  setChecklistEntries: (entries: ChecklistEntry[]) => void;
  updateChecklistEntry: (index: number, updates: Partial<ChecklistEntry>) => void;
  setNotes: (notes: string) => void;
  setSignaturePath: (path: string) => void;
  setInspectionId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setActivePop: (id: string | null, name?: string, location?: string, specifications?: string) => void;
  setCurrentLocation: (loc: {lat: number; lng: number; address?: string} | null) => void;
  updateFormData: (section: string, data: any) => void;
  resetInspection: () => void;
}

const formatTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`;
};

const initialState = {
  currentAssetId: null,
  inspectionType: 'preventive' as InspectionType,
  photos: [] as string[],
  checklistEntries: [] as ChecklistEntry[],
  notes: '',
  signaturePath: '',
  inspectionId: null,
  activePopId: null,
  activePopName: null,
  activePopLocation: null,
  currentLocation: null,
  currentStep: 0,
  formData: {},
  photoTimestamps: {} as Record<string, string>,
};

export const useInspectionStore = create<InspectionState>()((set, get) => ({
  ...initialState,

  setAsset: (assetId) => set({currentAssetId: assetId}),

  setInspectionType: (type) => set({inspectionType: type}),

  addPhoto: (path) =>
    set((state) => {
      const ts = state.photoTimestamps[path] || formatTimestamp();
      const newTimestamps = { ...state.photoTimestamps, [path]: ts };
      return {
        photos: state.photos.includes(path) ? state.photos : [...state.photos, path],
        photoTimestamps: newTimestamps,
        formData: {
          ...state.formData,
          photoTimestamps: newTimestamps,
        },
      };
    }),

  removePhoto: (index) =>
    set((state) => ({
      photos: state.photos.filter((_, i) => i !== index),
    })),

  addPhotoBySection: (section, path) =>
    set((state) => {
      const sectionData = state.formData[section] || {};
      const sectionPhotos: string[] = sectionData.photos || [];
      const newSectionPhotos = sectionPhotos.includes(path) ? sectionPhotos : [...sectionPhotos, path];
      const newPhotos = state.photos.includes(path) ? state.photos : [...state.photos, path];
      const ts = state.photoTimestamps[path] || formatTimestamp();
      const newTimestamps = { ...state.photoTimestamps, [path]: ts };
      return {
        photos: newPhotos,
        photoTimestamps: newTimestamps,
        formData: {
          ...state.formData,
          photoTimestamps: newTimestamps,
          [section]: {
            ...sectionData,
            photos: newSectionPhotos,
          },
        },
      };
    }),

  getPhotoTimestamp: (path: string) => {
    if (!path) return '';
    const state = get();
    if (state.photoTimestamps && state.photoTimestamps[path]) {
      return state.photoTimestamps[path];
    }
    const ts = formatTimestamp();
    const newTimestamps = { ...(state.photoTimestamps || {}), [path]: ts };
    set((s) => ({
      photoTimestamps: newTimestamps,
      formData: {
        ...s.formData,
        photoTimestamps: newTimestamps,
      },
    }));
    return ts;
  },

  removePhotoBySection: (section, index) =>
    set((state) => {
      const sectionData = state.formData[section] || {};
      const sectionPhotos: string[] = sectionData.photos || [];
      const targetUri = sectionPhotos[index];
      const newSectionPhotos = sectionPhotos.filter((_, i) => i !== index);

      let newGlobalPhotos = state.photos;
      if (targetUri) {
        const globalIdx = newGlobalPhotos.indexOf(targetUri);
        if (globalIdx !== -1) {
          newGlobalPhotos = newGlobalPhotos.filter((_, i) => i !== globalIdx);
        }
      }

      return {
        photos: newGlobalPhotos,
        formData: {
          ...state.formData,
          [section]: {
            ...sectionData,
            photos: newSectionPhotos,
          },
        },
      };
    }),

  setChecklistEntries: (entries) => set({checklistEntries: entries}),

  updateChecklistEntry: (index, updates) =>
    set((state) => {
      const entries = [...state.checklistEntries];
      entries[index] = {...entries[index], ...updates};

      // Auto-determine status for numeric values
      if (updates.value !== undefined && entries[index].type === 'numeric') {
        const numVal = parseFloat(updates.value);
        const {minValue, maxValue} = entries[index];
        if (!isNaN(numVal) && minValue !== null && maxValue !== null) {
          if (numVal >= minValue && numVal <= maxValue) {
            entries[index].status = 'ok';
          } else if (
            numVal >= minValue * 0.9 && numVal <= maxValue * 1.1
          ) {
            entries[index].status = 'warning';
          } else {
            entries[index].status = 'critical';
          }
        }
      }

      return {checklistEntries: entries};
    }),

  setNotes: (notes) => set({notes}),

  setSignaturePath: (path) => set({signaturePath: path}),

  setInspectionId: (id) => set({inspectionId: id}),

  setCurrentStep: (step) => set({currentStep: step}),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),

  prevStep: () => set((state) => ({currentStep: Math.max(0, state.currentStep - 1)})),
  
  setActivePop: (id, name, location, specifications) => {
    const inspectionStartTime = new Date().toISOString();
    let newFormData: any = {
      inspectionStartTime,
      infoPop: {
        timPLN: ''
      }
    };
    if (specifications) {
      try {
        const specs = JSON.parse(specifications);
        newFormData = {
          ...newFormData,
          powerSystem: {
            idPelanggan: '',
            dayaListrik: '',
            phasaCatuan: '',
          },
          rectifier: {
            rectifiers: [
              {
                id: '1',
                isExpanded: true,
                merk: '',
                tipe: '',
                sn: '',
                tipeModul: '',
                jmlModul: '',
                jmlSlot: '',
                modules: [],
                mcbs: Array.from({ length: 8 }, (_, i) => ({
                  id: (i + 1).toString(),
                  merk: 'SCHNEIDER',
                  kapasitas: '',
                  peruntukan: ''
                })),
                arusBeban: '',
                tegInput: '',
                tegFloating: '',
              }
            ]
          },
          battery: {
            banks: [
              {
                id: '1',
                isExpanded: true,
                merk: '',
                tipe: '',
                kapasitas: '',
                sn: '',
                tahunInstalasi: '',
                suhuBaterai: '',
                cell1: '',
                cell2: '',
                cell3: '',
                cell4: '',
                vTotal: '',
                kondisi: '',
              }
            ]
          }
        };
      } catch (e) {
        console.error("Failed to parse specifications", e);
      }
    }
    set((state) => ({
      activePopId: id,
      activePopName: name || null,
      activePopLocation: location || null,
      formData: newFormData,
      photos: [],
      checklistEntries: [],
      notes: '',
      signaturePath: '',
    }));
  },
  setCurrentLocation: (loc) => set({currentLocation: loc}),

  updateFormData: (section: string, data: any) => set((state) => ({
    formData: {
      ...state.formData,
      [section]: {
        ...(state.formData[section] || {}),
        ...data
      }
    }
  })),

  resetInspection: () => set(initialState),
}));

export type {ChecklistEntry};
