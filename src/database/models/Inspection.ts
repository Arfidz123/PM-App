/**
 * Inspection Model - WatermelonDB
 * Represents a completed or in-progress PM inspection
 */

import {Model} from '@nozbe/watermelondb';
import {field, text, date, readonly, relation, children} from '@nozbe/watermelondb/decorators';
import type {InspectionType, InspectionStatus} from '../../types';

export default class Inspection extends Model {
  static table = 'inspections';

  static associations = {
    assets: {type: 'belongs_to' as const, key: 'asset_id'},
    inspection_items: {type: 'has_many' as const, foreignKey: 'inspection_id'},
  };

  @text('asset_id') assetId!: string;
  @text('inspector_name') inspectorName!: string;
  @field('inspection_date') inspectionDate!: number;
  @text('type') type!: InspectionType;
  @text('status') status!: InspectionStatus;
  @text('photos') photos!: string; // JSON array
  @text('notes') notes!: string;
  @text('signature_path') signaturePath!: string;
  @text('pdf_path') pdfPath!: string;
  @text('form_data') formData!: string;
  @field('is_synced') isSynced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('assets', 'asset_id') asset: any;
  @children('inspection_items') items: any;

  /** Parse photos JSON */
  get photoList(): string[] {
    try {
      return JSON.parse(this.photos || '[]');
    } catch {
      return [];
    }
  }

  /** Get type label */
  get typeLabel(): string {
    const labels: Record<InspectionType, string> = {
      preventive: 'Preventive Maintenance',
      corrective: 'Corrective Maintenance',
      predictive: 'Predictive Maintenance',
    };
    return labels[this.type] || this.type;
  }

  /** Get status label */
  get statusLabel(): string {
    const labels: Record<InspectionStatus, string> = {
      draft: 'Draft',
      in_progress: 'Sedang Berlangsung',
      completed: 'Selesai',
      reviewed: 'Sudah Direview',
    };
    return labels[this.status] || this.status;
  }

  /** Get formatted inspection date */
  get formattedDate(): string {
    const d = new Date(this.inspectionDate);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /** Check if inspection is editable */
  get isEditable(): boolean {
    return this.status === 'draft' || this.status === 'in_progress';
  }
}
