/**
 * WatermelonDB Schema Definition
 * Defines all tables and columns for the CMMS database
 */

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // Assets table
    tableSchema({
      name: 'assets',
      columns: [
        {name: 'asset_code', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'category', type: 'string'},
        {name: 'location', type: 'string'},
        {name: 'latitude', type: 'number', isOptional: true},
        {name: 'longitude', type: 'number', isOptional: true},
        {name: 'manufacturer', type: 'string'},
        {name: 'model', type: 'string'},
        {name: 'serial_number', type: 'string'},
        {name: 'install_date', type: 'number'},
        {name: 'qr_code', type: 'string'},
        {name: 'photo_path', type: 'string'},
        {name: 'specifications', type: 'string'}, // JSON
        {name: 'checklist_template_id', type: 'string'},
        {name: 'status', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Checklist Templates table
    tableSchema({
      name: 'checklist_templates',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'category', type: 'string'},
        {name: 'description', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Checklist Template Items table
    tableSchema({
      name: 'checklist_items',
      columns: [
        {name: 'template_id', type: 'string', isIndexed: true},
        {name: 'category', type: 'string'},
        {name: 'label', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'unit', type: 'string'},
        {name: 'options', type: 'string'}, // JSON
        {name: 'min_value', type: 'number', isOptional: true},
        {name: 'max_value', type: 'number', isOptional: true},
        {name: 'is_required', type: 'boolean'},
        {name: 'sort_order', type: 'number'},
      ],
    }),

    // Inspections table
    tableSchema({
      name: 'inspections',
      columns: [
        {name: 'asset_id', type: 'string', isIndexed: true},
        {name: 'inspector_name', type: 'string'},
        {name: 'inspection_date', type: 'number'},
        {name: 'type', type: 'string'},
        {name: 'status', type: 'string', isIndexed: true},
        {name: 'photos', type: 'string'}, // JSON array of paths
        {name: 'notes', type: 'string'},
        {name: 'signature_path', type: 'string'},
        {name: 'pdf_path', type: 'string'},
        {name: 'form_data', type: 'string', isOptional: true}, // JSON of full inspection data
        {name: 'is_synced', type: 'boolean', isOptional: true}, // For Supabase sync tracking
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Inspection Items table (filled checklist results)
    tableSchema({
      name: 'inspection_items',
      columns: [
        {name: 'inspection_id', type: 'string', isIndexed: true},
        {name: 'template_item_id', type: 'string'},
        {name: 'category', type: 'string'},
        {name: 'label', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'value', type: 'string'},
        {name: 'unit', type: 'string'},
        {name: 'status', type: 'string'},
        {name: 'photo_path', type: 'string'},
        {name: 'notes', type: 'string'},
        {name: 'sort_order', type: 'number'},
      ],
    }),
  ],
});
