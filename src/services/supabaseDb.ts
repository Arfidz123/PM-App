import { supabase } from './supabase';

export interface SupabaseAsset {
  id: string;
  asset_code: string;
  name: string;
  category?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  install_date?: string | null;
  qr_code?: string;
  photo_path?: string;
  specifications?: any;
  checklist_template_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseInspection {
  id: string;
  asset_id: string;
  inspector_name?: string;
  inspection_date?: string;
  type?: string;
  status?: string;
  photos?: string[];
  notes?: string;
  signature_path?: string;
  pdf_path?: string;
  form_data?: any;
  is_synced?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all assets from Supabase DB
 */
export const fetchAssetsFromSupabase = async (): Promise<SupabaseAsset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching assets from Supabase:', error);
    throw error;
  }

  return data || [];
};

/**
 * Upsert single asset to Supabase DB
 */
export const upsertAssetToSupabase = async (asset: SupabaseAsset) => {
  const { data, error } = await supabase
    .from('assets')
    .upsert(asset, { onConflict: 'id' });

  if (error) {
    console.error(`Error upserting asset ${asset.id} to Supabase:`, error);
    throw error;
  }

  return data;
};

/**
 * Bulk seed assets to Supabase DB
 */
export const bulkSeedAssetsToSupabase = async (assets: SupabaseAsset[]) => {
  const { data, error } = await supabase
    .from('assets')
    .upsert(assets, { onConflict: 'id' });

  if (error) {
    console.error('Error bulk seeding assets to Supabase:', error);
    throw error;
  }

  return data;
};

/**
 * Save / Insert an inspection to Supabase DB
 */
export const saveInspectionToSupabase = async (inspection: SupabaseInspection) => {
  const { data, error } = await supabase
    .from('inspections')
    .upsert(inspection, { onConflict: 'id' });

  if (error) {
    console.error('Error saving inspection to Supabase:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch all inspections from Supabase DB
 */
export const fetchInspectionsFromSupabase = async (): Promise<SupabaseInspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inspections from Supabase:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch single inspection by ID from Supabase DB
 */
export const fetchInspectionByIdFromSupabase = async (id: string): Promise<SupabaseInspection | null> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching inspection ${id} from Supabase:`, error);
    return null;
  }

  return data;
};
