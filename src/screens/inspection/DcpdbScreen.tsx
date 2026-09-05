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
import { ChevronDown, Trash2 } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, showAlert, DropdownModalPicker } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface DcpdbMcbRow {
  mcb: string;
  kapasitas: string;
  merk: string;
  phasa: string;
  peruntukan: string;
  beban: string;
  arus: string;
  suhuKabel: string;
  labelMcb?: string;
  phasaRBeban?: string;
  phasaRArus?: string;
  phasaSBeban?: string;
  phasaSArus?: string;
  phasaTBeban?: string;
  phasaTArus?: string;
  dcpdb?: string;
  dcpdb1Beban?: string;
  dcpdb1Arus?: string;
  dcpdb2Beban?: string;
  dcpdb2Arus?: string;
  dcpdb3Beban?: string;
  dcpdb3Arus?: string;
  dcpdb4Beban?: string;
  dcpdb4Arus?: string;
  dcpdb5Beban?: string;
  dcpdb5Arus?: string;
}

export const DcpdbScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { formData, updateFormData } = useInspectionStore();

  const dcpdbSaved = formData.dcpdb || {};
  const psSaved = formData.powerSystem || {};

  const getInitialMcbList = (): DcpdbMcbRow[] => {
    const list =
      dcpdbSaved.dcpdbBeban ||
      dcpdbSaved.bebanDcpdb ||
      psSaved.dcpdbBeban ||
      psSaved.bebanDcpdb;

    if (Array.isArray(list) && list.length > 0) {
      return list.map((item: any, idx: number) => ({
        mcb: item.mcb || String(idx + 1),
        kapasitas: item.kapasitas || '',
        merk: item.merk || '',
        phasa:
          item.phasa ||
          item.labelMcb ||
          (item.dcpdb && ['R', 'S', 'T'].includes(item.dcpdb) ? item.dcpdb : '') ||
          '',
        peruntukan: item.peruntukan || '',
        beban:
          item.beban ||
          (item.phasa === 'S'
            ? item.phasaSBeban
            : item.phasa === 'T'
            ? item.phasaTBeban
            : item.phasaRBeban) ||
          item.dcpdb1Beban ||
          item.d1Beban ||
          '',
        arus:
          item.arus ||
          (item.phasa === 'S'
            ? item.phasaSArus
            : item.phasa === 'T'
            ? item.phasaTArus
            : item.phasaRArus) ||
          item.dcpdb1Arus ||
          item.d1Arus ||
          '',
        suhuKabel: item.suhuKabel || '',
        labelMcb: item.labelMcb || item.phasa || '',
        phasaRBeban: item.phasaRBeban || '',
        phasaRArus: item.phasaRArus || '',
        phasaSBeban: item.phasaSBeban || '',
        phasaSArus: item.phasaSArus || '',
        phasaTBeban: item.phasaTBeban || '',
        phasaTArus: item.phasaTArus || '',
        dcpdb: item.dcpdb || '',
        dcpdb1Beban: item.dcpdb1Beban || '',
        dcpdb1Arus: item.dcpdb1Arus || '',
      }));
    }

    return [
      {
        mcb: '1',
        kapasitas: '',
        merk: '',
        phasa: '',
        peruntukan: '',
        beban: '',
        arus: '',
        suhuKabel: '',
      },
    ];
  };

  const [mcbList, setMcbList] = useState<DcpdbMcbRow[]>(getInitialMcbList);
  const [aresterAda, setAresterAda] = useState<string>(dcpdbSaved.aresterAda || '');
  const [aresterTipe, setAresterTipe] = useState<string>(dcpdbSaved.aresterTipe || '');
  const [aresterWarnaIndikator, setAresterWarnaIndikator] = useState<string>(
    dcpdbSaved.aresterWarnaIndikator || ''
  );
  const [catatan, setCatatan] = useState<string>(dcpdbSaved.catatan || '');

  // Modal picker state
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

  const syncToStore = (
    updatedMcbList: DcpdbMcbRow[],
    updatedAresterAda: string,
    updatedAresterTipe: string,
    updatedAresterWarna: string,
    updatedCatatan: string
  ) => {
    const normalized = updatedMcbList.map((item, idx) => {
      const ph = item.phasa || '';
      return {
        ...item,
        mcb: String(idx + 1),
        labelMcb: ph,
        phasa: ph,
        dcpdb: ph,
        phasaRBeban: ph === 'R' ? item.beban || '' : item.phasaRBeban || '',
        phasaRArus: ph === 'R' ? item.arus || '' : item.phasaRArus || '',
        phasaSBeban: ph === 'S' ? item.beban || '' : item.phasaSBeban || '',
        phasaSArus: ph === 'S' ? item.arus || '' : item.phasaSArus || '',
        phasaTBeban: ph === 'T' ? item.beban || '' : item.phasaTBeban || '',
        phasaTArus: ph === 'T' ? item.arus || '' : item.phasaTArus || '',
        dcpdb1Beban: item.beban || '',
        dcpdb1Arus: item.arus || '',
      };
    });

    const dcpdbPayload = {
      ...dcpdbSaved,
      dcpdbBeban: normalized,
      bebanDcpdb: normalized,
      aresterAda: updatedAresterAda,
      aresterTipe: updatedAresterTipe,
      aresterWarnaIndikator: updatedAresterWarna,
      catatan: updatedCatatan,
    };

    updateFormData('dcpdb', dcpdbPayload);

    // Keep powerSystem.dcpdbBeban in sync for review & PDF exports
    updateFormData('powerSystem', {
      ...(formData.powerSystem || {}),
      dcpdbBeban: normalized,
      bebanDcpdb: normalized,
    });
  };

  const addMcbRow = () => {
    const nextNum = mcbList.length + 1;
    const newRow: DcpdbMcbRow = {
      mcb: String(nextNum),
      kapasitas: '',
      merk: '',
      phasa: '',
      peruntukan: '',
      beban: '',
      arus: '',
      suhuKabel: '',
    };
    const updated = [...mcbList, newRow];
    setMcbList(updated);
    syncToStore(updated, aresterAda, aresterTipe, aresterWarnaIndikator, catatan);
    showAlert({
      type: 'success',
      title: 'MCB Ditambahkan',
      message: `Baris MCB #${nextNum} DCPDB berhasil ditambahkan.`,
    });
  };

  const removeMcbRow = (index: number) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus MCB DCPDB',
      message: `Apakah Anda yakin ingin menghapus MCB #${index + 1}?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const updated = mcbList.filter((_, idx) => idx !== index);
            const reindexed = updated.map((item, idx) => ({
              ...item,
              mcb: String(idx + 1),
            }));
            setMcbList(reindexed);
            syncToStore(reindexed, aresterAda, aresterTipe, aresterWarnaIndikator, catatan);
          },
        },
      ],
    });
  };

  const updateMcbField = (index: number, field: keyof DcpdbMcbRow, value: string) => {
    const updated = [...mcbList];
    updated[index] = { ...updated[index], [field]: value };
    setMcbList(updated);
    syncToStore(updated, aresterAda, aresterTipe, aresterWarnaIndikator, catatan);
  };

  const handleUpdateAresterAda = (val: string) => {
    setAresterAda(val);
    syncToStore(mcbList, val, aresterTipe, aresterWarnaIndikator, catatan);
  };

  const handleUpdateAresterTipe = (val: string) => {
    setAresterTipe(val);
    syncToStore(mcbList, aresterAda, val, aresterWarnaIndikator, catatan);
  };

  const handleUpdateAresterWarna = (val: string) => {
    setAresterWarnaIndikator(val);
    syncToStore(mcbList, aresterAda, aresterTipe, val, catatan);
  };

  const handleUpdateCatatan = (val: string) => {
    setCatatan(val);
    syncToStore(mcbList, aresterAda, aresterTipe, aresterWarnaIndikator, val);
  };

  const renderDropdownSelect = (
    value: string,
    onSelect: (val: string) => void,
    options: string[],
    title: string
  ) => {
    return (
      <TouchableOpacity
        style={[styles.selectBox, { width: '100%', alignSelf: 'stretch' }]}
        onPress={() => {
          setModalPicker({
            visible: true,
            title,
            options,
            selectedValue: value,
            onSelect,
          });
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.selectText, !value && styles.selectTextPlaceholder]}
          numberOfLines={1}
        >
          {value || 'Pilih'}
        </Text>
        <ChevronDown color={Colors.textMuted} size={16} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="DCPDB"
        subtitle="Beban & Arester DCPDB"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Beban DCPDB */}
        <View style={styles.card}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Spacing.md,
              marginTop: Spacing.sm,
            }}
          >
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Beban DCPDB</Text>
            <TouchableOpacity onPress={addMcbRow} style={{ padding: 8 }}>
              <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>+ Tambah MCB Baru</Text>
            </TouchableOpacity>
          </View>

          {mcbList.map((row, i) => (
            <View
              key={row.mcb || i}
              style={[
                styles.card,
                {
                  marginTop: Spacing.md,
                  borderWidth: 1,
                  borderColor: Colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>MCB #{i + 1}</Text>
                {mcbList.length > 1 && (
                  <TouchableOpacity onPress={() => removeMcbRow(i)} style={{ padding: 4 }}>
                    <Trash2 color={Colors.danger} size={20} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

              {/* Baris 1: Kapasitas & Phasa */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Kapasitas</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={row.kapasitas}
                    onChangeText={(val) => updateMcbField(i, 'kapasitas', val)}
                    placeholder="—"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Phasa</Text>
                  <View style={{ width: 100 }}>
                    {renderDropdownSelect(
                      row.phasa,
                      (val) => updateMcbField(i, 'phasa', val),
                      ['R', 'S', 'T'],
                      `Pilih Phasa MCB #${i + 1}`
                    )}
                  </View>
                </View>
              </View>

              {/* Baris 2: Merk & Peruntukan (satu baris) */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Merk</Text>
                  <TextInput
                    style={styles.textInput}
                    value={row.merk}
                    onChangeText={(val) => updateMcbField(i, 'merk', val)}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Peruntukan</Text>
                  <TextInput
                    style={styles.textInput}
                    value={row.peruntukan}
                    onChangeText={(val) => updateMcbField(i, 'peruntukan', val)}
                  />
                </View>
              </View>

              <View style={[styles.divider, { marginVertical: Spacing.sm }]} />

              {/* Pengukuran: Beban */}
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Beban</Text>
                <View style={styles.measurementInputWrapper}>
                  <View style={styles.measurementInputContainer}>
                    <TextInput
                      style={styles.measurementInput}
                      value={row.beban}
                      onChangeText={(val) => updateMcbField(i, 'beban', val)}
                      placeholder="—"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Pengukuran: Arus */}
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Arus</Text>
                <View style={styles.measurementInputWrapper}>
                  <View style={styles.measurementInputContainer}>
                    <TextInput
                      style={styles.measurementInput}
                      value={row.arus}
                      onChangeText={(val) => updateMcbField(i, 'arus', val)}
                      placeholder="—"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Pengukuran: Suhu Kabel (di bawah arus) */}
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Suhu Kabel</Text>
                <View style={styles.measurementInputWrapper}>
                  <View style={styles.measurementInputContainer}>
                    <TextInput
                      style={styles.measurementInput}
                      value={row.suhuKabel}
                      onChangeText={(val) => updateMcbField(i, 'suhuKabel', val)}
                      placeholder="—"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Card 2: Arester */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Arester</Text>
          <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Status</Text>
              {renderDropdownSelect(
                aresterAda,
                handleUpdateAresterAda,
                ['Ada', 'Tidak Ada'],
                'Pilih Status Arester'
              )}
            </View>
            <View style={{ flex: 1 }} />
          </View>

          {aresterAda !== 'Tidak Ada' && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tipe</Text>
                <TextInput
                  style={styles.textInput}
                  value={aresterTipe}
                  onChangeText={handleUpdateAresterTipe}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Warna Indikator</Text>
                <TextInput
                  style={styles.textInput}
                  value={aresterWarnaIndikator}
                  onChangeText={handleUpdateAresterWarna}
                />
              </View>
            </View>
          )}
        </View>

        {/* Card 3: Catatan */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Catatan</Text>
          <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

          <TextInput
            style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
            value={catatan}
            onChangeText={handleUpdateCatatan}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Picker */}
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
    width: '100%',
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
