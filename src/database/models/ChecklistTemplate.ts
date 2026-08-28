/**
 * ChecklistTemplate Model - WatermelonDB
 */

import {Model} from '@nozbe/watermelondb';
import {field, text, date, readonly, children} from '@nozbe/watermelondb/decorators';
import type {AssetCategory} from '../../types';

export default class ChecklistTemplate extends Model {
  static table = 'checklist_templates';

  static associations = {
    checklist_items: {type: 'has_many' as const, foreignKey: 'template_id'},
    assets: {type: 'has_many' as const, foreignKey: 'checklist_template_id'},
  };

  @text('name') name!: string;
  @text('category') category!: AssetCategory;
  @text('description') description!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('checklist_items') items: any;
}
