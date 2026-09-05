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
import { ChevronUp, ChevronDown, ChevronLeft, Trash2, Plus, Lock } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, showAlert, DropdownModalPicker } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MechanicalElectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Accordion state
  const [acExpanded, setAcExpanded] = useState(true);
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [exhaustExpanded, setExhaustExpanded] = useState(true);
  const [groundingExpanded, setGroundingExpanded] = useState(true);
  const [statusPopExpanded, setStatusPopExpanded] = useState(true);

  // Daftar Parameter Pemeriksaan AC
  const AC_CHECK_ITEMS = [
    { key: 'status', label: 'STATUS AC', ketKey: 'acStatusKet' },
    { key: 'daya', label: 'DAYA', ketKey: 'acDayaKet' },
    { key: 'tekanan', label: 'TEKANAN', ketKey: 'acTekananKet' },
    { key: 'currentMax', label: 'CURRENT MAX.', ketKey: 'acCurrentMaxKet' },
    { key: 'arus', label: 'ARUS PENGUKURAN', ketKey: 'acArusKet' },
    { key: 'kondisiIndoor', label: 'KONDISI INDOOR AC', ketKey: 'acKondisiIndoorKet' },
    { key: 'kondisiPipa', label: 'KONDISI PIPA', ketKey: 'acKondisiPipaKet' },
    { key: 'autoRestart', label: 'AUTO RESTART', ketKey: 'acAutoRestartKet' },
    { key: 'switch', label: 'SWITCH KONTAKTOR', ketKey: 'acSwitchKet' },
    { key: 'settingSuhu', label: 'SETING SUHU AC', ketKey: 'acSettingSuhuKet' },
    { key: 'suhuRuangan', label: 'SUHU RUANGAN', ketKey: 'acSuhuRuanganKet' },
  ];

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
    onSelect: () => { },
  });

  const { formData, updateFormData } = useInspectionStore();

  // Unified Form state
  const defaultForm = {
    // AC (Dynamic List)
    acList: [{
      id: 1,
      status: '',
      daya: '',
      tekanan: '',
      currentMax: '',
      arus: '',
      kondisiIndoor: '',
      kondisiPipa: '',
      autoRestart: '',
      switch: '',
      settingSuhu: '',
      suhuRuangan: '',
    }],
    acSiteStatusKet: '', acSiteStatus: '',
    acMerk: '', acJumlah: '',
    acStatusKet: '', acDayaKet: '', acTekananKet: '', acCurrentMaxKet: '',
    acArusKet: '', acKondisiIndoorKet: '', acKondisiPipaKet: '',
    acAutoRestartKet: '', acSwitchKet: '', acSettingSuhuKet: '', acSuhuRuanganKet: '',

    // Exhaust Fan
    exStatusKet: '', exStatus: '',
    exJumlah: '',
    exSystemKet: '', exSystem: '',
    exControllerKet: '', exController: '',

    // Grounding
    grPengukuran: '',
    grStatusKet: '', grStatus: '',
    grPetirKet: '', grPetir: '',
    grBarIndoorKet: '', grBarIndoor: '',
    grBarTowerKet: '', grBarTower: '',
    grBarSumurKet: '', grBarSumur: '',
    grKabelKet: '', grKabel: '',
    grKoneksiKet: '', grKoneksi: '',

    // Status POP
    popLokasiKet: '', popLokasi: '',
    popLuas: '',
    popCatKet: '', popCat: '',
    popKonstruksiKet: '', popKonstruksi: '',
    popLampuKet: '', popLampu: '',
    popKunciKet: '', popKunci: '',

    // Catatan
    note: ''
  };

  const form = { ...defaultForm, ...(formData.mechanicalElect || {}) };

  const updateForm = (key: string, value: any) => {
    updateFormData('mechanicalElect', { [key]: value });
  };

  const isAcUnitFilled = (ac: any) => {
    if (!ac) return false;
    return Object.keys(ac).some((key) => {
      if (key === 'id') return false;
      const val = ac[key];
      return val !== undefined && val !== null && String(val).trim() !== '';
    });
  };

  const getFilledAcCount = (list: any[]) => {
    return (list || []).filter(isAcUnitFilled).length;
  };

  const addAcRow = () => {
    const list = form.acList || [];
    const nextId = list.length > 0 ? Math.max(...list.map((item: any) => item.id || 1)) + 1 : 1;
    const newList = [
      ...list,
      {
        id: nextId,
        status: '',
        daya: '',
        tekanan: '',
        currentMax: '',
        arus: '',
        kondisiIndoor: '',
        kondisiPipa: '',
        autoRestart: '',
        switch: '',
        settingSuhu: '',
        suhuRuangan: '',
      },
    ];
    const count = getFilledAcCount(newList);
    updateFormData('mechanicalElect', {
      acList: newList,
      acJumlah: count > 0 ? count.toString() : '',
    });
    showAlert({
      type: 'success',
      title: 'Berhasil Ditambahkan',
      message: `Kolom status Unit AC #${newList.length} berhasil ditambahkan.`,
    });
  };

  const removeAcRow = (id: number) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Unit AC',
      message: 'Apakah Anda yakin ingin menghapus Unit AC ini?',
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const list = form.acList || [];
            const newList = list.filter((item: any) => item.id !== id);
            const count = getFilledAcCount(newList);
            updateFormData('mechanicalElect', {
              acList: newList,
              acJumlah: count > 0 ? count.toString() : '',
            });
          },
        },
      ],
    });
  };

  const updateAcRow = (index: number, field: string, value: string) => {
    const newList = [...form.acList];
    newList[index] = { ...newList[index], [field]: value };
    const count = getFilledAcCount(newList);
    updateFormData('mechanicalElect', {
      acList: newList,
      acJumlah: count > 0 ? count.toString() : '',
    });
  };

  const renderDropdownSelect = (
    key: string,
    value: string,
    onSelect: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A'],
    title?: string
  ) => {
    const displayText = value || 'Pilih';

    return (
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => {
          setModalPicker({
            visible: true,
            title: title || 'Pilih Status',
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

  const renderCheckRow = (
    label: string,
    key: string,
    value: string,
    onSelect: (val: string) => void,
    ketValue: string,
    onKetChange: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A'],
    dropdownWidth: number = 135
  ) => {
    const isOpen = openDropdownKey === key;
    return (
      <View style={[styles.row, { marginBottom: Spacing.sm, zIndex: isOpen ? 1000 : 1 }]}>
        <View style={{ width: dropdownWidth, zIndex: isOpen ? 1000 : 1 }}>
          <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]} numberOfLines={1}>
            {label}
          </Text>
          {renderDropdownSelect(
            key,
            value || '',
            onSelect,
            options,
            label
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TextInput
            style={styles.inputBox}
            value={ketValue}
            onChangeText={onKetChange}
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Mechanical Electrical"
        subtitle="AC, Exhaust & Grounding"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Air Conditioner */}
          <View style={[styles.card, { zIndex: openDropdownKey?.startsWith('ac') ? 1000 : 4 }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setAcExpanded(!acExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Air Conditioner</Text>
              </View>
              {acExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {acExpanded && (
              <View style={styles.cardBody}>
                {renderCheckRow('SITE STATUS', 'acSiteStatus', form.acSiteStatus, (v) => updateForm('acSiteStatus', v), form.acSiteStatusKet, (v) => updateForm('acSiteStatusKet', v), ['Indoor', 'Outdoor', 'N/A'])}

                <View style={[styles.row, { marginBottom: Spacing.sm }]}>
                  <View style={{ width: 135 }}>
                    <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>JUMLAH AC</Text>
                    <View style={styles.lockedContainer}>
                      <Text style={styles.lockedText}>
                        {(() => {
                          const count = getFilledAcCount(form.acList);
                          return count > 0 ? count.toString() : '';
                        })()}
                      </Text>
                      <Lock size={14} color={Colors.textMuted} />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>MERK AC</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={form.acMerk}
                      onChangeText={(val) => updateForm('acMerk', val)}
                    />
                  </View>
                </View>

                {/* DAFTAR UNIT AC (Matriks Status per AC + 1 Kolom Keterangan per Item) */}
                <View style={styles.acMatrixHeader}>
                  <Text style={styles.acMatrixTitle}>Unit AC</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(form.acList?.length || 1) > 1 && (
                      <TouchableOpacity
                        onPress={() => removeAcRow(form.acList[form.acList.length - 1].id)}
                        style={styles.acRemoveBtn}
                        activeOpacity={0.7}
                      >
                        <Trash2 color={Colors.danger} size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.acRemoveBtnText}>Hapus AC #{(form.acList?.length || 1)}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={addAcRow} style={styles.acAddBtn} activeOpacity={0.7}>
                      <Plus color={Colors.primary} size={14} style={{ marginRight: 4 }} />
                      <Text style={styles.acAddBtnText}>Tambah AC</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {AC_CHECK_ITEMS.map((item) => (
                  <View key={item.key} style={styles.acRowCard}>
                    <Text style={styles.acParamLabel}>{item.label}</Text>

                    {/* Baris Status Dropdown per Unit AC */}
                    <View style={styles.acUnitsRow}>
                      {(form.acList || [{ id: 1 }]).map((ac: any, acIdx: number) => (
                        <View key={acIdx} style={[styles.acUnitBox, { minWidth: (form.acList?.length || 1) > 2 ? 80 : 100 }]}>
                          <Text style={styles.acUnitTag}>AC #{acIdx + 1}</Text>
                          {renderDropdownSelect(
                            `ac_${acIdx}_${item.key}`,
                            ac[item.key] || '',
                            (v) => updateAcRow(acIdx, item.key, v),
                            ['OK', 'NOK', 'N/A'],
                            `${item.label} (AC #${acIdx + 1})`
                          )}
                        </View>
                      ))}
                    </View>

                    {/* HANYA 1 KOLOM KETERANGAN UNTUK ITEM PEMERIKSAAN INI */}
                    <View style={styles.acKetContainer}>
                      <TextInput
                        style={styles.acKetInput}
                        value={form[item.ketKey] ?? (form.acList?.[0]?.[`${item.key}Ket`] || '')}
                        onChangeText={(val) => {
                          updateForm(item.ketKey, val);
                          updateAcRow(0, `${item.key}Ket`, val);
                        }}
                        placeholder="Keterangan..."
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Card 2: Exhaust Fan */}
          <View style={[styles.card, { zIndex: openDropdownKey?.startsWith('ex') ? 1000 : 3 }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setExhaustExpanded(!exhaustExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Exhaust Fan</Text>
              </View>
              {exhaustExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {exhaustExpanded && (
              <View style={styles.cardBody}>
                <View style={{ marginBottom: Spacing.sm }}>
                  <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>JUMLAH</Text>
                  <TextInput
                    style={[styles.inputBox, { width: 135 }]}
                    value={form.exJumlah}
                    onChangeText={(val) => updateForm('exJumlah', val)}
                    keyboardType="numeric"
                  />
                </View>

                {renderCheckRow('STATUS', 'exStatus', form.exStatus, (v) => updateForm('exStatus', v), form.exStatusKet, (v) => updateForm('exStatusKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('SISTEM KERJA', 'exSystem', form.exSystem, (v) => updateForm('exSystem', v), form.exSystemKet, (v) => updateForm('exSystemKet', v), ['Backup', 'Main', 'N/A'])}
                {renderCheckRow('CONTROLLER', 'exController', form.exController, (v) => updateForm('exController', v), form.exControllerKet, (v) => updateForm('exControllerKet', v), ['Analog', 'Digital', 'N/A'])}
              </View>
            )}
          </View>

          {/* Card 3: Grounding */}
          <View style={[styles.card, { zIndex: openDropdownKey?.startsWith('gr') ? 1000 : 2 }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setGroundingExpanded(!groundingExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Grounding</Text>
              </View>
              {groundingExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {groundingExpanded && (
              <View style={styles.cardBody}>
                <View style={{ marginBottom: Spacing.sm }}>
                  <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>PENGUKURAN GROUNDING</Text>
                  <TextInput
                    style={[styles.inputBox, { width: 135 }]}
                    value={form.grPengukuran}
                    onChangeText={(val) => updateForm('grPengukuran', val)}
                  />
                </View>

                {renderCheckRow('GROUNDING STATUS', 'grStatus', form.grStatus, (v) => updateForm('grStatus', v), form.grStatusKet, (v) => updateForm('grStatusKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('PENANGKAL PETIR', 'grPetir', form.grPetir, (v) => updateForm('grPetir', v), form.grPetirKet, (v) => updateForm('grPetirKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('BAR GROUNDING INDOOR', 'grBarIndoor', form.grBarIndoor, (v) => updateForm('grBarIndoor', v), form.grBarIndoorKet, (v) => updateForm('grBarIndoorKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('BAR GROUNDING TOWER', 'grBarTower', form.grBarTower, (v) => updateForm('grBarTower', v), form.grBarTowerKet, (v) => updateForm('grBarTowerKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('BAR SUMUR GROUNDING', 'grBarSumur', form.grBarSumur, (v) => updateForm('grBarSumur', v), form.grBarSumurKet, (v) => updateForm('grBarSumurKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('KABEL DOWN CONDUCTOR (BC50)', 'grKabel', form.grKabel, (v) => updateForm('grKabel', v), form.grKabelKet, (v) => updateForm('grKabelKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('KONEKSI BAUT', 'grKoneksi', form.grKoneksi, (v) => updateForm('grKoneksi', v), form.grKoneksiKet, (v) => updateForm('grKoneksiKet', v), ['OK', 'NOK', 'N/A'])}
              </View>
            )}
          </View>

          {/* Card 4: Status POP */}
          <View style={[styles.card, { zIndex: openDropdownKey?.startsWith('pop') ? 1000 : 1 }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setStatusPopExpanded(!statusPopExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Status POP</Text>
              </View>
              {statusPopExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {statusPopExpanded && (
              <View style={styles.cardBody}>
                {renderCheckRow('STATUS LOKASI', 'popLokasi', form.popLokasi, (v) => updateForm('popLokasi', v), form.popLokasiKet, (v) => updateForm('popLokasiKet', v), ['Shelter', 'Mini Shelter', 'ODC', 'PLC', 'Other', 'N/A'], 145)}

                <View style={styles.inputGroupFull}>
                  <Text style={styles.inputLabel}>DIMENSI RUANGAN/BANGUNAN</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={form.popLuas}
                    onChangeText={(val) => updateForm('popLuas', val)}
                  />
                </View>

                {renderCheckRow('KONDISI CAT', 'popCat', form.popCat, (v) => updateForm('popCat', v), form.popCatKet, (v) => updateForm('popCatKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('KONSTRUKSI BANGUNAN', 'popKonstruksi', form.popKonstruksi, (v) => updateForm('popKonstruksi', v), form.popKonstruksiKet, (v) => updateForm('popKonstruksiKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('LAMPU PENERANGAN', 'popLampu', form.popLampu, (v) => updateForm('popLampu', v), form.popLampuKet, (v) => updateForm('popLampuKet', v), ['OK', 'NOK', 'N/A'])}
                {renderCheckRow('KUNCI PINTU PENGAMAN', 'popKunci', form.popKunci, (v) => updateForm('popKunci', v), form.popKunciKet, (v) => updateForm('popKunciKet', v), ['OK', 'NOK', 'N/A'])}
              </View>
            )}
          </View>

          {/* Card 5: Catatan */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Catatan</Text>
            </View>
            <View style={styles.cardBody}>
              <TextInput
                style={[styles.inputBox, { height: 100, textAlignVertical: 'top' }]}
                value={form.popNote}
                onChangeText={(val) => updateForm('popNote', val)}
                placeholder="Tambahkan catatan..."
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
            <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    ...Typography.body,
    color: Colors.white,
    marginLeft: 4,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
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
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
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
    fontWeight: 'bold',
  },
  cardBody: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  inputGroupFull: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    color: Colors.text,
    height: 44,
    ...Typography.body,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxActive: {
    borderColor: '#3B82F6',
  },
  selectText: {
    ...Typography.body,
    color: Colors.text,
  },
  selectTextPlaceholder: {
    color: Colors.textMuted,
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
  acMatrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  acMatrixTitle: {
    ...Typography.subtitle1,
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  acMatrixSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  acAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  acAddBtnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  acRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  acRemoveBtnText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 11,
  },
  acRowCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  acParamLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  acUnitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  acUnitBox: {
    flex: 1,
    minWidth: 100,
  },
  acUnitTag: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 10.5,
    marginBottom: 2,
  },
  acKetContainer: {
    marginTop: 4,
  },
  acKetLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  acKetInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    color: Colors.text,
    height: 38,
    ...Typography.caption,
    fontSize: 12,
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
  },
  segmentBtnActiveOk: {
    backgroundColor: '#10B981', // Green for OK
    borderColor: '#10B981',
  },
  segmentBtnActiveNok: {
    backgroundColor: '#F43F5E', // Red for NOK
    borderColor: '#F43F5E',
  },
  segmentBtnActiveNa: {
    backgroundColor: '#EAB308', // Yellow for N/A
    borderColor: '#EAB308',
  },
  segmentBtnActiveOther: {
    backgroundColor: '#3B82F6', // Blue for Custom options (Main/Backup/Indoor/Shelter etc)
    borderColor: '#3B82F6',
  },
  segmentText: {
    color: Colors.textMuted,
    ...Typography.caption,
    fontWeight: 'bold',
  },
  segmentTextActive: {
    color: Colors.white,
    ...Typography.caption,
    fontWeight: 'bold',
  },
  deleteBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
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
  acTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  acTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acTabBtnActive: {
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  acTabText: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.textMuted,
  },
  acTabTextActive: {
    color: Colors.white,
  },
});
