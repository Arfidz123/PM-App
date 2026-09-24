/**
 * Saved PM Profile Service
 * Manages persisting and loading specific static specification fields per POP after PM completion:
 * 1. Power System: id pelanggan, phasa, daya listrik
 * 2. KWH Meter: id pelanggan, phasa, daya listrik
 * 3. Rectifier: phasa, serial number, merk recti, tipe recti, jumlah modul
 * 4. Baterai: merk, tipe, kapasitas, serial number
 * 5. Beban ACPDB & DCPDB: merk saja
 * 6. Genset: gensetAda ('Ada'), serial number, generator merk, phasa, merk genset, tipe genset, engine merk,
 *    dan ATS (type, controller, cos)
 */

import database from '../database';
import { Asset, Inspection } from '../database/models';
import { Q } from '@nozbe/watermelondb';

export interface SavedPmProfile {
  powerSystem?: {
    idPelanggan?: string;
    phasaCatuan?: string;
    dayaListrik?: string;
  };
  kwhMeter?: {
    idPelanggan?: string;
    idCustomer?: string;
    phasa?: string;
    dayaListrik?: string;
    daya?: string;
  };
  rectifier?: {
    rectifiers?: Array<{
      id: string;
      inputAC?: string;
      sn?: string;
      merk?: string;
      tipe?: string;
      jmlModul?: string;
    }>;
  };
  battery?: {
    banks?: Array<{
      id: string;
      merk?: string;
      tipe?: string;
      kapasitas?: string;
      sn?: string;
    }>;
  };
  acpdb?: {
    acpdbBeban?: Array<{
      mcb: string;
      merk: string;
    }>;
  };
  dcpdb?: {
    dcpdbBeban?: Array<{
      mcb: string;
      merk: string;
    }>;
  };
  genset?: {
    gensetAda?: string;
    snGenset?: string;
    generatorMerk?: string;
    phasaGenset?: string;
    merkGenset?: string;
    tipeGenset?: string;
    engineMerk?: string;
    atsType?: string;
    atsController?: string;
    atsCos?: string;
  };
}

// In-memory cache for ultra-fast access
const profileMemoryCache = new Map<string, SavedPmProfile>();

/**
 * Extracts only the specific allowed static fields from completed PM form data
 */
export function extractSavedPmProfile(formData: Record<string, any>): SavedPmProfile {
  const profile: SavedPmProfile = {};

  // 1. Power System: id pelanggan, phasa, daya listrik
  const ps = formData.powerSystem || {};
  if (ps.idPelanggan || ps.phasaCatuan || ps.dayaListrik) {
    profile.powerSystem = {
      idPelanggan: ps.idPelanggan || '',
      phasaCatuan: ps.phasaCatuan || '',
      dayaListrik: ps.dayaListrik || '',
    };
  }

  // 2. KWH Meter: id pelanggan, phasa, daya listrik
  const kwh = formData.kwhMeter || {};
  if (kwh.idPelanggan || kwh.idCustomer || kwh.phasa || kwh.dayaListrik || kwh.daya) {
    profile.kwhMeter = {
      idPelanggan: kwh.idPelanggan || kwh.idCustomer || '',
      idCustomer: kwh.idCustomer || kwh.idPelanggan || '',
      phasa: kwh.phasa || '',
      dayaListrik: kwh.dayaListrik || kwh.daya || '',
      daya: kwh.daya || kwh.dayaListrik || '',
    };
  }

  // 3. Rectifier: phasa, serial number, merk recti, tipe recti, jumlah modul
  const rect = formData.rectifier || {};
  const rectList = Array.isArray(rect.rectifiers) ? rect.rectifiers : [];
  if (rectList.length > 0) {
    profile.rectifier = {
      rectifiers: rectList.map((r: any, idx: number) => ({
        id: r.id || (idx + 1).toString(),
        inputAC: r.inputAC || '',
        sn: r.sn || '',
        merk: r.merk || '',
        tipe: r.tipe || '',
        jmlModul: r.jmlModul || '',
      })),
    };
  }

  // 4. Baterai: merk, tipe, kapasitas, serial number
  const batt = formData.battery || {};
  const bankList = Array.isArray(batt.banks) ? batt.banks : [];
  if (bankList.length > 0) {
    profile.battery = {
      banks: bankList.map((b: any, idx: number) => ({
        id: b.id || (idx + 1).toString(),
        merk: b.merk || '',
        tipe: b.tipe || '',
        kapasitas: b.kapasitas || '',
        sn: b.sn || '',
      })),
    };
  }

  // 5. Beban ACPDB & Beban DCPDB: merk aja
  const acpdb = formData.acpdb || {};
  const acRows = Array.isArray(acpdb.acpdbBeban)
    ? acpdb.acpdbBeban
    : Array.isArray(acpdb.bebanAcpdb)
    ? acpdb.bebanAcpdb
    : [];
  if (acRows.length > 0) {
    profile.acpdb = {
      acpdbBeban: acRows.map((row: any, idx: number) => ({
        mcb: row.mcb || (idx + 1).toString(),
        merk: row.merk || '',
      })),
    };
  }

  const dcpdb = formData.dcpdb || {};
  const dcRows = Array.isArray(dcpdb.dcpdbBeban)
    ? dcpdb.dcpdbBeban
    : Array.isArray(dcpdb.bebanDcpdb)
    ? dcpdb.bebanDcpdb
    : [];
  if (dcRows.length > 0) {
    profile.dcpdb = {
      dcpdbBeban: dcRows.map((row: any, idx: number) => ({
        mcb: row.mcb || (idx + 1).toString(),
        merk: row.merk || '',
      })),
    };
  }

  // 6. Genset:
  // "pada genset jika pada pm awal ada genset maka tersave otomatis ada lalu serial numbernya, generator merk, phasa, genset merk, genset type, engine mark, pada ats semuanya ya ada type, controller, cos."
  const gs = formData.genset || {};
  if (gs.gensetAda === 'Ada') {
    profile.genset = {
      gensetAda: 'Ada',
      snGenset: gs.snGenset || '',
      generatorMerk: gs.generatorMerk || '',
      phasaGenset: gs.phasaGenset || '',
      merkGenset: gs.merkGenset || '',
      tipeGenset: gs.tipeGenset || '',
      engineMerk: gs.engineMerk || gs.engineMark || '',
      atsType: gs.atsType || '',
      atsController: gs.atsController || '',
      atsCos: gs.atsCos || gs.cosGenset || '',
    };
  } else if (gs.gensetAda === 'Tidak Ada') {
    profile.genset = {
      gensetAda: 'Tidak Ada',
    };
  }

  return profile;
}

/**
 * Applies saved static fields onto a fresh formData object
 */
export function applySavedPmProfile(
  baseFormData: Record<string, any>,
  profile: SavedPmProfile,
): Record<string, any> {
  const merged = { ...baseFormData };

  // 1. Power System
  if (profile.powerSystem) {
    merged.powerSystem = {
      ...(merged.powerSystem || {}),
      ...(profile.powerSystem.idPelanggan
        ? { idPelanggan: profile.powerSystem.idPelanggan }
        : {}),
      ...(profile.powerSystem.phasaCatuan
        ? { phasaCatuan: profile.powerSystem.phasaCatuan }
        : {}),
      ...(profile.powerSystem.dayaListrik
        ? { dayaListrik: profile.powerSystem.dayaListrik }
        : {}),
    };
  }

  // 2. KWH Meter
  if (profile.kwhMeter) {
    merged.kwhMeter = {
      ...(merged.kwhMeter || {}),
      ...(profile.kwhMeter.idPelanggan
        ? { idPelanggan: profile.kwhMeter.idPelanggan }
        : {}),
      ...(profile.kwhMeter.idCustomer
        ? { idCustomer: profile.kwhMeter.idCustomer }
        : {}),
      ...(profile.kwhMeter.phasa ? { phasa: profile.kwhMeter.phasa } : {}),
      ...(profile.kwhMeter.dayaListrik
        ? { dayaListrik: profile.kwhMeter.dayaListrik }
        : {}),
      ...(profile.kwhMeter.daya ? { daya: profile.kwhMeter.daya } : {}),
    };
  }

  // 3. Rectifier (phasa, serial number, merk recti, tipe recti, jumlah modul)
  if (profile.rectifier?.rectifiers && profile.rectifier.rectifiers.length > 0) {
    const existingRects = Array.isArray(merged.rectifier?.rectifiers)
      ? merged.rectifier.rectifiers
      : [];

    const updatedRects = profile.rectifier.rectifiers.map((savedR, idx) => {
      const existing = existingRects[idx] || {};
      const numModules = Math.min(parseInt(savedR.jmlModul || '', 10) || 0, 20);
      let modules = Array.isArray(existing.modules) ? [...existing.modules] : [];

      if (numModules > modules.length) {
        for (let i = modules.length; i < numModules; i++) {
          modules.push({
            id: (i + 1).toString(),
            sn: '',
            kapasitas: '',
            beban: '',
          });
        }
      } else if (numModules > 0 && numModules < modules.length) {
        modules = modules.slice(0, numModules);
      }

      return {
        ...existing,
        id: savedR.id || (idx + 1).toString(),
        isExpanded: idx === 0,
        inputAC: savedR.inputAC || existing.inputAC || '',
        sn: savedR.sn || existing.sn || '',
        merk: savedR.merk || existing.merk || '',
        tipe: savedR.tipe || existing.tipe || '',
        jmlModul: savedR.jmlModul || existing.jmlModul || '',
        modules,
      };
    });

    merged.rectifier = {
      ...(merged.rectifier || {}),
      rectifiers: updatedRects,
    };
  }

  // 4. Baterai (merk, tipe, kapasitas, serial number)
  if (profile.battery?.banks && profile.battery.banks.length > 0) {
    const existingBanks = Array.isArray(merged.battery?.banks)
      ? merged.battery.banks
      : [];

    const updatedBanks = profile.battery.banks.map((savedB, idx) => {
      const existing = existingBanks[idx] || {};
      return {
        ...existing,
        id: savedB.id || (idx + 1).toString(),
        isExpanded: idx === 0,
        merk: savedB.merk || existing.merk || '',
        tipe: savedB.tipe || existing.tipe || '',
        kapasitas: savedB.kapasitas || existing.kapasitas || '',
        sn: savedB.sn || existing.sn || '',
      };
    });

    merged.battery = {
      ...(merged.battery || {}),
      banks: updatedBanks,
    };
  }

  // 5. Beban ACPDB & DCPDB (merk saja)
  if (profile.acpdb?.acpdbBeban && profile.acpdb.acpdbBeban.length > 0) {
    const existingRows = Array.isArray(merged.acpdb?.acpdbBeban)
      ? merged.acpdb.acpdbBeban
      : Array.isArray(merged.acpdb?.bebanAcpdb)
      ? merged.acpdb.bebanAcpdb
      : [];

    const updatedRows = profile.acpdb.acpdbBeban.map((savedRow, idx) => {
      const existing = existingRows[idx] || {};
      return {
        ...existing,
        mcb: savedRow.mcb || (idx + 1).toString(),
        merk: savedRow.merk || '',
      };
    });

    merged.acpdb = {
      ...(merged.acpdb || {}),
      acpdbBeban: updatedRows,
      bebanAcpdb: updatedRows,
    };
  }

  if (profile.dcpdb?.dcpdbBeban && profile.dcpdb.dcpdbBeban.length > 0) {
    const existingRows = Array.isArray(merged.dcpdb?.dcpdbBeban)
      ? merged.dcpdb.dcpdbBeban
      : Array.isArray(merged.dcpdb?.bebanDcpdb)
      ? merged.dcpdb.bebanDcpdb
      : [];

    const updatedRows = profile.dcpdb.dcpdbBeban.map((savedRow, idx) => {
      const existing = existingRows[idx] || {};
      return {
        ...existing,
        mcb: savedRow.mcb || (idx + 1).toString(),
        merk: savedRow.merk || '',
      };
    });

    merged.dcpdb = {
      ...(merged.dcpdb || {}),
      dcpdbBeban: updatedRows,
      bebanDcpdb: updatedRows,
    };
  }

  // 6. Genset
  if (profile.genset) {
    if (profile.genset.gensetAda === 'Ada') {
      merged.genset = {
        ...(merged.genset || {}),
        gensetAda: 'Ada',
        snGenset: profile.genset.snGenset || '',
        generatorMerk: profile.genset.generatorMerk || '',
        phasaGenset: profile.genset.phasaGenset || '',
        merkGenset: profile.genset.merkGenset || '',
        tipeGenset: profile.genset.tipeGenset || '',
        engineMerk: profile.genset.engineMerk || '',
        engineMark: profile.genset.engineMerk || '',
        atsType: profile.genset.atsType || '',
        atsController: profile.genset.atsController || '',
        atsCos: profile.genset.atsCos || '',
      };
    } else if (profile.genset.gensetAda === 'Tidak Ada') {
      merged.genset = {
        ...(merged.genset || {}),
        gensetAda: 'Tidak Ada',
      };
    }
  }

  return merged;
}

/**
 * Saves profile for a specific POP to memory cache and WatermelonDB asset specifications
 */
export async function savePopPmProfile(
  popIdentifier: string,
  profile: SavedPmProfile,
): Promise<void> {
  if (!popIdentifier) return;

  // 1. Cache in memory
  profileMemoryCache.set(popIdentifier, profile);

  // 2. Persist to WatermelonDB Asset specifications
  try {
    const assets = await database.get<Asset>('assets').query().fetch();
    const targetAsset = assets.find(
      a =>
        a.assetCode === popIdentifier ||
        a.name === popIdentifier ||
        a.id === popIdentifier,
    );

    if (targetAsset) {
      profileMemoryCache.set(targetAsset.assetCode, profile);
      profileMemoryCache.set(targetAsset.name, profile);

      await database.write(async () => {
        await targetAsset.update((a: any) => {
          let specs: any = {};
          try {
            specs = JSON.parse(a.specifications || '{}');
          } catch (e) {
            specs = {};
          }
          specs.saved_pm_profile = profile;
          a.specifications = JSON.stringify(specs);
        });
      });
      console.log(`Saved static PM profile for POP: ${popIdentifier}`);
    }
  } catch (err) {
    console.warn('Error saving POP PM profile to database:', err);
  }
}

/**
 * Gets cached profile synchronously if available
 */
export function getCachedPopPmProfile(popIdentifier?: string | null): SavedPmProfile | null {
  if (!popIdentifier) return null;
  return profileMemoryCache.get(popIdentifier) || null;
}

/**
 * Retrieves the saved profile for a POP:
 * 1. From memory cache
 * 2. From passed specifications string
 * 3. From WatermelonDB asset record
 * 4. Fallback: latest completed inspection for this asset
 */
export async function getPopPmProfile(
  popIdentifier?: string | null,
  specificationsJson?: string | null,
): Promise<SavedPmProfile | null> {
  if (!popIdentifier) return null;

  // 1. Check memory cache
  const cached = profileMemoryCache.get(popIdentifier);
  if (cached) return cached;

  // 2. Check passed specifications JSON
  if (specificationsJson) {
    try {
      const specs = JSON.parse(specificationsJson);
      if (specs.saved_pm_profile) {
        profileMemoryCache.set(popIdentifier, specs.saved_pm_profile);
        return specs.saved_pm_profile;
      }
    } catch (e) {}
  }

  // 3. Check WatermelonDB Asset
  try {
    const assets = await database.get<Asset>('assets').query().fetch();
    const targetAsset = assets.find(
      a =>
        a.assetCode === popIdentifier ||
        a.name === popIdentifier ||
        a.id === popIdentifier,
    );

    if (targetAsset && targetAsset.specifications) {
      try {
        const specs = JSON.parse(targetAsset.specifications);
        if (specs.saved_pm_profile) {
          profileMemoryCache.set(popIdentifier, specs.saved_pm_profile);
          return specs.saved_pm_profile;
        }
      } catch (e) {}
    }
  } catch (dbErr) {
    console.warn('Error fetching asset from database:', dbErr);
  }

  // 4. Fallback: Check latest completed inspection
  try {
    const inspections = await database
      .get<Inspection>('inspections')
      .query(
        Q.where('status', 'completed'),
        Q.sortBy('inspection_date', Q.desc),
      )
      .fetch();

    const lastInsp = inspections.find(
      (insp: any) =>
        insp.assetId === popIdentifier ||
        (insp.formData && insp.formData.includes(popIdentifier)),
    );

    if (lastInsp && lastInsp.formData) {
      try {
        const parsedFormData = JSON.parse(lastInsp.formData);
        const extracted = extractSavedPmProfile(parsedFormData);
        profileMemoryCache.set(popIdentifier, extracted);
        return extracted;
      } catch (e) {}
    }
  } catch (inspErr) {
    console.warn('Error fetching previous completed inspection:', inspErr);
  }

  return null;
}
