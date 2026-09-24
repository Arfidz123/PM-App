import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown, Trash2, Check } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import {
  Header,
  showAlert,
  DropdownModalPicker,
} from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PowerSystemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { formData, updateFormData } = useInspectionStore();
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);

  // Modal Picker state to prevent any overlapping with buttons/footer
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
    onSelect: () => { },
  });

  // Form State
  const defaultForm = {
    // Catuan Utama
    tipePln: '',
    idPelanggan: '',
    dayaListrik: '',
    phasaCatuan: '',
    bulanLalu: '',
    bulanIni: '',
    pengukuranKwh: '',

    // Tegangan
    teganganR_N: '',
    teganganS_N: '',
    teganganT_N: '',
    teganganR_T: '',
    teganganS_T: '',
    teganganR_S: '',
    teganganG_N: '',
    teganganR_N_TU: '220 ± 10%',
    teganganS_N_TU: '220 ± 10%',
    teganganT_N_TU: '220 ± 10%',
    teganganG_N_TU: '220 ± 10%',
    teganganR_T_TU: '400 ± 10%',
    teganganS_T_TU: '400 ± 10%',
    teganganR_S_TU: '400 ± 10%',

    arusPhasaR: '',
    arusPhasaS: '',
    arusPhasaT: '',
    arusPhasaN: '',
    frekuensi: '',
    stabilizerKapasitas: '',
    stabilizerJumlah: '',

    // Visual
    cekKabel: '',
    cekKabelKet: '',
    cekBautTerminal: '',
    cekBautTerminalKet: '',
    cekBautMCB: '',
    cekBautMCBKet: '',
    indikatorLamp: '',
    indikatorLampKet: '',
    cosGenset: '',
    cosGensetKet: '',

    // Arrester
    kwhBoxR: '',
    kwhBoxS: '',
    kwhBoxT: '',
    kwhBoxN: '',
    acpdbR: '',
    acpdbS: '',
    acpdbT: '',
    acpdbN: '',
    rectifierR: '',
    rectifierS: '',
    rectifierT: '',
    rectifierN: '',

    // Grounding
    grOutdoor: '',
    grIndoor: '',
    systemGrounding: '',
    grCatatan: '',
  };

  const form = { ...defaultForm, ...(formData.powerSystem || {}) };

  const updateForm = (key: string, value: any) => {
    const extraUpdates: Record<string, any> = {};

    // Arrester key aliases
    if (key.startsWith('kwhBox')) {
      const phase = key.replace('kwhBox', '');
      extraUpdates[`arresterKwh${phase}`] = value;
    } else if (key.startsWith('acpdb') && key.length === 6) {
      const phase = key.replace('acpdb', '');
      extraUpdates[`arresterAcpdb${phase}`] = value;
    } else if (key.startsWith('rectifier') && key.length === 10) {
      const phase = key.replace('rectifier', '');
      extraUpdates[`arresterRectifier${phase}`] = value;
    }

    // Arus Phasa key aliases
    if (key === 'phasaArus') extraUpdates.phasa = value;
    if (key === 'arusPhasaR') extraUpdates.arusR = value;
    if (key === 'arusPhasaS') extraUpdates.arusS = value;
    if (key === 'arusPhasaT') extraUpdates.arusT = value;
    if (key === 'arusPhasaN') extraUpdates.arusN = value;

    updateFormData('powerSystem', { [key]: value, ...extraUpdates });
  };

  // Page is a unified single scrollable view

  const renderSegmentedControl = (
    value: string,
    onValueChange: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A'],
  ) => (
    <View style={styles.segmentedControl}>
      {options.map(opt => {
        let activeStyle: any = styles.segmentBtnActiveOther;
        if (opt === 'OK') activeStyle = styles.segmentBtnActiveOk;
        else if (opt === 'NOK') activeStyle = styles.segmentBtnActiveNok;
        else if (opt === 'N/A') activeStyle = styles.segmentBtnActiveNa;

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.segmentBtn, value === opt && activeStyle]}
            onPress={() => onValueChange(value === opt ? '' : opt)}
          >
            <Text
              style={[
                styles.segmentText,
                value === opt && styles.segmentTextActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDropdownSelect = (
    key: string,
    value: string,
    onSelect: (val: string) => void,
    options: string[] = ['1', '3'],
    prefix?: string,
    title?: string,
  ) => {
    const displayText = value
      ? prefix
        ? `${prefix}${value}`
        : value
      : 'Pilih';
    const modalTitle =
      title ||
      (key.includes('phasa')
        ? 'Pilih Phasa'
        : key.includes('tipePln')
          ? 'Pilih Tipe PLN'
          : 'Pilih Status');

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
            (value === 'N/A' || value === 'NA') && {
              color: Colors.warning,
              fontWeight: '700',
            },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <ChevronDown color={Colors.textMuted} size={16} />
      </TouchableOpacity>
    );
  };

  const renderTegangan = () => (
    <View>
      {/* Catuan Utama */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Catuan Utama</Text>
          </View>
        </View>
        <View style={styles.titleDivider} />

        <View style={styles.cardBody}>
          <View
            style={[
              styles.row,
              { zIndex: openDropdownKey === 'tipePln' ? 1000 : 1 },
            ]}
          >
            <View
              style={[
                styles.col,
                { zIndex: openDropdownKey === 'tipePln' ? 1000 : 1 },
              ]}
            >
              <Text style={styles.inputLabel}>PLN</Text>
              {renderDropdownSelect(
                'tipePln',
                form.tipePln || '',
                val => updateForm('tipePln', val),
                ['PS Gi', 'Distribusi', 'Lainnya'],
              )}
            </View>
            <View style={styles.col} />
          </View>

          {/* Baris 1: ID Pelanggan & Phasa */}
          <View
            style={[
              styles.row,
              { zIndex: openDropdownKey === 'phasaCatuan' ? 1000 : 1 },
            ]}
          >
            <View style={styles.col}>
              <Text style={styles.inputLabel}>ID Pelanggan</Text>
              <TextInput
                style={styles.textInput}
                value={form.idPelanggan}
                onChangeText={val => updateForm('idPelanggan', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View
              style={[
                styles.col,
                { zIndex: openDropdownKey === 'phasaCatuan' ? 1000 : 1 },
              ]}
            >
              <Text style={styles.inputLabel}>Phasa</Text>
              {renderDropdownSelect(
                'phasaCatuan',
                (form.phasaCatuan || '').replace(/phasa\s*/gi, '').trim(),
                val => updateForm('phasaCatuan', val),
                ['1', '3'],
              )}
            </View>
          </View>

          {/* Baris 2: Bulan Ini & Daya Listrik */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Bulan Ini</Text>
              <TextInput
                style={styles.textInput}
                value={form.bulanIni}
                onChangeText={val => updateForm('bulanIni', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Daya Listrik</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={form.dayaListrik}
                onChangeText={val => updateForm('dayaListrik', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Baris 3: Bulan Lalu & Pengukuran KWH */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Bulan Lalu</Text>
              <TextInput
                style={styles.textInput}
                value={form.bulanLalu}
                onChangeText={val => updateForm('bulanLalu', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Pengukuran KWH</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={form.pengukuranKwh}
                onChangeText={val => updateForm('pengukuranKwh', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>
      </View>

      {renderTeganganAcCard()}
      {renderTotalArusCard()}
      {renderStabilizerCard()}
    </View>
  );

  const renderTeganganAcCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Tegangan Catuan (AC)</Text>
        </View>
      </View>
      <View style={styles.titleDivider} />

      <View style={styles.cardBody}>
        {/* Helper component for Tegangan with Tolak Ukur (Locked/View-Only) */}
        {[
          {
            label: 'tegangan R-N',
            key: 'teganganR_N',
            tuKey: 'teganganR_N_TU',
            defaultTu: '220 ± 10%',
          },
          {
            label: 'tegangan S-N',
            key: 'teganganS_N',
            tuKey: 'teganganS_N_TU',
            defaultTu: '220 ± 10%',
          },
          {
            label: 'tegangan T-N',
            key: 'teganganT_N',
            tuKey: 'teganganT_N_TU',
            defaultTu: '220 ± 10%',
          },
          {
            label: 'tegangan G-N',
            key: 'teganganG_N',
            tuKey: 'teganganG_N_TU',
            defaultTu: '220 ± 10%',
          },
          {
            label: 'tegangan R-T',
            key: 'teganganR_T',
            tuKey: 'teganganR_T_TU',
            defaultTu: '400 ± 10%',
          },
          {
            label: 'tegangan S-T',
            key: 'teganganS_T',
            tuKey: 'teganganS_T_TU',
            defaultTu: '400 ± 10%',
          },
          {
            label: 'tegangan R-S',
            key: 'teganganR_S',
            tuKey: 'teganganR_S_TU',
            defaultTu: '400 ± 10%',
          },

        ].map((item, index) => {
          const tuValue =
            form[item.tuKey as keyof typeof form] || item.defaultTu;
          return (
            <View key={index} style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>{item.label}</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={form[item.key as keyof typeof form]}
                  onChangeText={val => updateForm(item.key as string, val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
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
    </View>
  );

  const renderTotalArusCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Total Arus Terpakai (AC)</Text>
        </View>
      </View>
      <View style={styles.titleDivider} />

      <View style={styles.cardBody}>
        <View
          style={[
            styles.row,
            { zIndex: openDropdownKey === 'phasaArus' ? 1000 : 1 },
          ]}
        >
          <View
            style={{
              width: 110,
              zIndex: openDropdownKey === 'phasaArus' ? 1000 : 1,
            }}
          >
            <Text style={styles.inputLabel}>Phasa</Text>
            {renderDropdownSelect(
              'phasaArus',
              (form.phasaArus || '').replace(/phasa\s*/gi, '').trim(),
              val => updateForm('phasaArus', val),
              ['1', '3'],
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
                onChangeText={val => updateForm('frekuensi', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
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
                onChangeText={val => updateForm('arusPhasaR', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
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
                onChangeText={val => updateForm('arusPhasaS', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
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
                onChangeText={val => updateForm('arusPhasaT', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStabilizerCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Stabilizer</Text>
        </View>
      </View>
      <View style={styles.titleDivider} />

      <View style={styles.cardBody}>
        <View style={styles.measurementRow}>
          <Text style={styles.measurementLabel}>Kapasitas</Text>
          <View style={styles.measurementInputWrapper}>
            <View style={styles.measurementInputContainer}>
              <TextInput
                style={styles.measurementInput}
                keyboardType="numeric"
                value={form.stabilizerKapasitas}
                onChangeText={val => updateForm('stabilizerKapasitas', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.measurementRow}>
          <Text style={styles.measurementLabel}>Jumlah</Text>
          <View style={styles.measurementInputWrapper}>
            <View style={styles.measurementInputContainer}>
              <TextInput
                style={styles.measurementInput}
                keyboardType="numeric"
                value={form.stabilizerJumlah}
                onChangeText={val => updateForm('stabilizerJumlah', val)}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderVisualRow = (
    label: string,
    key: string,
    ketKey: string,
    options: string[] = ['OK', 'NOK', 'N/A'],
  ) => {
    const isOpen = openDropdownKey === key;
    return (
      <View
        style={[
          styles.row,
          { marginBottom: Spacing.sm, zIndex: isOpen ? 1000 : 1 },
        ]}
      >
        <View style={{ width: 135, zIndex: isOpen ? 1000 : 1 }}>
          <Text style={styles.inputLabel} numberOfLines={1}>
            {label}
          </Text>
          {renderDropdownSelect(
            key,
            form[key as keyof typeof form] || '',
            val => updateForm(key, val),
            options,
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TextInput
            style={styles.textInput}
            value={form[ketKey as keyof typeof form]}
            onChangeText={val => updateForm(ketKey, val)}
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>
    );
  };

  const renderVisual = () => {
    const isAnyOpen = [
      'cekKabel',
      'cekBautTerminal',
      'cekBautMCB',
      'indikatorLamp',
      'cosGenset',
    ].includes(openDropdownKey || '');

    return (
      <View style={[styles.card, { zIndex: isAnyOpen ? 1000 : 1 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Visual Check MDP</Text>
          </View>
        </View>
        <View style={styles.titleDivider} />

        <View style={styles.cardBody}>
          {renderVisualRow('Cek Kabel', 'cekKabel', 'cekKabelKet')}
          {renderVisualRow('Cek Baut Terminal', 'cekBautTerminal', 'cekBautTerminalKet')}
          {renderVisualRow('Cek Baut MCB/MCCB', 'cekBautMCB', 'cekBautMCBKet')}
          {renderVisualRow('Indikator Lamp R,S,T', 'indikatorLamp', 'indikatorLampKet')}
          {renderVisualRow('COS Genset', 'cosGenset', 'cosGensetKet')}
        </View>
      </View>
    );
  };

  const renderArresterPhase = (
    phasa: string,
    keySuffix: 'R' | 'S' | 'T' | 'N',
  ) => {
    const isAnyOpen =
      openDropdownKey === `kwhBox${keySuffix}` ||
      openDropdownKey === `acpdb${keySuffix}` ||
      openDropdownKey === `rectifier${keySuffix}`;

    return (
      <View style={{ marginBottom: Spacing.md, zIndex: isAnyOpen ? 1000 : 1 }}>
        <Text style={styles.subHeading}>Phasa {phasa}</Text>

        <View
          style={[
            styles.row,
            { marginBottom: Spacing.sm, zIndex: isAnyOpen ? 1000 : 1 },
          ]}
        >
          <View
            style={[
              styles.col,
              { zIndex: openDropdownKey === `kwhBox${keySuffix}` ? 1000 : 1 },
            ]}
          >
            <Text style={styles.inputLabel}>KWH Box</Text>
            {renderDropdownSelect(
              `kwhBox${keySuffix}`,
              form[`kwhBox${keySuffix}` as keyof typeof form] || '',
              val => updateForm(`kwhBox${keySuffix}` as string, val),
              ['OK', 'NOK', 'N/A'],
            )}
          </View>

          <View
            style={[
              styles.col,
              { zIndex: openDropdownKey === `acpdb${keySuffix}` ? 1000 : 1 },
            ]}
          >
            <Text style={styles.inputLabel}>ACPDB</Text>
            {renderDropdownSelect(
              `acpdb${keySuffix}`,
              form[`acpdb${keySuffix}` as keyof typeof form] || '',
              val => updateForm(`acpdb${keySuffix}` as string, val),
              ['OK', 'NOK', 'N/A'],
            )}
          </View>

          <View
            style={[
              styles.col,
              {
                zIndex: openDropdownKey === `rectifier${keySuffix}` ? 1000 : 1,
              },
            ]}
          >
            <Text style={styles.inputLabel}>Rectifier</Text>
            {renderDropdownSelect(
              `rectifier${keySuffix}`,
              form[`rectifier${keySuffix}` as keyof typeof form] || '',
              val => updateForm(`rectifier${keySuffix}` as string, val),
              ['OK', 'NOK', 'N/A'],
            )}
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          <TextInput
            style={styles.textInput}
            value={form[`arresterKet${keySuffix}` as keyof typeof form]}
            onChangeText={val =>
              updateForm(`arresterKet${keySuffix}` as string, val)
            }
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>
    );
  };

  const renderArrester = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Pengecekan Arrester</Text>
        </View>
      </View>
      <View style={styles.titleDivider} />

      <View style={styles.cardBody}>
        {renderArresterPhase('R', 'R')}
        <View style={styles.divider} />
        {renderArresterPhase('S', 'S')}
        <View style={styles.divider} />
        {renderArresterPhase('T', 'T')}
        <View style={styles.divider} />
        {renderArresterPhase('N', 'N')}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Power System"
        subtitle="Sistem Kelistrikan"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTegangan()}
        {renderVisual()}
        {renderArrester()}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Picker Pop-up Universal (Animasi Spring/Fade & Tombol Tutup Merah) */}
      <DropdownModalPicker
        visible={modalPicker.visible}
        title={modalPicker.title}
        options={modalPicker.options}
        selectedValue={modalPicker.selectedValue}
        onSelect={modalPicker.onSelect}
        onClose={() => setModalPicker(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    paddingVertical: 12,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  tabChip: {
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  tabChipActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  activeTabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabTextActive: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  titleDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardBody: {
    marginTop: 0,
    paddingTop: 0,
  },
  inputGroup: { marginTop: 12 },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  subHeading: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
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
    paddingVertical: 8,
    height: 38,
    fontSize: 13,
    textAlign: 'left',
  },
  lockedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 38,
  },
  lockedText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  segmentScroll: {
    marginTop: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    minWidth: 40,
  },
  segmentBtnActiveOk: { backgroundColor: Colors.successDark },
  segmentBtnActiveNok: { backgroundColor: Colors.dangerDark },
  segmentBtnActiveNa: { backgroundColor: Colors.warningDark },
  segmentBtnActiveOther: { backgroundColor: Colors.primary },
  segmentText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  segmentTextActive: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  photoUploadBoxWrapper: {
    width: '47%',
    position: 'relative',
  },
  photoUploadBox: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  photoUploadBoxAdd: {
    width: '100%',
    height: 100,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  photoUploadText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.sm,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  measurementLabel: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
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
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },
  measurementInput: {
    color: Colors.text,
    textAlign: 'left',
    padding: 0,
    margin: 0,
    fontSize: 14,
  },
  measurementUnit: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
    width: 45,
    textAlign: 'left',
    fontSize: 11,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    height: 38,
  },
  selectBoxActive: {
    borderColor: '#3B82F6',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 38,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    ...Shadow.md,
    zIndex: 9999,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
  },
  dropdownItemActive: {
    backgroundColor: '#3B82F6',
  },
  dropdownItemText: {
    ...Typography.body,
    color: Colors.text,
  },
  dropdownItemTextActive: {
    color: Colors.white,
  },
  selectText: {
    color: Colors.text,
    fontSize: 13,
  },
  selectTextPlaceholder: {
    color: Colors.textMuted,
  },
});
