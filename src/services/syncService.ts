import { supabase } from './supabase';
import database from '../database';
import Inspection from '../database/models/Inspection';
import Asset from '../database/models/Asset';
import { Q } from '@nozbe/watermelondb';
import { POP_SEED_DATA } from '../database/popSeedData';
import { bulkSeedAssetsToSupabase, fetchInspectionsFromSupabase, SupabaseAsset } from './supabaseDb';
import { uploadFileToSupabase } from './uploadService';

/**
 * Sync unsynced local inspections from WatermelonDB to Supabase Cloud
 */
export const syncInspectionsToSupabase = async () => {
  try {
    const unsyncedInspections = await database
      .get<Inspection>('inspections')
      .query(
        Q.or(
          Q.where('is_synced', false),
          Q.where('is_synced', null)
        )
      )
      .fetch();

    if (unsyncedInspections.length === 0) {
      console.log('No new inspections to sync');
      return { syncedCount: 0 };
    }

    console.log(`Found ${unsyncedInspections.length} inspections to sync`);
    let syncedCount = 0;

    for (const inspection of unsyncedInspections) {
      let parsedFormData = null;
      if (inspection.formData) {
        try {
          parsedFormData = typeof inspection.formData === 'string'
            ? JSON.parse(inspection.formData)
            : inspection.formData;
        } catch (e) {
          parsedFormData = inspection.formData;
        }
      }

      let remotePdfPath = inspection.pdfPath;
      if (remotePdfPath && (remotePdfPath.startsWith('file://') || remotePdfPath.startsWith('/'))) {
        const uploadedUrl = await uploadFileToSupabase(remotePdfPath, 'inspections_media', 'pdfs');
        if (uploadedUrl) remotePdfPath = uploadedUrl;
      }

      let remotePhotos: string[] = [];
      try {
        const localPhotos = typeof inspection.photos === 'string' ? JSON.parse(inspection.photos) : (inspection.photos || []);
        for (const photoUri of localPhotos) {
          if (photoUri && (photoUri.startsWith('file://') || photoUri.startsWith('/'))) {
            const uploadedUrl = await uploadFileToSupabase(photoUri, 'inspections_media', 'photos');
            remotePhotos.push(uploadedUrl || photoUri);
          } else if (photoUri) {
            remotePhotos.push(photoUri);
          }
        }
      } catch (e) {
        console.error('Error parsing/uploading photos:', e);
      }

      // Ensure referenced asset exists in Supabase public.assets to prevent Foreign Key Violation (23503)
      if (inspection.assetId) {
        try {
          await supabase.from('assets').upsert([
            {
              id: inspection.assetId,
              asset_code: inspection.assetId,
              name: inspection.assetId,
              status: 'active'
            }
          ], { onConflict: 'id' });
        } catch (assetErr) {
          console.warn('Auto asset upsert warning:', assetErr);
        }
      }

      const payload = {
        id: inspection.id,
        asset_id: inspection.assetId,
        inspector_name: inspection.inspectorName || 'Teknisi',
        inspection_date: new Date(inspection.inspectionDate || Date.now()).toISOString(),
        type: inspection.type || 'PM',
        status: inspection.status || 'completed',
        notes: inspection.notes || '',
        form_data: parsedFormData,
        pdf_path: remotePdfPath || '',
        photos: remotePhotos,
        is_synced: true,
        created_at: new Date(inspection.createdAt || Date.now()).toISOString(),
        updated_at: new Date(inspection.updatedAt || Date.now()).toISOString(),
      };

      const { error } = await supabase
        .from('inspections')
        .upsert([payload], { onConflict: 'id' });

      if (error) {
        console.error('Error syncing inspection to Supabase:', error);
      } else {
        await database.write(async () => {
          await inspection.update((i) => {
            i.isSynced = true;
          });
        });
        syncedCount++;
        console.log(`Successfully synced inspection ${inspection.id}`);
      }
    }

    return { syncedCount };
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

/**
 * Seed or sync POP assets to Supabase DB
 */
export const syncAssetsToSupabase = async () => {
  try {
    // 1. Fetch assets from local DB first
    const localAssets = await database.get<Asset>('assets').query().fetch();
    
    let assetsToSync: SupabaseAsset[] = [];
    if (localAssets.length > 0) {
      assetsToSync = localAssets.map((asset) => ({
        id: asset.id,
        asset_code: asset.assetCode,
        name: asset.name,
        category: asset.category,
        location: asset.location,
        latitude: asset.latitude,
        longitude: asset.longitude,
        manufacturer: asset.manufacturer,
        model: asset.assetModel,
        serial_number: asset.serialNumber,
        install_date: asset.installDate ? new Date(asset.installDate).toISOString() : null,
        qr_code: asset.qrCode,
        photo_path: asset.photoPath,
        specifications: asset.specifications ? (typeof asset.specifications === 'string' ? JSON.parse(asset.specifications) : asset.specifications) : {},
        checklist_template_id: asset.checklistTemplateId,
        status: asset.status || 'active',
      }));
    } else {
      // Fallback to POP_SEED_DATA if local DB hasn't been seeded yet
      assetsToSync = POP_SEED_DATA.map((item) => ({
        id: item.id,
        asset_code: item.asset_code,
        name: item.name,
        category: item.category,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        specifications: item.specifications ? JSON.parse(item.specifications) : {},
        status: 'active',
      }));
    }

    await bulkSeedAssetsToSupabase(assetsToSync);
    console.log(`Successfully synced ${assetsToSync.length} assets to Supabase`);
    return { assetCount: assetsToSync.length };
  } catch (error) {
    console.error('Sync assets to Supabase failed:', error);
    throw error;
  }
};

/**
 * Fetch inspections from Supabase and insert missing ones into local DB
 */
export const restoreInspectionsFromSupabase = async () => {
  try {
    const remoteInspections = await fetchInspectionsFromSupabase();
    if (!remoteInspections || remoteInspections.length === 0) {
      console.log('No remote inspections to restore.');
      return { restoredCount: 0 };
    }

    let restoredCount = 0;

    await database.write(async () => {
      const inspectionCollection = database.get<Inspection>('inspections');
      
      for (const remote of remoteInspections) {
        // Check if it already exists locally
        const existing = await inspectionCollection.query(Q.where('id', remote.id)).fetch();
        
        if (existing.length === 0) {
          await inspectionCollection.create((i) => {
            i._raw.id = remote.id;
            i.assetId = remote.asset_id;
            i.inspectorName = remote.inspector_name || '';
            i.inspectionDate = remote.inspection_date ? new Date(remote.inspection_date).getTime() : Date.now();
            i.type = (remote.type || 'PM') as any;
            i.status = (remote.status || 'completed') as any;
            i.notes = remote.notes || '';
            i.pdfPath = remote.pdf_path || '';
            i.photos = remote.photos ? JSON.stringify(remote.photos) : '[]';
            i.formData = remote.form_data ? JSON.stringify(remote.form_data) : '{}';
            i.isSynced = true;
          });
          restoredCount++;
        }
      }
    });

    console.log(`Successfully restored ${restoredCount} inspections from Supabase`);
    return { restoredCount };
  } catch (error) {
    console.error('Error restoring inspections from Supabase:', error);
    return { restoredCount: 0 };
  }
};

/**
 * Directly save inspection to Supabase Cloud Database & Storage
 */
export const saveInspectionDirectlyToSupabase = async (inspectionData: {
  id: string;
  assetId: string;
  inspectorName?: string;
  inspectionDate?: number;
  type?: string;
  status?: string;
  pdfPath?: string;
  formData?: any;
  photos?: string[];
  notes?: string;
}) => {
  try {
    let remotePdfPath = inspectionData.pdfPath || '';
    if (remotePdfPath) {
      try {
        const uploadedUrl = await uploadFileToSupabase(remotePdfPath, 'inspections_media', 'pdfs');
        if (uploadedUrl) remotePdfPath = uploadedUrl;
      } catch (pdfErr) {
        console.warn('PDF Upload to storage skipped:', pdfErr);
      }
    }

    let remotePhotos: string[] = [];
    if (inspectionData.photos && Array.isArray(inspectionData.photos)) {
      for (const photoUri of inspectionData.photos) {
        if (photoUri) {
          try {
            const uploadedUrl = await uploadFileToSupabase(photoUri, 'inspections_media', 'photos');
            remotePhotos.push(uploadedUrl || photoUri);
          } catch (photoErr) {
            remotePhotos.push(photoUri);
          }
        }
      }
    }

    // Ensure referenced asset exists in Supabase public.assets to prevent Foreign Key Violation (23503)
    if (inspectionData.assetId) {
      try {
        await supabase.from('assets').upsert([
          {
            id: inspectionData.assetId,
            asset_code: inspectionData.assetId,
            name: inspectionData.assetId,
            status: 'active'
          }
        ], { onConflict: 'id' });
      } catch (assetErr) {
        console.warn('Auto asset upsert warning:', assetErr);
      }
    }

    const payload = {
      id: inspectionData.id,
      asset_id: inspectionData.assetId,
      inspector_name: inspectionData.inspectorName || 'Teknisi',
      inspection_date: new Date(inspectionData.inspectionDate || Date.now()).toISOString(),
      type: inspectionData.type || 'PM',
      status: inspectionData.status || 'completed',
      notes: inspectionData.notes || '',
      form_data: inspectionData.formData || {},
      pdf_path: remotePdfPath,
      photos: remotePhotos,
      is_synced: true,
      created_at: new Date(inspectionData.inspectionDate || Date.now()).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inspections')
      .upsert([payload], { onConflict: 'id' });

    if (error) {
      console.error('Error saving directly to Supabase:', error);
      throw error;
    }

    console.log(`Successfully saved inspection ${inspectionData.id} directly to Supabase Cloud!`);
    return data;
  } catch (err) {
    console.error('saveInspectionDirectlyToSupabase failed:', err);
    throw err;
  }
};
