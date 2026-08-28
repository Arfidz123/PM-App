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
import { ChevronUp, ChevronDown, ChevronLeft, Wind, Clock, FileText, Zap, Trash2 } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MechanicalElectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Accordion state
  const [acExpanded, setAcExpanded] = useState(true);
  const [acActiveTab, setAcActiveTab] = useState<'units' | 'keterangan'>('units');
  const [exhaustExpanded, setExhaustExpanded] = useState(true);
  const [groundingExpanded, setGroundingExpanded] = useState(true);
  const [statusPopExpanded, setStatusPopExpanded] = useState(true);

  const { formData, updateFormData } = useInspectionStore();

  // Unified Form state
  const defaultForm = {
    // AC (Dynamic List)
    acList: [{
      id: 1,
      status: 'OK',
      daya: 'OK',
      tekanan: 'OK',
      currentMax: 'OK',
      arus: 'OK',
      kondisiIndoor: 'OK',
      kondisiPipa: 'OK',
      autoRestart: 'OK',
      switch: 'OK',
      settingSuhu: 'OK',
      suhuRuangan: 'OK',
    }],
    acSiteStatusKet: '', acSiteStatus: 'Indoor',
    acMerk: '', acJumlah: '',
    acStatusKet: '', acDayaKet: '', acTekananKet: '', acCurrentMaxKet: '',
    acArusKet: '', acKondisiIndoorKet: '', acKondisiPipaKet: '',
    acAutoRestartKet: '', acSwitchKet: '', acSettingSuhuKet: '', acSuhuRuanganKet: '',

    // Exhaust Fan
    exStatusKet: '', exStatus: 'OK',
    exJumlah: '',
    exSystemKet: '', exSystem: 'Main',
    exControllerKet: '', exController: 'Digital',

    // Grounding
    grPengukuran: '',
    grStatusKet: '', grStatus: 'OK',
    grPetirKet: '', grPetir: 'N/A',
    grBarIndoorKet: '', grBarIndoor: 'N/A',
    grBarTowerKet: '', grBarTower: 'N/A',
    grBarSumurKet: '', grBarSumur: 'N/A',
    grKabelKet: '', grKabel: 'N/A',
    grKoneksiKet: '', grKoneksi: 'OK',

    // Status POP
    popLokasiKet: '', popLokasi: 'Shelter',
    popLuas: '',
    popCatKet: '', popCat: 'OK',
    popKonstruksiKet: '', popKonstruksi: 'OK',
    popLampuKet: '', popLampu: 'OK',
    popKunciKet: '', popKunci: 'OK',

    // Catatan
    note: ''
  };

  const form = { ...defaultForm, ...(formData.mechanicalElect || {}) };

  const updateForm = (key: string, value: any) => {
    updateFormData('mechanicalElect', { [key]: value });
  };

  const addAcRow = () => {
    const newList = [...form.acList, {
      id: form.acList.length > 0 ? Math.max(...form.acList.map((item: any) => item.id)) + 1 : 1,
      status: 'OK', daya: 'OK', tekanan: 'OK', currentMax: 'OK', arus: 'OK',
      kondisiIndoor: 'OK', kondisiPipa: 'OK', autoRestart: 'OK', switch: 'OK',
      settingSuhu: 'OK', suhuRuangan: 'OK'
    }];
    updateForm('acList', newList);
  };

  const removeAcRow = (id: number) => {
    const newList = form.acList.filter((item: any) => item.id !== id);
    updateForm('acList', newList);
  };

  const updateAcRow = (index: number, field: string, value: string) => {
    const newList = [...form.acList];
    newList[index] = { ...newList[index], [field]: value };
    updateForm('acList', newList);
  };

  const renderComplexField = (
    label: string,
    value: string,
    onChangeText: (val: string) => void,
    segmentValue: string,
    onSegmentChange: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A'],
    placeholder: string = 'Keterangan...',
    showInput: boolean = true
  ) => {
    return (
      <View style={styles.complexFieldContainer}>
        <View style={styles.complexFieldHeader}>
          <Text style={styles.inputLabel}>{label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentScroll}>
            <View style={styles.segmentedControl}>
              {options.map((opt) => {
                let activeStyle = styles.segmentBtnActiveOther;
                if (opt === 'OK') activeStyle = styles.segmentBtnActiveOk;
                else if (opt === 'NOK') activeStyle = styles.segmentBtnActiveNok;
                else if (opt === 'N/A') activeStyle = styles.segmentBtnActiveNa;

                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.segmentBtn, segmentValue === opt && activeStyle]}
                    onPress={() => onSegmentChange(segmentValue === opt ? '' : opt)}
                  >
                    <Text style={segmentValue === opt ? styles.segmentTextActive : styles.segmentText}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
        {showInput && (
          <TextInput
            style={styles.inputBox}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
          />
        )}
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
          <View style={styles.card}>
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
                {renderComplexField('SITE STATUS', form.acSiteStatusKet, (v) => updateForm('acSiteStatusKet', v), form.acSiteStatus, (v) => updateForm('acSiteStatus', v), ['Indoor', 'Outdoor'])}

                <View style={styles.row}>
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.inputLabel}>MERK AC</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={form.acMerk}
                      onChangeText={(val) => updateForm('acMerk', val)}
                      placeholder="Contoh: Panasonic"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>

                  <View style={styles.inputGroupFull}>
                    <Text style={styles.inputLabel}>JUMLAH AC</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={form.acJumlah}
                      onChangeText={(val) => updateForm('acJumlah', val)}
                      keyboardType="numeric"
                      placeholder="Contoh: 2"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>

                {/* Tab Switcher: Unit AC vs Keterangan Pengukuran */}
                {(() => {
                  const ketKeys = ['acStatusKet', 'acDayaKet', 'acTekananKet', 'acCurrentMaxKet', 'acArusKet', 'acKondisiIndoorKet', 'acKondisiPipaKet', 'acAutoRestartKet', 'acSwitchKet', 'acSettingSuhuKet', 'acSuhuRuanganKet'];
                  const filledKetCount = ketKeys.filter(k => !!form[k]?.trim()).length;

                  return (
                    <View style={styles.acTabContainer}>
                      <TouchableOpacity
                        style={[styles.acTabBtn, acActiveTab === 'units' && styles.acTabBtnActive]}
                        onPress={() => setAcActiveTab('units')}
                      >
                        <Wind size={16} color={acActiveTab === 'units' ? Colors.white : Colors.textMuted} />
                        <Text style={[styles.acTabText, acActiveTab === 'units' && styles.acTabTextActive]}>
                          Unit AC ({form.acList?.length || 1})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.acTabBtn, acActiveTab === 'keterangan' && styles.acTabBtnActive]}
                        onPress={() => setAcActiveTab('keterangan')}
                      >
                        <FileText size={16} color={acActiveTab === 'keterangan' ? Colors.white : Colors.textMuted} />
                        <Text style={[styles.acTabText, acActiveTab === 'keterangan' && styles.acTabTextActive]}>
                          Keterangan {filledKetCount > 0 ? `(${filledKetCount})` : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })()}

                {/* TAB 1: DAFTAR UNIT AC */}
                {acActiveTab === 'units' && (
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                      <TouchableOpacity
                        onPress={addAcRow}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 }}
                      >
                        <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 12 }}>+ Tambah AC</Text>
                      </TouchableOpacity>
                    </View>

                    {form.acList?.map((ac: any, index: number) => (
                      <View key={index} style={[styles.card, { marginTop: Spacing.xs, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ backgroundColor: Colors.primary, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 11 }}>{index + 1}</Text>
                            </View>
                            <Text style={[styles.cardTitle, { fontSize: 14 }]}>Unit AC #{index + 1}</Text>
                          </View>
                          {form.acList.length > 1 && (
                            <TouchableOpacity onPress={() => removeAcRow(ac.id)} style={{ padding: 4 }}>
                              <Trash2 color={Colors.danger} size={18} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {renderComplexField('STATUS AC', '', () => { }, ac.status, (v) => updateAcRow(index, 'status', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('DAYA', '', () => { }, ac.daya, (v) => updateAcRow(index, 'daya', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('TEKANAN', '', () => { }, ac.tekanan, (v) => updateAcRow(index, 'tekanan', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('CURRENT MAX.', '', () => { }, ac.currentMax, (v) => updateAcRow(index, 'currentMax', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('ARUS PENGUKURAN', '', () => { }, ac.arus, (v) => updateAcRow(index, 'arus', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('KONDISI INDOOR AC', '', () => { }, ac.kondisiIndoor, (v) => updateAcRow(index, 'kondisiIndoor', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('KONDISI PIPA', '', () => { }, ac.kondisiPipa, (v) => updateAcRow(index, 'kondisiPipa', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('AUTO RESTART', '', () => { }, ac.autoRestart, (v) => updateAcRow(index, 'autoRestart', v), ['OK', 'NOK', 'N/A'], '', false)}
                        {renderComplexField('SWITCH KONTAKTOR', '', () => { }, ac.switch, (v) => updateAcRow(index, 'switch', v), ['OK', 'NOK', 'N/A'], '', false)}
                        {renderComplexField('SETING SUHU AC', '', () => { }, ac.settingSuhu, (v) => updateAcRow(index, 'settingSuhu', v), ['OK', 'NOK'], '', false)}
                        {renderComplexField('SUHU RUANGAN', '', () => { }, ac.suhuRuangan, (v) => updateAcRow(index, 'suhuRuangan', v), ['OK', 'NOK'], '', false)}
                      </View>
                    ))}
                  </View>
                )}

                {/* TAB 2: KETERANGAN PENGUKURAN */}
                {acActiveTab === 'keterangan' && (
                  <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border }}>
                    <Text style={[styles.cardTitle, { marginBottom: 4, fontSize: 13, color: Colors.primary }]}>
                      Catatan Keterangan Pengukuran
                    </Text>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>STATUS AC</Text>
                      <TextInput style={styles.inputBox} value={form.acStatusKet} onChangeText={(v) => updateForm('acStatusKet', v)} placeholder="Keterangan Status AC..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>DAYA</Text>
                      <TextInput style={styles.inputBox} value={form.acDayaKet} onChangeText={(v) => updateForm('acDayaKet', v)} placeholder="Keterangan Daya..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>TEKANAN</Text>
                      <TextInput style={styles.inputBox} value={form.acTekananKet} onChangeText={(v) => updateForm('acTekananKet', v)} placeholder="Keterangan Tekanan..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>CURRENT MAX.</Text>
                      <TextInput style={styles.inputBox} value={form.acCurrentMaxKet} onChangeText={(v) => updateForm('acCurrentMaxKet', v)} placeholder="Keterangan Current Max..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>ARUS PENGUKURAN</Text>
                      <TextInput style={styles.inputBox} value={form.acArusKet} onChangeText={(v) => updateForm('acArusKet', v)} placeholder="Keterangan Arus..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>KONDISI INDOOR AC</Text>
                      <TextInput style={styles.inputBox} value={form.acKondisiIndoorKet} onChangeText={(v) => updateForm('acKondisiIndoorKet', v)} placeholder="Keterangan Kondisi Indoor..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>KONDISI PIPA</Text>
                      <TextInput style={styles.inputBox} value={form.acKondisiPipaKet} onChangeText={(v) => updateForm('acKondisiPipaKet', v)} placeholder="Keterangan Kondisi Pipa..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>AUTO RESTART</Text>
                      <TextInput style={styles.inputBox} value={form.acAutoRestartKet} onChangeText={(v) => updateForm('acAutoRestartKet', v)} placeholder="Keterangan Auto Restart..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>SWITCH KONTAKTOR</Text>
                      <TextInput style={styles.inputBox} value={form.acSwitchKet} onChangeText={(v) => updateForm('acSwitchKet', v)} placeholder="Keterangan Switch Kontaktor..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>SETING SUHU AC</Text>
                      <TextInput style={styles.inputBox} value={form.acSettingSuhuKet} onChangeText={(v) => updateForm('acSettingSuhuKet', v)} placeholder="Keterangan Setting Suhu..." placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={styles.inputGroupFull}>
                      <Text style={styles.inputLabel}>SUHU RUANGAN</Text>
                      <TextInput style={styles.inputBox} value={form.acSuhuRuanganKet} onChangeText={(v) => updateForm('acSuhuRuanganKet', v)} placeholder="Keterangan Suhu Ruangan..." placeholderTextColor={Colors.textMuted} />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Card 2: Exhaust Fan */}
          <View style={styles.card}>
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
                {renderComplexField('STATUS', form.exStatusKet, (v) => updateForm('exStatusKet', v), form.exStatus, (v) => updateForm('exStatus', v), ['OK', 'NOK'])}

                <View style={styles.inputGroupFull}>
                  <Text style={styles.inputLabel}>JUMLAH</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={form.exJumlah}
                    onChangeText={(val) => updateForm('exJumlah', val)}
                    placeholder="Jumlah Exhaust"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {renderComplexField('SISTEM KERJA', form.exSystemKet, (v) => updateForm('exSystemKet', v), form.exSystem, (v) => updateForm('exSystem', v), ['Backup', 'Main'])}
                {renderComplexField('CONTROLLER', form.exControllerKet, (v) => updateForm('exControllerKet', v), form.exController, (v) => updateForm('exController', v), ['Analog', 'Digital'])}
              </View>
            )}
          </View>

          {/* Card 3: Grounding */}
          <View style={styles.card}>
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
                <View style={styles.inputGroupFull}>
                  <Text style={styles.inputLabel}>PENGUKURAN GROUNDING</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={form.grPengukuran}
                    onChangeText={(val) => updateForm('grPengukuran', val)}
                    placeholder="Hasil pengukuran"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                {renderComplexField('GROUNDING STATUS', form.grStatusKet, (v) => updateForm('grStatusKet', v), form.grStatus, (v) => updateForm('grStatus', v))}
                {renderComplexField('PENANGKAL PETIR', form.grPetirKet, (v) => updateForm('grPetirKet', v), form.grPetir, (v) => updateForm('grPetir', v))}
                {renderComplexField('BAR GROUNDING INDOOR', form.grBarIndoorKet, (v) => updateForm('grBarIndoorKet', v), form.grBarIndoor, (v) => updateForm('grBarIndoor', v))}
                {renderComplexField('BAR GROUNDING TOWER', form.grBarTowerKet, (v) => updateForm('grBarTowerKet', v), form.grBarTower, (v) => updateForm('grBarTower', v))}
                {renderComplexField('BAR SUMUR GROUNDING', form.grBarSumurKet, (v) => updateForm('grBarSumurKet', v), form.grBarSumur, (v) => updateForm('grBarSumur', v))}
                {renderComplexField('KABEL DOWN CONDUCTOR (BC50)', form.grKabelKet, (v) => updateForm('grKabelKet', v), form.grKabel, (v) => updateForm('grKabel', v))}
                {renderComplexField('KONEKSI BAUT', form.grKoneksiKet, (v) => updateForm('grKoneksiKet', v), form.grKoneksi, (v) => updateForm('grKoneksi', v), ['OK', 'NOK'])}
              </View>
            )}
          </View>

          {/* Card 4: Status POP */}
          <View style={styles.card}>
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
                {renderComplexField('STATUS LOKASI', form.popLokasiKet, (v) => updateForm('popLokasiKet', v), form.popLokasi, (v) => updateForm('popLokasi', v), ['Shelter', 'Mini Shelter', 'ODC', 'PLC', 'Other'])}

                <View style={styles.inputGroupFull}>
                  <Text style={styles.inputLabel}>LUAS BANGUNAN / LUAS RUANGAN</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={form.popLuas}
                    onChangeText={(val) => updateForm('popLuas', val)}
                  />
                </View>

                {renderComplexField('KONDISI CAT', form.popCatKet, (v) => updateForm('popCatKet', v), form.popCat, (v) => updateForm('popCat', v))}
                {renderComplexField('KONSTRUKSI BANGUNAN', form.popKonstruksiKet, (v) => updateForm('popKonstruksiKet', v), form.popKonstruksi, (v) => updateForm('popKonstruksi', v))}
                {renderComplexField('LAMPU PENERANGAN', form.popLampuKet, (v) => updateForm('popLampuKet', v), form.popLampu, (v) => updateForm('popLampu', v))}
                {renderComplexField('KUNCI PINTU PENGAMAN', form.popKunciKet, (v) => updateForm('popKunciKet', v), form.popKunci, (v) => updateForm('popKunci', v))}
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
    ...Typography.body,
  },
  complexFieldContainer: {
    marginBottom: Spacing.md,
  },
  complexFieldHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  segmentScroll: {
    marginTop: Spacing.sm,
    width: '100%',
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
