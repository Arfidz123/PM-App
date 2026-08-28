/**
 * Database Initialization
 * Sets up WatermelonDB with SQLite adapter
 */

import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {
  Asset,
  ChecklistTemplate,
  ChecklistItem,
  Inspection,
  InspectionItem,
} from './models';

// Create the SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'cmms_db',
  jsi: true, // Enable JSI for better performance
  onSetUpError: (error: Error) => {
    console.error('Database setup error:', error);
  },
});

// Create the database instance
const database = new Database({
  adapter,
  modelClasses: [
    Asset,
    ChecklistTemplate,
    ChecklistItem,
    Inspection,
    InspectionItem,
  ],
});

export default database;

// Export collections for easy access
export const assetsCollection = database.get<Asset>('assets');
export const templatesCollection = database.get<ChecklistTemplate>('checklist_templates');
export const checklistItemsCollection = database.get<ChecklistItem>('checklist_items');
export const inspectionsCollection = database.get<Inspection>('inspections');
export const inspectionItemsCollection = database.get<InspectionItem>('inspection_items');
