import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface FirestoreAsset {
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

export interface FirestoreInspection {
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

const ASSETS_COLLECTION = 'assets';
const INSPECTIONS_COLLECTION = 'inspections';

/**
 * Fetch all assets from Firestore
 */
export const fetchAssetsFromFirestore = async (): Promise<FirestoreAsset[]> => {
  try {
    const assetsRef = collection(db, ASSETS_COLLECTION);
    const q = query(assetsRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);

    const assets: FirestoreAsset[] = [];
    snapshot.forEach(docSnap => {
      assets.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirestoreAsset, 'id'>),
      });
    });

    return assets;
  } catch (error) {
    console.error('Error fetching assets from Firestore:', error);
    throw error;
  }
};

/**
 * Upsert single asset to Firestore
 */
export const upsertAssetToFirestore = async (asset: FirestoreAsset) => {
  try {
    const assetRef = doc(db, ASSETS_COLLECTION, asset.id);
    await setDoc(assetRef, asset, { merge: true });
    return asset;
  } catch (error) {
    console.error(`Error upserting asset ${asset.id} to Firestore:`, error);
    throw error;
  }
};

/**
 * Bulk seed assets to Firestore in batches
 */
export const bulkSeedAssetsToFirestore = async (assets: FirestoreAsset[]) => {
  try {
    const batch = writeBatch(db);
    assets.forEach(asset => {
      const assetRef = doc(db, ASSETS_COLLECTION, asset.id);
      batch.set(assetRef, asset, { merge: true });
    });
    await batch.commit();
    console.log(`Successfully seeded ${assets.length} assets to Firestore`);
    return true;
  } catch (error) {
    console.error('Error bulk seeding assets to Firestore:', error);
    throw error;
  }
};

/**
 * Helper to remove undefined values so Firestore setDoc does not throw errors
 */
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined || obj === null) return null;
  return JSON.parse(
    JSON.stringify(obj, (key, value) => (value === undefined ? null : value)),
  );
};

/**
 * Save / Upsert an inspection to Firestore
 */
export const saveInspectionToFirestore = async (
  inspection: FirestoreInspection,
) => {
  try {
    const inspectionRef = doc(db, INSPECTIONS_COLLECTION, inspection.id);
    const sanitizedPayload = sanitizeForFirestore(inspection);
    await setDoc(inspectionRef, sanitizedPayload, { merge: true });
    console.log(
      `[Firestore] Successfully saved inspection ${inspection.id} to Cloud Firestore`,
    );
    return inspection;
  } catch (error) {
    console.error('Error saving inspection to Firestore:', error);
    throw error;
  }
};

/**
 * Fetch all inspections from Firestore
 */
export const fetchInspectionsFromFirestore = async (): Promise<
  FirestoreInspection[]
> => {
  try {
    const inspectionsRef = collection(db, INSPECTIONS_COLLECTION);
    const q = query(inspectionsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);

    const inspections: FirestoreInspection[] = [];
    snapshot.forEach(docSnap => {
      inspections.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirestoreInspection, 'id'>),
      });
    });

    return inspections;
  } catch (error) {
    console.error('Error fetching inspections from Firestore:', error);
    throw error;
  }
};

/**
 * Fetch single inspection by ID from Firestore
 */
export const fetchInspectionByIdFromFirestore = async (
  id: string,
): Promise<FirestoreInspection | null> => {
  try {
    const inspectionRef = doc(db, INSPECTIONS_COLLECTION, id);
    const docSnap = await getDoc(inspectionRef);
    if (!docSnap.exists()) {
      return null;
    }
    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<FirestoreInspection, 'id'>),
    };
  } catch (error) {
    console.error(`Error fetching inspection ${id} from Firestore:`, error);
    return null;
  }
};

/**
 * Delete single asset from Firestore
 */
export const deleteAssetFromFirestore = async (id: string) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const assetRef = doc(db, ASSETS_COLLECTION, id);
    await deleteDoc(assetRef);
    console.log(`Successfully deleted asset ${id} from Firestore`);
    return true;
  } catch (error) {
    console.error(`Error deleting asset ${id} from Firestore:`, error);
    return false;
  }
};
