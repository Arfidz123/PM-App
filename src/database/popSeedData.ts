import { POP_MASTER_DATA } from './popMasterData';

export interface PopSeedItem {
  id: string;
  asset_code: string;
  name: string;
  category: string;
  location: string;
  specifications: string;
  latitude: number | null;
  longitude: number | null;
}

export const POP_SEED_DATA: PopSeedItem[] = POP_MASTER_DATA.map(record => ({
  id: record.no.toString(),
  asset_code: record.name,
  name: record.name,
  category: record.kategori,
  location: record.location || '',
  specifications: JSON.stringify({
    no: record.no,
    pop_id: record.popId,
    id_pln: record.idPln,
    daya: record.daya,
    phasa: record.phasaText,
    rectifier_brand: record.rectBrand,
    rectifier_phasa: record.rectPhasa,
    rectifier_modul: record.rectModul,
    battery_brand: record.battBrand,
    battery_bank: record.battBank,
    battery_kapasitas: record.battKapasitasUnit,
  }),
  latitude: record.latitude ?? null,
  longitude: record.longitude ?? null,
}));
