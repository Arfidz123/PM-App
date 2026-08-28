/**
 * ChecklistItem Model - WatermelonDB
 * Represents a single item in a checklist template
 */

import {Model} from '@nozbe/watermelondb';
import {field, text, relation} from '@nozbe/watermelondb/decorators';
import type {ChecklistItemType} from '../../types';

export default class ChecklistItem extends Model {
  static table = 'checklist_items';

  static associations = {
    checklist_templates: {type: 'belongs_to' as const, key: 'template_id'},
  };
  @text('template_id') templateId!: string;
  @text('category') category!: string;
  @text('label') label!: string;
  @text('type') type!: ChecklistItemType;
  @text('unit') unit!: string;
  @text('options') options!: string; // JSON array
  @field('min_value') minValue!: number | null;
  @field('max_value') maxValue!: number | null;
  @field('is_required') isRequired!: boolean;
  @field('sort_order') sortOrder!: number;

  @relation('checklist_templates', 'template_id') template: any;

  /** Parse options JSON */
  get optionsList(): string[] {
    try {
      return JSON.parse(this.options || '[]');
    } catch {
      return [];
    }
  }

  /** Get type label */
  get typeLabel(): string {
    const labels: Record<ChecklistItemType, string> = {
      pass_fail: 'Pass/Fail',
      numeric: 'Numerik',
      text: 'Teks',
      select: 'Pilihan',
      photo: 'Foto',
    };
    return labels[this.type] || this.type;
  }
}
