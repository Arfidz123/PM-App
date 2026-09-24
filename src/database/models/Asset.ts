/**
 * Asset Model - WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  date,
  readonly,
  relation,
  children,
  json,
} from '@nozbe/watermelondb/decorators';
import type { AssetCategory, AssetStatus } from '../../types';

export default class Asset extends Model {
  static table = 'assets';

  static associations = {
    inspections: { type: 'has_many' as const, foreignKey: 'asset_id' },
    checklist_templates: {
      type: 'belongs_to' as const,
      key: 'checklist_template_id',
    },
  };

  @text('asset_code') assetCode!: string;
  @text('name') name!: string;
  @text('category') category!: AssetCategory;
  @text('location') location!: string;
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @text('manufacturer') manufacturer!: string;
  @text('model') assetModel!: string;
  @text('serial_number') serialNumber!: string;
  @field('install_date') installDate!: number;
  @text('qr_code') qrCode!: string;
  @text('photo_path') photoPath!: string;
  @text('specifications') specifications!: string;
  @text('checklist_template_id') checklistTemplateId!: string;
  @text('status') status!: AssetStatus;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('inspections') inspections: any;
  @relation('checklist_templates', 'checklist_template_id')
  checklistTemplate: any;

  /** Parse specifications JSON */
  get specs(): Record<string, string> {
    try {
      return JSON.parse(this.specifications || '{}');
    } catch {
      return {};
    }
  }

  /** Get display name with code */
  get displayName(): string {
    return `${this.assetCode} — ${this.name}`;
  }

  /** Get category label in Indonesian */
  get categoryLabel(): string {
    const labels: Partial<Record<AssetCategory, string>> = {
      hvac: 'HVAC',
      cooling: 'Sistem Pendingin',
      electrical: 'Kelistrikan',
      plumbing: 'Plumbing',
      other: 'Lainnya',
    };
    return labels[this.category] || this.category;
  }

  /** Get status label */
  get statusLabel(): string {
    const labels: Partial<Record<AssetStatus, string>> = {
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      maintenance: 'Dalam Perawatan',
    };
    return labels[this.status] || this.status;
  }
}
