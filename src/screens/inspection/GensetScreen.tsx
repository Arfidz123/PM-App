/**
 * Genset Screen
 * Tampilan identik sesuai Catuan Eksternal & Pengukuran Genset dari Power System
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronUp, ChevronDown } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, DropdownModalPicker } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GensetScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { formData, updateFormData } = useInspectionStore();

  const ps = formData.powerSystem || {};
  const gs = formData.genset || {};

  const defaultForm = {
    // Catuan Eksternal (Genset)
    gensetAda: gs.gensetAda ?? ps.gensetAda ?? 'Ada',
    merkGenset: gs.merkGenset ?? ps.merkGenset ?? '',
    snGenset: gs.snGenset ?? ps.snGenset ?? '',
    jenisGenset: gs.jenisGenset ?? ps.jenisGenset ?? '',
    tipeGenset: gs.tipeGenset ?? ps.tipeGenset ?? '',
    kapasitasGenset: gs.kapasitasGenset ?? ps.kapasitasGenset ?? '',
    phasaGenset: gs.phasaGenset ?? ps.phasaGenset ?? '',

    // Tegangan Catuan (AC)
    teganganR_N: gs.teganganR_N ?? ps.teganganR_N ?? '',
    teganganR_N_TU: gs.teganganR_N_TU ?? ps.teganganR_N_TU ?? '220 ± 10%',
    teganganS_N: gs.teganganS_N ?? ps.teganganS_N ?? '',
    teganganS_N_TU: gs.teganganS_N_TU ?? ps.teganganS_N_TU ?? '220 ± 10%',
    teganganT_N: gs.teganganT_N ?? ps.teganganT_N ?? '',
    teganganT_N_TU: gs.teganganT_N_TU ?? ps.teganganT_N_TU ?? '220 ± 10%',
    teganganR_T: gs.teganganR_T ?? ps.teganganR_T ?? '',
    teganganR_T_TU: gs.teganganR_T_TU ?? ps.teganganR_T_TU ?? '400 ± 10%',
    teganganS_T: gs.teganganS_T ?? ps.teganganS_T ?? '',
    teganganS_T_TU: gs.teganganS_T_TU ?? ps.teganganS_T_TU ?? '400 ± 10%',
    teganganR_S: gs.teganganR_S ?? ps.teganganR_S ?? '',
    teganganR_S_TU: gs.teganganR_S_TU ?? ps.teganganR_S_TU ?? '400 ± 10%',
    teganganG_N: gs.teganganG_N ?? ps.teganganG_N ?? '',
    teganganG_N_TU: gs.teganganG_N_TU ?? ps.teganganG_N_TU ?? '< 1 V',

    // Total Arus Terpakai (AC)
    phasaArus: gs.phasaArus ?? ps.phasaArus ?? '',
    frekuensi: gs.frekuensi ?? ps.frekuensi ?? '',
    arusPhasaR: gs.arusPhasaR ?? ps.arusPhasaR ?? '',
    arusPhasaS: gs.arusPhasaS ?? ps.arusPhasaS ?? '',
    arusPhasaT: gs.arusPhasaT ?? ps.arusPhasaT ?? '',
  };

  const [form, setForm] = useState(defaultForm);

  // Expand states for cards
  const [gensetExpanded, setGensetExpanded] = useState(true);
  const [tegTeganganAcExpanded, setTegTeganganAcExpanded] = useState(false);
  const [tegTotalArusExpanded, setTegTotalArusExpanded] = useState(false);

  // Modal Picker state
  const [modalPicker, setModalPicker] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    selectedValue: '',
    onSelect: () => {},
  });

  const updateForm = (key: string, value: any) => {
    let extraUpdates: any = { [key]: value };

    if (key === 'gensetAda' && value === 'Tidak Ada') {
      extraUpdates = {
        gensetAda: 'Tidak Ada',
        merkGenset: '',
        snGenset: '',
        jenisGenset: '',
        tipeGenset: '',
        kapasitasGenset: '',
        phasaGenset: '',
      };
    }

    const updated = { ...form, ...extraUpdates };
    setForm(updated);

    // Save to both formData.genset and sync to formData.powerSystem for backward compatibility
    updateFormData('genset', updated);
    updateFormData('powerSystem', {
      ...(formData.powerSystem || {}),
      ...extraUpdates,
    });
  };

  const renderDropdownSelect = (
    key: string,
    value: string,
    onSelect: (val: string) => void,
    options: string[] = ['1', '3'],
    prefix?: string,
    title?: string
  ) => {
    const displayText = value ? (prefix ? `${prefix}${value}` : value) : 'Pilih';
    const modalTitle =
      title ||
      (key.includes('phasa')
        ? 'Pilih Phasa'
        : key.includes('genset')
          ? 'Pilih Ketersediaan Genset'
          : 'Pilih Opsi');

    return (
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => {
          setModalPicker({
            visible: true,
            title: modalTitle,
            options,
            selectedValue: value,
            onSelect,
          });
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            !value && styles.selectTextPlaceholder,
            value === 'OK' && { color: Colors.success, fontWeight: '700' },
            value === 'NOK' && { color: Colors.danger, fontWeight: '700' },
            (value === 'N/A' || value === 'NA') && { color: Colors.warning, fontWeight: '700' },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <ChevronDown color={Colors.textMuted} size={16} />
      </TouchableOpacity>
    );
  };

  const renderTeganganAcCard = () => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setTegTeganganAcExpanded(!tegTeganganAcExpanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Tegangan Catuan (AC)</Text>
        {tegTeganganAcExpanded ? (
          <ChevronUp color={Colors.textMuted} size={20} />
        ) : (
          <ChevronDown color={Colors.textMuted} size={20} />
        )}
      </TouchableOpacity>

      {tegTeganganAcExpanded && (
        <View style={styles.cardBody}>
          {[
            { label: 'R-N', key: 'teganganR_N', tuKey: 'teganganR_N_TU', defaultTu: '220 ± 10%' },
            { label: 'S-N', key: 'teganganS_N', tuKey: 'teganganS_N_TU', defaultTu: '220 ± 10%' },
            { label: 'T-N', key: 'teganganT_N', tuKey: 'teganganT_N_TU', defaultTu: '220 ± 10%' },
            { label: 'R-T', key: 'teganganR_T', tuKey: 'teganganR_T_TU', defaultTu: '400 ± 10%' },
            { label: 'S-T', key: 'teganganS_T', tuKey: 'teganganS_T_TU', defaultTu: '400 ± 10%' },
            { label: 'R-S', key: 'teganganR_S', tuKey: 'teganganR_S_TU', defaultTu: '400 ± 10%' },
            { label: 'G-N', key: 'teganganG_N', tuKey: 'teganganG_N_TU', defaultTu: '< 1 V' },
          ].map((item, index) => {
            const tuValue = form[item.tuKey as keyof typeof form] || item.defaultTu;
            return (
              <View key={index} style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>{item.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      keyboardType="numeric"
                      value={form[item.key as keyof typeof form]}
                      onChangeText={(val) => updateForm(item.key as string, val)}
                      placeholder="—"
                      placeholderTextColor={Colors.textMuted}
                    />
                    <Text style={styles.measurementUnit}>V</Text>
                  </View>
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Tolak Ukur</Text>
                  <View style={styles.lockedContainer}>
                    <Text style={styles.lockedText}>{tuValue}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderTotalArusCard = () => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setTegTotalArusExpanded(!tegTotalArusExpanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Total Arus Terpakai (AC)</Text>
        {tegTotalArusExpanded ? (
          <ChevronUp color={Colors.textMuted} size={20} />
        ) : (
          <ChevronDown color={Colors.textMuted} size={20} />
        )}
      </TouchableOpacity>

      {tegTotalArusExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <View style={{ width: 110 }}>
              <Text style={styles.inputLabel}>Phasa</Text>
              {renderDropdownSelect(
                'phasaArus',
                (form.phasaArus || '').replace(/phasa\s*/gi, '').trim(),
                (val) => updateForm('phasaArus', val),
                ['1', '3']
              )}
            </View>
          </View>

          <View style={[styles.divider, { marginVertical: Spacing.sm }]} />

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Frekuensi</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  keyboardType="numeric"
                  value={form.frekuensi}
                  onChangeText={(val) => updateForm('frekuensi', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text style={styles.measurementUnit}>Hz</Text>
            </View>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Phasa R</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  keyboardType="numeric"
                  value={form.arusPhasaR}
                  onChangeText={(val) => updateForm('arusPhasaR', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text style={styles.measurementUnit}>A</Text>
            </View>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Phasa S</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  keyboardType="numeric"
                  value={form.arusPhasaS}
                  onChangeText={(val) => updateForm('arusPhasaS', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text style={styles.measurementUnit}>A</Text>
            </View>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Phasa T</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  keyboardType="numeric"
                  value={form.arusPhasaT}
                  onChangeText={(val) => updateForm('arusPhasaT', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text style={styles.measurementUnit}>A</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Genset"
        subtitle="Catuan Eksternal"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Catuan Eksternal */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setGensetExpanded(!gensetExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Catuan Eksternal</Text>
            {gensetExpanded ? (
              <ChevronUp color={Colors.textMuted} size={20} />
            ) : (
              <ChevronDown color={Colors.textMuted} size={20} />
            )}
          </TouchableOpacity>

          {gensetExpanded && (
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Genset</Text>
                  {renderDropdownSelect(
                    'gensetAda',
                    form.gensetAda || '',
                    (val) => updateForm('gensetAda', val),
                    ['Ada', 'Tidak Ada']
                  )}
                </View>
                <View style={styles.col} />
              </View>

              {form.gensetAda === 'Ada' && (
                <>
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Merk Genset</Text>
                      <TextInput
                        style={styles.textInput}
                        value={form.merkGenset}
                        onChangeText={(val) => updateForm('merkGenset', val)}
                      />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Serial Number</Text>
                      <TextInput
                        style={styles.textInput}
                        value={form.snGenset}
                        onChangeText={(val) => updateForm('snGenset', val)}
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Jenis Genset</Text>
                      <TextInput
                        style={styles.textInput}
                        value={form.jenisGenset}
                        onChangeText={(val) => updateForm('jenisGenset', val)}
                      />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Tipe Genset</Text>
                      <TextInput
                        style={styles.textInput}
                        value={form.tipeGenset}
                        onChangeText={(val) => updateForm('tipeGenset', val)}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Kapasitas</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={[styles.textInput, { flex: 1 }]}
                          value={form.kapasitasGenset}
                          onChangeText={(val) => updateForm('kapasitasGenset', val)}
                        />
                        <Text style={styles.measurementUnit}>kVA</Text>
                      </View>
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Phasa</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          {renderDropdownSelect(
                            'phasaGenset',
                            (form.phasaGenset || '').replace(/phasa\s*/gi, '').trim(),
                            (val) => updateForm('phasaGenset', val),
                            ['1', '3']
                          )}
                        </View>
                        <View style={styles.measurementUnit} />
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Tegangan Catuan (AC) */}
        {renderTeganganAcCard()}

        {/* Total Arus Terpakai (AC) */}
        {renderTotalArusCard()}

        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
          <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Picker Pop-up Universal */}
      <DropdownModalPicker
        visible={modalPicker.visible}
        title={modalPicker.title}
        options={modalPicker.options}
        selectedValue={modalPicker.selectedValue}
        onSelect={modalPicker.onSelect}
        onClose={() => setModalPicker((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBody: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 44,
    ...Typography.body,
  },
  lockedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  lockedText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  measurementLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  measurementInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementInputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    width: 90,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },
  measurementInput: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  measurementUnit: {
    ...Typography.body,
    color: Colors.textMuted,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
    width: 45,
    textAlign: 'left',
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    height: 44,
  },
  selectText: {
    ...Typography.body,
    color: Colors.text,
  },
  selectTextPlaceholder: {
    color: Colors.textMuted,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  saveButtonText: {
    ...Typography.subtitle1,
    color: Colors.white,
    fontWeight: 'bold',
  },
});
