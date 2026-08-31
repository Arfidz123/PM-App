/**
 * Add / Edit Asset Screen
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {Header, Input, Button, Card, showAlert} from '../../components/common';
import database from '../../database';
import {Asset, ChecklistTemplate} from '../../database/models';
import type {RootStackParamList, AssetCategory} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: {key: AssetCategory; label: string; icon: string}[] = [
  {key: 'hvac', label: 'HVAC', icon: '❄️'},
  {key: 'cooling', label: 'Cooling', icon: '🧊'},
  {key: 'electrical', label: 'Listrik', icon: '⚡'},
  {key: 'plumbing', label: 'Plumbing', icon: '🔧'},
  {key: 'other', label: 'Lainnya', icon: '🔩'},
];

export const AddAssetScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const editAssetId = route.params?.assetId;
  const isEditing = !!editAssetId;

  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('hvac');
  const [location, setLocation] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
    if (isEditing) {
      loadAsset();
    }
  }, []);

  const loadTemplates = async () => {
    const allTemplates = await database
      .get<ChecklistTemplate>('checklist_templates')
      .query()
      .fetch();
    setTemplates(allTemplates);
  };

  const loadAsset = async () => {
    try {
      const asset = await database.get<Asset>('assets').find(editAssetId);
      setAssetCode(asset.assetCode);
      setName(asset.name);
      setCategory(asset.category);
      setLocation(asset.location);
      setManufacturer(asset.manufacturer);
      setModel(asset.assetModel);
      setSerialNumber(asset.serialNumber);
      setSelectedTemplateId(asset.checklistTemplateId);
    } catch (error) {
      console.error('Error loading asset for edit:', error);
    }
  };

  const handleSave = async () => {
    if (!assetCode.trim() || !name.trim()) {
      showAlert({type: 'error', title: 'Error', message: 'Kode aset dan nama aset wajib diisi'});
      return;
    }

    setSaving(true);

    try {
      await database.write(async () => {
        if (isEditing) {
          const asset = await database.get<Asset>('assets').find(editAssetId);
          await asset.update((a: any) => {
            a.assetCode = assetCode;
            a.name = name;
            a.category = category;
            a.location = location;
            a.manufacturer = manufacturer;
            a.assetModel = model;
            a.serialNumber = serialNumber;
            a.checklistTemplateId = selectedTemplateId;
          });
        } else {
          await database.get<Asset>('assets').create((a: any) => {
            a.assetCode = assetCode;
            a.name = name;
            a.category = category;
            a.location = location;
            a.manufacturer = manufacturer;
            a.assetModel = model;
            a.serialNumber = serialNumber;
            a.installDate = Date.now();
            a.qrCode = assetCode;
            a.photoPath = '';
            a.specifications = '{}';
            a.checklistTemplateId = selectedTemplateId;
            a.status = 'active';
          });
        }
      });

      navigation.goBack();
    } catch (error) {
      showAlert({type: 'error', title: 'Error', message: 'Gagal menyimpan aset'});
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Auto-select template based on category
  useEffect(() => {
    const matchingTemplate = templates.find((t) => t.category === category);
    if (matchingTemplate && !selectedTemplateId) {
      setSelectedTemplateId((matchingTemplate as any).id);
    }
  }, [category, templates]);

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Edit Aset' : 'Tambah Aset Baru'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Category Selection */}
        <Text style={styles.fieldLabel}>Kategori Aset</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                category === cat.key && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.key)}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  category === cat.key && styles.categoryLabelActive,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Kode Aset"
          placeholder="e.g., HVAC-001"
          value={assetCode}
          onChangeText={setAssetCode}
          required
        />

        <Input
          label="Nama Aset"
          placeholder="e.g., AC Split Daikin 2PK"
          value={name}
          onChangeText={setName}
          required
        />

        <Input
          label="Lokasi"
          placeholder="e.g., Gedung A - Lantai 2 - Ruang Server"
          value={location}
          onChangeText={setLocation}
        />

        <Input
          label="Manufacturer"
          placeholder="e.g., Daikin"
          value={manufacturer}
          onChangeText={setManufacturer}
        />

        <Input
          label="Model / Tipe"
          placeholder="e.g., FTKM50SVM4"
          value={model}
          onChangeText={setModel}
        />

        <Input
          label="Serial Number"
          placeholder="e.g., DK2024001234"
          value={serialNumber}
          onChangeText={setSerialNumber}
        />

        {/* Template Selection */}
        <Text style={styles.fieldLabel}>Template Checklist PM</Text>
        {templates
          .filter((t) => t.category === category || category === 'other')
          .map((template) => (
            <TouchableOpacity
              key={(template as any).id}
              style={[
                styles.templateOption,
                selectedTemplateId === (template as any).id &&
                  styles.templateOptionActive,
              ]}
              onPress={() => setSelectedTemplateId((template as any).id)}>
              <View style={styles.templateRadio}>
                {selectedTemplateId === (template as any).id && (
                  <View style={styles.templateRadioDot} />
                )}
              </View>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDesc}>{template.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

        <View style={styles.buttonSection}>
          <Button
            title={isEditing ? 'Simpan Perubahan' : 'Simpan Aset'}
            onPress={handleSave}
            loading={saving}
            variant="primary"
            size="lg"
            fullWidth
          />
          <Button
            title="Batal"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="md"
            fullWidth
            style={{marginTop: Spacing.md}}
          />
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  categoryLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.white,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  templateOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark,
  },
  templateRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  templateRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...Typography.label,
    color: Colors.text,
  },
  templateDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buttonSection: {
    marginTop: Spacing.xl,
  },
});
