/**
 * Seed Data - PLN Icon Plus PM Checklist
 */

import database from '../index';
import { ChecklistTemplate, ChecklistItem, Asset } from '../models';

interface SeedTemplate {
  name: string;
  category: string;
  description: string;
  items: {
    label: string;
    type: string;
    category: string;
    unit: string;
    options: string[];
    minValue: number | null;
    maxValue: number | null;
    required: boolean;
  }[];
}

const defaultTemplates: SeedTemplate[] = [
  {
    name: 'PM PLN Icon Plus',
    category: 'telecom',
    description: 'Checklist preventive maintenance untuk POP PLN Icon Plus',
    items: [
      // POP
      {
        label: 'Visual Check Kabel',
        type: 'pass_fail',
        category: 'pop',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Cek Baut Terminal',
        type: 'pass_fail',
        category: 'pop',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Cek Baut MCB/MCCB',
        type: 'pass_fail',
        category: 'pop',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Indikator Lamp R,S,T',
        type: 'pass_fail',
        category: 'pop',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },

      // Power System
      {
        label: 'Tegangan R-N',
        type: 'numeric',
        category: 'power_system',
        unit: 'V',
        options: [],
        minValue: 200,
        maxValue: 240,
        required: true,
      },
      {
        label: 'Tegangan S-N',
        type: 'numeric',
        category: 'power_system',
        unit: 'V',
        options: [],
        minValue: 200,
        maxValue: 240,
        required: true,
      },
      {
        label: 'Tegangan T-N',
        type: 'numeric',
        category: 'power_system',
        unit: 'V',
        options: [],
        minValue: 200,
        maxValue: 240,
        required: true,
      },
      {
        label: 'Frekuensi (Hz)',
        type: 'numeric',
        category: 'power_system',
        unit: 'Hz',
        options: [],
        minValue: 49,
        maxValue: 51,
        required: true,
      },
      {
        label: 'Total Arus Terpakai R',
        type: 'numeric',
        category: 'power_system',
        unit: 'A',
        options: [],
        minValue: 0,
        maxValue: 100,
        required: true,
      },
      {
        label: 'Total Arus Terpakai S',
        type: 'numeric',
        category: 'power_system',
        unit: 'A',
        options: [],
        minValue: 0,
        maxValue: 100,
        required: true,
      },
      {
        label: 'Total Arus Terpakai T',
        type: 'numeric',
        category: 'power_system',
        unit: 'A',
        options: [],
        minValue: 0,
        maxValue: 100,
        required: true,
      },

      // Mechanical Electrical
      {
        label: 'Status AC 1',
        type: 'select',
        category: 'mechanical_electrical',
        unit: '',
        options: ['OK', 'NOK'],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Suhu Ruangan',
        type: 'numeric',
        category: 'mechanical_electrical',
        unit: '°C',
        options: [],
        minValue: 16,
        maxValue: 30,
        required: true,
      },
      {
        label: 'Status Exhaust Fan',
        type: 'select',
        category: 'mechanical_electrical',
        unit: '',
        options: ['OK', 'NOK'],
        minValue: null,
        maxValue: null,
        required: true,
      },

      // KWH Meter
      {
        label: 'R (ampere)',
        type: 'numeric',
        category: 'kwh_meter',
        unit: 'A',
        options: [],
        minValue: 0,
        maxValue: 100,
        required: true,
      },
      {
        label: 'R - N voltage',
        type: 'numeric',
        category: 'kwh_meter',
        unit: 'V',
        options: [],
        minValue: 200,
        maxValue: 240,
        required: true,
      },

      // Rectifier
      {
        label: 'Merk Rectifier',
        type: 'text',
        category: 'rectifier',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Jumlah Modul',
        type: 'numeric',
        category: 'rectifier',
        unit: '',
        options: [],
        minValue: 1,
        maxValue: 10,
        required: true,
      },
      {
        label: 'Arus Beban (A)',
        type: 'numeric',
        category: 'rectifier',
        unit: 'A',
        options: [],
        minValue: 0,
        maxValue: 100,
        required: true,
      },
      {
        label: 'Tegangan Input (V)',
        type: 'numeric',
        category: 'rectifier',
        unit: 'V',
        options: [],
        minValue: 200,
        maxValue: 240,
        required: true,
      },
      {
        label: 'Tegangan Floating (V)',
        type: 'numeric',
        category: 'rectifier',
        unit: 'V',
        options: [],
        minValue: 48,
        maxValue: 58,
        required: true,
      },

      // Baterai
      {
        label: 'Merk Baterai',
        type: 'text',
        category: 'baterai',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Kapasitas (AH)',
        type: 'numeric',
        category: 'baterai',
        unit: 'AH',
        options: [],
        minValue: 0,
        maxValue: 1000,
        required: true,
      },
      {
        label: 'V Total',
        type: 'numeric',
        category: 'baterai',
        unit: 'V',
        options: [],
        minValue: 48,
        maxValue: 58,
        required: true,
      },
      {
        label: 'Kondisi Baterai',
        type: 'select',
        category: 'baterai',
        unit: '',
        options: ['OK', 'NOK'],
        minValue: null,
        maxValue: null,
        required: true,
      },

      // Dokumentasi
      {
        label: 'Foto KWH Meter',
        type: 'photo',
        category: 'dokumentasi',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Foto Rectifier',
        type: 'photo',
        category: 'dokumentasi',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
      {
        label: 'Foto Baterai',
        type: 'photo',
        category: 'dokumentasi',
        unit: '',
        options: [],
        minValue: null,
        maxValue: null,
        required: true,
      },
    ],
  },
];

export async function seedDefaultTemplates(): Promise<void> {
  const existingTemplates = await database
    .get<ChecklistTemplate>('checklist_templates')
    .query()
    .fetchCount();

  if (existingTemplates > 0) {
    console.log('Templates already seeded, skipping...');
    return;
  }

  await database.write(async () => {
    for (const templateData of defaultTemplates) {
      const template = await database
        .get<ChecklistTemplate>('checklist_templates')
        .create((t: any) => {
          t.name = templateData.name;
          t.category = templateData.category;
          t.description = templateData.description;
        });

      for (let i = 0; i < templateData.items.length; i++) {
        const item = templateData.items[i];
        await database
          .get<ChecklistItem>('checklist_items')
          .create((ci: any) => {
            ci.templateId = template.id;
            ci.category = item.category;
            ci.label = item.label;
            ci.type = item.type;
            ci.unit = item.unit;
            ci.options = JSON.stringify(item.options);
            ci.minValue = item.minValue;
            ci.maxValue = item.maxValue;
            ci.isRequired = item.required;
            ci.sortOrder = i + 1;
          });
      }
    }
  });
}

export async function seedSampleAssets(): Promise<void> {
  // Deprecated: No sample dummy assets are seeded. Real POP assets are loaded from popSeedData.
}
