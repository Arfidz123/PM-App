/**
 * App Store - Global application state
 */

import {create} from 'zustand';

interface AppState {
  // User/Inspector info
  inspectorName: string;
  companyName: string;

  // App state
  isDbReady: boolean;
  isFirstLaunch: boolean;

  // Actions
  setInspectorName: (name: string) => void;
  setCompanyName: (name: string) => void;
  setDbReady: (ready: boolean) => void;
  setFirstLaunch: (first: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  // Initial state
  inspectorName: '',
  companyName: '',
  isDbReady: false,
  isFirstLaunch: true,

  // Actions
  setInspectorName: (name) => set({inspectorName: name}),
  setCompanyName: (name) => set({companyName: name}),
  setDbReady: (ready) => set({isDbReady: ready}),
  setFirstLaunch: (first) => set({isFirstLaunch: first}),
}));
