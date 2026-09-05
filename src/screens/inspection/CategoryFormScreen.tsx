/**
 * Category Form Screen
 * Displays items for a specific category (supports both dynamic template items and built-in standard category fields)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, CheckCircle2, Save, Sparkles } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { useInspectionStore } from '../../store/inspectionStore';
import { Card, Header, showAlert } from '../../components/common';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CategoryItemDef {
  key: string;
  label: string;
  type: 'pass_fail' | 'select' | 'numeric' | 'text' | 'photo';
  unit?: string;
  options?: string[];
  placeholder?: string;
}

const DEFAULT_CATEGORY_ITEMS: Record<string, CategoryItemDef[]> = {
  external_alarm: [
    { key: 'mainsFail', label: 'Catuan PLN Mati (Mains Fail)', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'rectifierAlarm', label: 'Rectifier Major / Minor Alarm', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'batteryLow', label: 'Battery Low Voltage / Discharge', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'highTemp', label: 'Suhu Ruangan Tinggi (High Temp)', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'smokeFire', label: 'Sensor Asap & Api (Smoke / Fire)', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'doorSensor', label: 'Sensor Pintu Terbuka (Door Open)', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'gensetRunFail', label: 'Genset Run / Fail Alarm', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'arresterFail', label: 'Surge Arrester Fail', type: 'select', options: ['Normal', 'Alarm', 'N/A'] },
    { key: 'tipeController', label: 'Tipe Controller I/O', type: 'text', placeholder: 'SNMP / RTU / IoT Box...' },
    { key: 'suhuRuangan', label: 'Suhu Ruangan Terukur', type: 'numeric', unit: '°C' },
    { key: 'kelembaban', label: 'Kelembaban Ruangan (Humidity)', type: 'numeric', unit: '% RH' },
    { key: 'catatan', label: 'Catatan & Temuan Alarm', type: 'text', placeholder: 'Tulis catatan alarm...' },
  ],
  genset: [],
  fot_ip: [],
  fot_dwdm: [],
};

export const CategoryFormScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryId, categoryLabel } = route.params || {};

  React.useEffect(() => {
    if (categoryId === 'acpdb') {
      navigation.replace('Acpdb');
    } else if (categoryId === 'dcpdb') {
      navigation.replace('Dcpdb');
    } else if (categoryId === 'fot_ip') {
      navigation.replace('FotIp');
    } else if (categoryId === 'fot_dwdm') {
      navigation.replace('FotDwdm');
    }
  }, [categoryId]);

  const { checklistEntries, updateChecklistEntry, formData, updateFormData } = useInspectionStore();

  // 1. Check if category entries exist in database checklistEntries
  const categoryEntries = (checklistEntries || []).filter(
    (entry) => entry.category === categoryId,
  );

  // 2. Built-in standard category fields fallback
  const defaultItems = DEFAULT_CATEGORY_ITEMS[categoryId] || [];
  const isDefaultCategory = categoryEntries.length === 0 && defaultItems.length > 0;

  // Local form state bound to formData[categoryId]
  const currentFormData = formData[categoryId] || {};

  const handleUpdateChecklistValue = (item: any, value: string) => {
    const globalIndex = checklistEntries.findIndex(
      (e) => e.templateItemId === item.templateItemId,
    );
    if (globalIndex !== -1) {
      updateChecklistEntry(globalIndex, {
        value,
        status: !value ? 'na' : (value === 'NOK' ? 'warning' : 'ok'),
      });
    }
  };

  const handleUpdateCustomValue = (key: string, value: string) => {
    const updated = { ...currentFormData, [key]: value };
    updateFormData(categoryId, updated);

    // Two-way sync to powerSystem if relevant
    if (categoryId === 'genset') {
      const ps = formData.powerSystem || {};
      const psSync: Record<string, any> = {};
      if (key === 'gensetAda') psSync.gensetAda = value;
      if (key === 'merkGenset') psSync.merkGenset = value;
      if (key === 'snGenset') psSync.snGenset = value;
      if (key === 'jenisGenset') psSync.jenisGenset = value;
      if (key === 'tipeGenset') psSync.tipeGenset = value;
      if (key === 'kapasitasGenset') psSync.kapasitasGenset = value;
      if (key === 'phasaGenset') psSync.phasaGenset = value;
      if (key === 'cosGenset') psSync.cosGenset = value;
      if (Object.keys(psSync).length > 0) {
        updateFormData('powerSystem', { ...ps, ...psSync });
      }
    } else if (categoryId === 'acpdb') {
      const ps = formData.powerSystem || {};
      const psSync: Record<string, any> = {};
      if (key === 'teganganR_N') psSync.teganganR_N = value;
      if (key === 'teganganS_N') psSync.teganganS_N = value;
      if (key === 'teganganT_N') psSync.teganganT_N = value;
      if (key === 'arusR') psSync.arusPhasaR = value;
      if (key === 'arusS') psSync.arusPhasaS = value;
      if (key === 'arusT') psSync.arusPhasaT = value;
      if (key === 'arusN') psSync.arusPhasaN = value;
      if (Object.keys(psSync).length > 0) {
        updateFormData('powerSystem', { ...ps, ...psSync });
      }
    }
  };

  const handleSetAllNormal = () => {
    if (!isDefaultCategory) return;
    const batchUpdates: Record<string, string> = {};
    defaultItems.forEach((item) => {
      if (item.type === 'pass_fail') {
        batchUpdates[item.key] = 'OK';
      } else if (item.type === 'select' && item.options) {
        if (item.options.includes('Normal')) {
          batchUpdates[item.key] = 'Normal';
        } else if (item.options.includes('Ada')) {
          batchUpdates[item.key] = 'Ada';
        } else if (item.options.includes('OK')) {
          batchUpdates[item.key] = 'OK';
        }
      }
    });
    updateFormData(categoryId, { ...currentFormData, ...batchUpdates });
    showAlert({
      type: 'success',
      title: 'Status Diatur',
      message: 'Semua item pemeriksaan cepat telah diatur ke kondisi Normal / OK.',
    });
  };

  const handleSaveAndBack = () => {
    showAlert({
      type: 'success',
      title: 'Data Tersimpan',
      message: `Data ${categoryLabel || 'Form'} telah berhasil disimpan.`,
      buttons: [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    });
  };

  // Count filled items
  const filledCount = isDefaultCategory
    ? defaultItems.filter((item) => {
        const val = currentFormData[item.key];
        return val !== undefined && val !== '';
      }).length
    : categoryEntries.filter((item) => item.value !== '').length;

  const totalCount = isDefaultCategory ? defaultItems.length : categoryEntries.length;

  const renderChecklistItem = (item: any) => {
    return (
      <Card key={item.templateItemId} style={styles.itemCard}>
        <Text style={styles.itemLabel}>{item.label}</Text>

        {item.type === 'pass_fail' && (
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, item.value === 'OK' && styles.segmentBtnActiveOk]}
              onPress={() => handleUpdateChecklistValue(item, item.value === 'OK' ? '' : 'OK')}
            >
              <Text style={item.value === 'OK' ? styles.segmentTextActive : styles.segmentText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, item.value === 'NOK' && styles.segmentBtnActiveNok]}
              onPress={() => handleUpdateChecklistValue(item, item.value === 'NOK' ? '' : 'NOK')}
            >
              <Text style={item.value === 'NOK' ? styles.segmentTextActive : styles.segmentText}>NOK</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.type === 'numeric' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={item.value}
              onChangeText={(val) => handleUpdateChecklistValue(item, val)}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
            {item.unit ? <Text style={styles.unitText}>{item.unit}</Text> : null}
          </View>
        )}

        {item.type === 'select' && (
          <View style={styles.segmentedControl}>
            {(item.options || []).map((opt: string) => {
              const activeStyle =
                opt === 'OK'
                  ? styles.segmentBtnActiveOk
                  : opt === 'NOK'
                  ? styles.segmentBtnActiveNok
                  : opt === 'N/A' || opt === 'NA'
                  ? styles.segmentBtnActiveNa
                  : styles.segmentBtnActiveOk;

              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.segmentBtn, item.value === opt && activeStyle]}
                  onPress={() => handleUpdateChecklistValue(item, item.value === opt ? '' : opt)}
                >
                  <Text style={item.value === opt ? styles.segmentTextActive : styles.segmentText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {item.type === 'text' && (
          <TextInput
            style={[styles.textInput, { marginTop: Spacing.sm }]}
            value={item.value}
            onChangeText={(val) => handleUpdateChecklistValue(item, val)}
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        )}
      </Card>
    );
  };

  const renderDefaultItem = (item: CategoryItemDef, index: number) => {
    const value = currentFormData[item.key] || '';

    return (
      <Card key={item.key} style={styles.itemCard}>
        <View style={styles.itemHeaderRow}>
          <View style={styles.itemNumberCircle}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.itemLabel}>{item.label}</Text>
        </View>

        {item.type === 'pass_fail' && (
          <View style={styles.segmentedControl}>
            {['OK', 'NOK', 'N/A'].map((opt) => {
              const isActive = value === opt;
              const activeStyle =
                opt === 'OK'
                  ? styles.segmentBtnActiveOk
                  : opt === 'NOK'
                  ? styles.segmentBtnActiveNok
                  : styles.segmentBtnActiveNa;
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  style={[styles.segmentBtn, isActive && activeStyle]}
                  onPress={() => handleUpdateCustomValue(item.key, value === opt ? '' : opt)}
                >
                  <Text style={isActive ? styles.segmentTextActive : styles.segmentText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {item.type === 'select' && item.options && (
          <View style={styles.optionsWrap}>
            {item.options.map((opt) => {
              const isActive = value === opt;
              let activeStyle = styles.segmentBtnActiveOk;
              if (opt.toLowerCase().includes('alarm') || opt.toLowerCase() === 'nok' || opt.toLowerCase().includes('critical')) {
                activeStyle = styles.segmentBtnActiveNok;
              } else if (opt.toLowerCase().includes('warning') || opt.toLowerCase() === 'kurang') {
                activeStyle = styles.segmentBtnActiveNa;
              }

              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  style={[styles.optionChip, isActive && activeStyle]}
                  onPress={() => handleUpdateCustomValue(item.key, value === opt ? '' : opt)}
                >
                  {isActive && <Check size={14} color={Colors.white} style={{ marginRight: 4 }} />}
                  <Text style={isActive ? styles.segmentTextActive : styles.segmentText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {item.type === 'numeric' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={value}
              onChangeText={(val) => handleUpdateCustomValue(item.key, val)}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
            {item.unit ? <Text style={styles.unitText}>{item.unit}</Text> : null}
          </View>
        )}

        {item.type === 'text' && (
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={(val) => handleUpdateCustomValue(item.key, val)}
            placeholder={item.placeholder || 'Keterangan...'}
            placeholderTextColor={Colors.textMuted}
          />
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={categoryLabel || 'Pemeriksaan'}
        subtitle={totalCount > 0 ? `${filledCount}/${totalCount} item terisi` : undefined}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick action helper if default items exist */}
        {isDefaultCategory && defaultItems.length > 0 && (
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleSetAllNormal} activeOpacity={0.8}>
              <Sparkles size={16} color={Colors.primary} />
              <Text style={styles.quickActionText}>Set Semua Normal / OK</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content list */}
        {isDefaultCategory ? (
          defaultItems.map(renderDefaultItem)
        ) : categoryEntries.length > 0 ? (
          categoryEntries.map(renderChecklistItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Halaman Dikosongkan</Text>
            <Text style={styles.emptyText}>Isi form pada halaman ini sedang dikosongkan sementara.</Text>
          </View>
        )}

        {/* Save button */}
        {(isDefaultCategory || categoryEntries.length > 0) && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAndBack} activeOpacity={0.85}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <Save size={18} color={Colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Simpan & Selesai</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 48,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  quickActionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  itemCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  itemNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 11,
  },
  itemLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  segmentBtnActiveOk: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  segmentBtnActiveNok: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  segmentBtnActiveNa: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  segmentText: {
    color: Colors.textSecondary,
    ...Typography.caption,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.white,
    ...Typography.caption,
    fontWeight: 'bold',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    color: Colors.text,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
  },
  unitText: {
    marginLeft: Spacing.sm,
    color: Colors.primary,
    fontWeight: 'bold',
    ...Typography.caption,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
