import { supabase } from './supabase';
import database from '../database';
import Inspection from '../database/models/Inspection';
import Asset from '../database/models/Asset';
import { Q } from '@nozbe/watermelondb';
import { POP_SEED_DATA } from '../database/popSeedData';
import { bulkSeedAssetsToSupabase, fetchInspectionsFromSupabase, SupabaseAsset } from './supabaseDb';
import { uploadFileToSupabase, uploadFilesInBatch } from './uploadService';

/**
 * Recursively extracts all unique local file URIs from an arbitrary object/array
 */
export const extractLocalUris = (obj: any, collected: Set<string> = new Set()): Set<string> => {
  if (!obj) return collected;

  if (typeof obj === 'string') {
    if (
      obj.startsWith('file://') ||
      obj.startsWith('content://') ||
      (obj.startsWith('/data/') && (obj.endsWith('.jpg') || obj.endsWith('.jpeg') || obj.endsWith('.png') || obj.endsWith('.webp') || obj.endsWith('.pdf')))
    ) {
      collected.add(obj);
    }
    return collected;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractLocalUris(item, collected);
    }
    return collected;
  }

  if (typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'photoTimestamps' || key === 'photoCoordinates') {
        for (const subKey of Object.keys(val || {})) {
          if (subKey.startsWith('file://') || subKey.startsWith('content://') || subKey.startsWith('/data/')) {
            collected.add(subKey);
          }
        }
      }
      extractLocalUris(val, collected);
    }
  }

  return collected;
};

/**
 * Recursively replaces local file URIs in an arbitrary object/array with their cloud URLs
 */
export const replaceLocalUris = (obj: any, urlMap: Record<string, string>): any => {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return urlMap[obj] || obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceLocalUris(item, urlMap));
  }

  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'photoTimestamps' || key === 'photoCoordinates') {
        const newMap: Record<string, string> = {};
        for (const [subKey, subVal] of Object.entries((val as Record<string, string>) || {})) {
          const mappedKey = urlMap[subKey] || subKey;
          newMap[mappedKey] = subVal;
        }
        result[key] = newMap;
      } else {
        result[key] = replaceLocalUris(val, urlMap);
      }
    }
    return result;
  }

  return obj;
};

/**
 * Uploads all local photos and PDF from inspection data and replaces local paths with Supabase Storage public URLs
 */
export const processAndUploadInspectionMedia = async (data: {
  pdfPath?: string;
  photos?: string[];
  formData?: any;
}): Promise<{
  remotePdfPath: string;
  remotePhotos: string[];
  remoteFormData: any;
}> => {
  // 1. Upload PDF if local
  let remotePdfPath = data.pdfPath || '';
  if (remotePdfPath && (remotePdfPath.startsWith('file://') || remotePdfPath.startsWith('/') || remotePdfPath.startsWith('content://'))) {
    try {
      const uploadedPdf = await uploadFileToSupabase(remotePdfPath, 'inspections_media', 'pdfs');
      if (uploadedPdf) remotePdfPath = uploadedPdf;
    } catch (pdfErr) {
      console.warn('PDF upload warning:', pdfErr);
    }
  }

  // 2. Collect all local photo URIs from photos array and formData
  const localPhotoSet = new Set<string>();
  if (Array.isArray(data.photos)) {
    for (const p of data.photos) {
      if (p && (p.startsWith('file://') || p.startsWith('content://') || p.startsWith('/data/'))) {
        localPhotoSet.add(p);
      }
    }
  }
  if (data.formData) {
    extractLocalUris(data.formData, localPhotoSet);
  }

  const uniqueLocalUris = Array.from(localPhotoSet);
  if (uniqueLocalUris.length > 0) {
    console.log(`[SyncService] Uploading ${uniqueLocalUris.length} local photos to Supabase Storage...`);
  }

  // 3. Batch upload photos
  const urlMap = await uploadFilesInBatch(uniqueLocalUris, 'inspections_media', 'photos', 3);

  // 4. Map top-level photos array
  const remotePhotos = (data.photos || []).map((p) => urlMap[p] || p);

  // 5. Map formData
  const remoteFormData = data.formData ? replaceLocalUris(data.formData, urlMap) : data.formData;

  return {
    remotePdfPath,
    remotePhotos,
    remoteFormData,
  };
};

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
          Q.where('is_synced', null),
          Q.where('photos', Q.like('%file:%')),
          Q.where('form_data', Q.like('%file:%')),
          Q.where('pdf_path', Q.like('%file:%')),
          Q.where('pdf_path', Q.like('/%'))
        )
      )
      .fetch();

    if (unsyncedInspections.length === 0) {
      console.log('No new inspections to sync');
      return { syncedCount: 0 };
    }

    console.log(`Found ${unsyncedInspections.length} inspections to sync/update media`);
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

      let parsedPhotos: string[] = [];
      if (inspection.photos) {
        try {
          const res = typeof inspection.photos === 'string'
            ? JSON.parse(inspection.photos)
            : inspection.photos;
          parsedPhotos = Array.isArray(res) ? res : [];
        } catch (e) {
          parsedPhotos = [];
        }
      }

      // Process and upload all media to Supabase Storage
      const { remotePdfPath, remotePhotos, remoteFormData } = await processAndUploadInspectionMedia({
        pdfPath: inspection.pdfPath,
        photos: parsedPhotos,
        formData: parsedFormData,
      });

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
        form_data: remoteFormData,
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
            if (remotePdfPath) i.pdfPath = remotePdfPath;
            if (remotePhotos && remotePhotos.length > 0) i.photos = JSON.stringify(remotePhotos);
            if (remoteFormData) i.formData = JSON.stringify(remoteFormData);
          });
        });
        syncedCount++;
        console.log(`Successfully synced inspection ${inspection.id} with cloud media`);
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
    // Process and upload all media to Supabase Storage
    const { remotePdfPath, remotePhotos, remoteFormData } = await processAndUploadInspectionMedia({
      pdfPath: inspectionData.pdfPath,
      photos: inspectionData.photos,
      formData: inspectionData.formData,
    });

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
      form_data: remoteFormData || {},
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

    console.log(`Successfully saved inspection ${inspectionData.id} directly to Supabase Cloud with media!`);
    return {
      data,
      remotePdfPath,
      remotePhotos,
      remoteFormData,
    };
  } catch (err) {
    console.error('saveInspectionDirectlyToSupabase failed:', err);
    throw err;
  }
};

