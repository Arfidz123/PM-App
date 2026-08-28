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
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Zap,
  Search,
  Shield,
  ArrowDownToLine,
  PlugZap,
  Trash2,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header } from '../../components/common';
import LinearGradient from 'react-native-linear-gradient';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabKey = 'tegangan' | 'visual' | 'arrester' | 'ground' | 'rectifier' | 'acpdb' | 'dcpdb' | 'bebanRectifier';

export const PowerSystemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [activeTab, setActiveTab] = useState<TabKey>('tegangan');

  const [rect1Expanded, setRect1Expanded] = useState(true);
  const [rect2Expanded, setRect2Expanded] = useState(false);
  const [rect3Expanded, setRect3Expanded] = useState(false);

  // Expand states for Tegangan cards
  const [tegCatuanUtamaExpanded, setTegCatuanUtamaExpanded] = useState(true);
  const [tegCatuanEksExpanded, setTegCatuanEksExpanded] = useState(false);
  const [tegTeganganAcExpanded, setTegTeganganAcExpanded] = useState(false);
  const [tegTotalArusExpanded, setTegTotalArusExpanded] = useState(false);
  const [tegStabilizerExpanded, setTegStabilizerExpanded] = useState(false);

  const { formData, updateFormData } = useInspectionStore();

  // Form State
  const defaultForm = {
    // Catuan Utama & Eksternal
    tipePln: 'PS Gi',
    idPelanggan: '', dayaListrik: '', phasaCatuan: '', bulanLalu: '', bulanIni: '', pengukuranKwh: '',
    gensetAda: 'Tidak Ada', merkGenset: '', snGenset: '', jenisGenset: '', tipeGenset: '', kapasitasGenset: '', phasaGenset: '',
    acpdbBeban: [{ mcb: '1', kapasitas: '', phasaRBeban: '', phasaRArus: '', phasaSBeban: '', phasaSArus: '', phasaTBeban: '', phasaTArus: '', labelMcb: '', peruntukan: '' }],
    dcpdbBeban: [{ mcb: '1', kapasitas: '', dcpdb1Beban: '', dcpdb1Arus: '', dcpdb2Beban: '', dcpdb2Arus: '', dcpdb3Beban: '', dcpdb3Arus: '', dcpdb4Beban: '', dcpdb4Arus: '', dcpdb5Beban: '', dcpdb5Arus: '' }],
    rectifierBeban: [{ mcb: '1', rect1KapMcb: '', rect1Arus: '', rect1NamaNe: '', rect2KapMcb: '', rect2Arus: '', rect2NamaNe: '', rect3KapMcb: '', rect3Arus: '', rect3NamaNe: '' }],

    // Tegangan
    teganganR_N: '', teganganS_N: '', teganganT_N: '',
    teganganR_T: '', teganganS_T: '', teganganR_S: '', teganganG_N: '',
    teganganR_N_TU: '220 ± 10%', teganganS_N_TU: '220 ± 10%', teganganT_N_TU: '220 ± 10%',
    teganganR_T_TU: '400 ± 10%', teganganS_T_TU: '400 ± 10%', teganganR_S_TU: '400 ± 10%', teganganG_N_TU: '',
    arusPhasaR: '', arusPhasaS: '', arusPhasaT: '', arusPhasaN: '',
    frekuensi: '',
    stabilizerKapasitas: '', stabilizerJumlah: '',

    // Visual
    cekKabel: 'OK', cekKabelKet: '',
    cekBautTerminal: 'OK', cekBautTerminalKet: '',
    cekBautMCB: 'OK', cekBautMCBKet: '',
    indikatorLamp: 'OK', indikatorLampKet: '',
    cosGenset: 'OK', cosGensetKet: '',

    // Arrester
    kwhBoxR: 'OK', kwhBoxS: 'OK', kwhBoxT: 'OK', kwhBoxN: 'OK',
    acpdbR: 'OK', acpdbS: 'OK', acpdbT: 'OK', acpdbN: 'OK',
    rectifierR: 'OK', rectifierS: 'OK', rectifierT: 'OK', rectifierN: 'OK',

    // Grounding
    grOutdoor: '', grIndoor: '', systemGrounding: '',
    grCatatan: '',

    // Rectifier Grid
    rect1InputAC: '', rect1Merk: '', rect1Tipe: '', rect1KapasitasSlot: '', rect1SN: '', rect1TipeModul: '', rect1ModulJml: '', rect1KapasitasModul: '', rect1ArusBeban: '', rect1TegInput: '', rect1TegFloating: '', rect1TegEqualizing: '', rect1Lvd: '', rect1Boost: 'Disable', rect1Utilisasi: '',
    rect1KebersihanRack: 'OK', rect1KebersihanRackKet: '', rect1CekBautKabinet: 'OK', rect1CekBautKabinetKet: '',
    rect2InputAC: '', rect2Merk: '', rect2Tipe: '', rect2KapasitasSlot: '', rect2SN: '', rect2TipeModul: '', rect2ModulJml: '', rect2KapasitasModul: '', rect2ArusBeban: '', rect2TegInput: '', rect2TegFloating: '', rect2TegEqualizing: '', rect2Lvd: '', rect2Boost: 'Disable', rect2Utilisasi: '',
    rect2KebersihanRack: 'OK', rect2KebersihanRackKet: '', rect2CekBautKabinet: 'OK', rect2CekBautKabinetKet: '',
    rect3InputAC: '', rect3Merk: '', rect3Tipe: '', rect3KapasitasSlot: '', rect3SN: '', rect3TipeModul: '', rect3ModulJml: '', rect3KapasitasModul: '', rect3ArusBeban: '', rect3TegInput: '', rect3TegFloating: '', rect3TegEqualizing: '', rect3Lvd: '', rect3Boost: 'Disable', rect3Utilisasi: '',
    rect3KebersihanRack: 'OK', rect3KebersihanRackKet: '', rect3CekBautKabinet: 'OK', rect3CekBautKabinetKet: '',
  };

  const form = { ...defaultForm, ...(formData.powerSystem || {}) };

  const updateForm = (key: string, value: any) => {
    if (key === 'gensetAda' && value === 'Tidak Ada') {
      updateFormData('powerSystem', {
        gensetAda: 'Tidak Ada',
        merkGenset: '',
        snGenset: '',
        jenisGenset: '',
        tipeGenset: '',
        kapasitasGenset: '',
        phasaGenset: '',
      });
      return;
    }

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

    // Sync to Rectifier Screen
    const match = key.match(/^rect(\d+)(.*)$/);
    if (match) {
      const rectIndex = parseInt(match[1]) - 1; // 0, 1, 2
      const fieldKey = match[2];

      const fieldMap: Record<string, string> = {
        'Merk': 'merk',
        'Tipe': 'tipe',
        'SN': 'sn',
        'TipeModul': 'tipeModul',
        'ModulJml': 'jmlModul',
        'KapasitasSlot': 'jmlSlot',
        'ArusBeban': 'arusBeban',
        'TegInput': 'tegInput',
        'TegFloating': 'tegFloating',
      };

      const rectField = fieldMap[fieldKey];
      if (rectField) {
        const rectData = formData.rectifier || {};
        let rectifiers = [...(rectData.rectifiers || [
          {
            id: '1',
            isExpanded: true,
            merk: '',
            tipe: '',
            sn: '',
            tipeModul: '',
            jmlModul: '',
            jmlSlot: '',
            modules: [],
            mcbs: [{ id: '1', merk: '', kapasitas: '', peruntukan: '' }],
            arusBeban: '',
            tegInput: '',
            tegFloating: '',
          }
        ])];

        while (rectifiers.length <= rectIndex) {
          const newId = (rectifiers.length > 0 ? Math.max(...rectifiers.map((r: any) => parseInt(r.id))) + 1 : 1).toString();
          rectifiers.push({
            id: newId,
            isExpanded: true,
            merk: '',
            tipe: '',
            sn: '',
            tipeModul: '',
            jmlModul: '',
            jmlSlot: '',
            modules: [],
            mcbs: [{ id: '1', merk: '', kapasitas: '', peruntukan: '' }],
            arusBeban: '',
            tegInput: '',
            tegFloating: '',
          });
        }

        rectifiers[rectIndex] = {
          ...rectifiers[rectIndex],
          [rectField]: value
        };

        updateFormData('rectifier', { rectifiers });
      }
    }
  };

  const syncAcpdbList = (list: any[]) => {
    const normalized = list.map((item: any) => ({
      ...item,
      rBeban: item.phasaRBeban ?? item.rBeban ?? '',
      rArus: item.phasaRArus ?? item.rArus ?? '',
      sBeban: item.phasaSBeban ?? item.sBeban ?? '',
      sArus: item.phasaSArus ?? item.sArus ?? '',
      tBeban: item.phasaTBeban ?? item.tBeban ?? '',
      tArus: item.phasaTArus ?? item.tArus ?? '',
      phasaRBeban: item.phasaRBeban ?? item.rBeban ?? '',
      phasaRArus: item.phasaRArus ?? item.rArus ?? '',
      phasaSBeban: item.phasaSBeban ?? item.sBeban ?? '',
      phasaSArus: item.phasaSArus ?? item.sArus ?? '',
      phasaTBeban: item.phasaTBeban ?? item.tBeban ?? '',
      phasaTArus: item.phasaTArus ?? item.tArus ?? '',
    }));
    updateFormData('powerSystem', { acpdbBeban: normalized, bebanAcpdb: normalized });
  };

  const addAcpdbRow = () => {
    const list = form.acpdbBeban || form.bebanAcpdb || [];
    const nextMcb = (list.length > 0 ? Math.max(...list.map((r: any) => parseInt(r.mcb) || 0)) + 1 : 1).toString();
    const newList = [...list, { mcb: nextMcb, kapasitas: '', phasaRBeban: '', phasaRArus: '', phasaSBeban: '', phasaSArus: '', phasaTBeban: '', phasaTArus: '', labelMcb: '', peruntukan: '' }];
    syncAcpdbList(newList);
  };

  const updateAcpdbRow = (index: number, field: string, value: string) => {
    const list = [...(form.acpdbBeban || form.bebanAcpdb || [])];
    list[index] = { ...list[index], [field]: value };
    syncAcpdbList(list);
  };

  const removeAcpdbRow = (index: number) => {
    const list = [...(form.acpdbBeban || form.bebanAcpdb || [])];
    list.splice(index, 1);
    const updatedList = list.map((item: any, i: number) => ({ ...item, mcb: (i + 1).toString() }));
    syncAcpdbList(updatedList);
  };

  // DCPDB Helpers
  const syncDcpdbList = (list: any[]) => {
    const normalized = list.map((item: any) => ({
      ...item,
      d1Beban: item.dcpdb1Beban ?? item.d1Beban ?? '',
      d1Arus: item.dcpdb1Arus ?? item.d1Arus ?? '',
      d2Beban: item.dcpdb2Beban ?? item.d2Beban ?? '',
      d2Arus: item.dcpdb2Arus ?? item.d2Arus ?? '',
      d3Beban: item.dcpdb3Beban ?? item.d3Beban ?? '',
      d3Arus: item.dcpdb3Arus ?? item.d3Arus ?? '',
      d4Beban: item.dcpdb4Beban ?? item.d4Beban ?? '',
      d4Arus: item.dcpdb4Arus ?? item.d4Arus ?? '',
      d5Beban: item.dcpdb5Beban ?? item.d5Beban ?? '',
      d5Arus: item.dcpdb5Arus ?? item.d5Arus ?? '',
      dcpdb1Beban: item.dcpdb1Beban ?? item.d1Beban ?? '',
      dcpdb1Arus: item.dcpdb1Arus ?? item.d1Arus ?? '',
      dcpdb2Beban: item.dcpdb2Beban ?? item.d2Beban ?? '',
      dcpdb2Arus: item.dcpdb2Arus ?? item.d2Arus ?? '',
      dcpdb3Beban: item.dcpdb3Beban ?? item.d3Beban ?? '',
      dcpdb3Arus: item.dcpdb3Arus ?? item.d3Arus ?? '',
      dcpdb4Beban: item.dcpdb4Beban ?? item.d4Beban ?? '',
      dcpdb4Arus: item.dcpdb4Arus ?? item.d4Arus ?? '',
      dcpdb5Beban: item.dcpdb5Beban ?? item.d5Beban ?? '',
      dcpdb5Arus: item.dcpdb5Arus ?? item.d5Arus ?? '',
    }));
    updateFormData('powerSystem', { dcpdbBeban: normalized, bebanDcpdb: normalized });
  };

  const addDcpdbRow = () => {
    const list = form.dcpdbBeban || form.bebanDcpdb || [];
    const nextMcb = (list.length > 0 ? Math.max(...list.map((r: any) => parseInt(r.mcb) || 0)) + 1 : 1).toString();
    const newList = [
      ...list,
      {
        mcb: nextMcb, kapasitas: '',
        dcpdb1Beban: '', dcpdb1Arus: '',
        dcpdb2Beban: '', dcpdb2Arus: '',
        dcpdb3Beban: '', dcpdb3Arus: '',
        dcpdb4Beban: '', dcpdb4Arus: '',
        dcpdb5Beban: '', dcpdb5Arus: '',
      }
    ];
    syncDcpdbList(newList);
  };

  const updateDcpdbRow = (index: number, field: string, value: string) => {
    const list = [...(form.dcpdbBeban || form.bebanDcpdb || [])];
    list[index] = { ...list[index], [field]: value };
    syncDcpdbList(list);
  };

  const removeDcpdbRow = (index: number) => {
    const list = [...(form.dcpdbBeban || form.bebanDcpdb || [])];
    list.splice(index, 1);
    const updatedList = list.map((item: any, i: number) => ({ ...item, mcb: (i + 1).toString() }));
    syncDcpdbList(updatedList);
  };

  // Rectifier Beban Helpers
  const syncRectifierBebanList = (list: any[]) => {
    const normalized = list.map((item: any) => ({
      ...item,
      r1Kap: item.rect1KapMcb ?? item.r1Kap ?? '',
      r1Arus: item.rect1Arus ?? item.r1Arus ?? '',
      r1Nama: item.rect1NamaNe ?? item.r1Nama ?? '',
      r2Kap: item.rect2KapMcb ?? item.r2Kap ?? '',
      r2Arus: item.rect2Arus ?? item.r2Arus ?? '',
      r2Nama: item.rect2NamaNe ?? item.r2Nama ?? '',
      r3Kap: item.rect3KapMcb ?? item.r3Kap ?? '',
      r3Arus: item.rect3Arus ?? item.r3Arus ?? '',
      r3Nama: item.rect3NamaNe ?? item.r3Nama ?? '',
      rect1KapMcb: item.rect1KapMcb ?? item.r1Kap ?? '',
      rect1Arus: item.rect1Arus ?? item.r1Arus ?? '',
      rect1NamaNe: item.rect1NamaNe ?? item.r1Nama ?? '',
      rect2KapMcb: item.rect2KapMcb ?? item.r2Kap ?? '',
      rect2Arus: item.rect2Arus ?? item.r2Arus ?? '',
      rect2NamaNe: item.rect2NamaNe ?? item.r2Nama ?? '',
      rect3KapMcb: item.rect3KapMcb ?? item.r3Kap ?? '',
      rect3Arus: item.rect3Arus ?? item.r3Arus ?? '',
      rect3NamaNe: item.rect3NamaNe ?? item.r3Nama ?? '',
    }));
    updateFormData('powerSystem', { rectifierBeban: normalized, bebanRectifier: normalized });
  };

  const addRectifierBebanRow = () => {
    const list = form.rectifierBeban || form.bebanRectifier || [];
    const nextMcb = (list.length > 0 ? Math.max(...list.map((r: any) => parseInt(r.mcb) || 0)) + 1 : 1).toString();
    const newList = [
      ...list,
      {
        mcb: nextMcb,
        rect1KapMcb: '', rect1Arus: '', rect1NamaNe: '',
        rect2KapMcb: '', rect2Arus: '', rect2NamaNe: '',
        rect3KapMcb: '', rect3Arus: '', rect3NamaNe: '',
      }
    ];
    syncRectifierBebanList(newList);
  };

  const updateRectifierBebanRow = (index: number, field: string, value: string) => {
    const list = [...(form.rectifierBeban || form.bebanRectifier || [])];
    list[index] = { ...list[index], [field]: value };
    syncRectifierBebanList(list);
  };

  const removeRectifierBebanRow = (index: number) => {
    const list = [...(form.rectifierBeban || form.bebanRectifier || [])];
    list.splice(index, 1);
    const updatedList = list.map((item: any, i: number) => ({ ...item, mcb: (i + 1).toString() }));
    syncRectifierBebanList(updatedList);
  };

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'tegangan', label: 'Tegangan', icon: Zap },
    { key: 'rectifier', label: 'Rectifier', icon: PlugZap },
    { key: 'visual', label: 'Visual', icon: Search },
    { key: 'arrester', label: 'Arrester', icon: Shield },
    { key: 'ground', label: 'Ground', icon: ArrowDownToLine },
    { key: 'acpdb', label: 'B. ACPDB', icon: Zap },
    { key: 'dcpdb', label: 'B. DCPDB', icon: Zap },
    { key: 'bebanRectifier', label: 'B. Rectifier', icon: Zap },
  ];

  const renderSegmentedControl = (
    value: string,
    onValueChange: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A']
  ) => (
    <View style={styles.segmentedControl}>
      {options.map((opt) => {
        let activeStyle: any = styles.segmentBtnActiveOther;
        if (opt === 'OK') activeStyle = styles.segmentBtnActiveOk;
        else if (opt === 'NOK') activeStyle = styles.segmentBtnActiveNok;
        else if (opt === 'N/A') activeStyle = styles.segmentBtnActiveNa;

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.segmentBtn, value === opt && activeStyle]}
            onPress={() => onValueChange(opt)}
          >
            <Text style={[styles.segmentText, value === opt && styles.segmentTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderComplexField = (
    label: string,
    value: string,
    onChangeText: (val: string) => void,
    segmentValue: string,
    onSegmentChange: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A'],
    placeholder: string = 'Keterangan...'
  ) => {
    return (
      <View style={styles.complexFieldContainer}>
        <View style={styles.complexFieldHeader}>
          <Text style={styles.inputLabel}>{label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentScroll}>
            {renderSegmentedControl(segmentValue, onSegmentChange, options)}
          </ScrollView>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    );
  };

  const renderTegangan = () => (
    <View>
      {/* Catuan Utama */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setTegCatuanUtamaExpanded(!tegCatuanUtamaExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Catuan Utama</Text>
          {tegCatuanUtamaExpanded ?
            <ChevronUp color={Colors.textMuted} size={20} /> :
            <ChevronDown color={Colors.textMuted} size={20} />
          }
        </TouchableOpacity>

        {tegCatuanUtamaExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>PLN</Text>
                {renderSegmentedControl(form.tipePln || 'PS Gi', (val) => updateForm('tipePln', val), ['PS Gi', 'Distribusi', 'Lainnya'])}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>ID Pelanggan</Text>
                <TextInput style={styles.textInput} value={form.idPelanggan} onChangeText={(val) => updateForm('idPelanggan', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Daya Listrik (kVA)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.dayaListrik} onChangeText={(val) => updateForm('dayaListrik', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Phasa</Text>
                <TextInput style={styles.textInput} value={(form.phasaCatuan || '').replace(/phasa\s*/gi, '').trim()} onChangeText={(val) => updateForm('phasaCatuan', val)} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Bulan Lalu</Text>
                <TextInput style={styles.textInput} value={form.bulanLalu} onChangeText={(val) => updateForm('bulanLalu', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Bulan Ini</Text>
                <TextInput style={styles.textInput} value={form.bulanIni} onChangeText={(val) => updateForm('bulanIni', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Pengukuran KWH</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.pengukuranKwh} onChangeText={(val) => updateForm('pengukuranKwh', val)} />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Catuan Eksternal */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setTegCatuanEksExpanded(!tegCatuanEksExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Catuan Eksternal</Text>
          {tegCatuanEksExpanded ?
            <ChevronUp color={Colors.textMuted} size={20} /> :
            <ChevronDown color={Colors.textMuted} size={20} />
          }
        </TouchableOpacity>

        {tegCatuanEksExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Genset</Text>
                {renderSegmentedControl(form.gensetAda, (val) => updateForm('gensetAda', val), ['Ada', 'Tidak Ada'])}
              </View>
            </View>

            {form.gensetAda === 'Ada' && (
              <>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.inputLabel}>Merk Genset</Text>
                    <TextInput style={styles.textInput} value={form.merkGenset} onChangeText={(val) => updateForm('merkGenset', val)} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.inputLabel}>Serial Number</Text>
                    <TextInput style={styles.textInput} value={form.snGenset} onChangeText={(val) => updateForm('snGenset', val)} />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.inputLabel}>Jenis Genset</Text>
                    <TextInput style={styles.textInput} value={form.jenisGenset} onChangeText={(val) => updateForm('jenisGenset', val)} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.inputLabel}>Tipe Genset</Text>
                    <TextInput style={styles.textInput} value={form.tipeGenset} onChangeText={(val) => updateForm('tipeGenset', val)} />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.inputLabel}>Kapasitas</Text>
                    <TextInput style={styles.textInput} value={form.kapasitasGenset} onChangeText={(val) => updateForm('kapasitasGenset', val)} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.inputLabel}>Phasa</Text>
                    <TextInput style={styles.textInput} keyboardType="numeric" value={(form.phasaGenset || '').replace(/phasa\s*/gi, '').trim()} onChangeText={(val) => updateForm('phasaGenset', val)} />
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Tegangan Catuan (AC) */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setTegTeganganAcExpanded(!tegTeganganAcExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Tegangan Catuan (AC)</Text>
          {tegTeganganAcExpanded ?
            <ChevronUp color={Colors.textMuted} size={20} /> :
            <ChevronDown color={Colors.textMuted} size={20} />
          }
        </TouchableOpacity>

        {tegTeganganAcExpanded && (
          <View style={styles.cardBody}>
            {/* Helper component for Tegangan with Tolak Ukur */}
            {[
              { label: 'R-N', key: 'teganganR_N', tuKey: 'teganganR_N_TU' },
              { label: 'S-N', key: 'teganganS_N', tuKey: 'teganganS_N_TU' },
              { label: 'T-N', key: 'teganganT_N', tuKey: 'teganganT_N_TU' },
              { label: 'R-T', key: 'teganganR_T', tuKey: 'teganganR_T_TU' },
              { label: 'S-T', key: 'teganganS_T', tuKey: 'teganganS_T_TU' },
              { label: 'R-S', key: 'teganganR_S', tuKey: 'teganganR_S_TU' },
              { label: 'G-N', key: 'teganganG_N', tuKey: 'teganganG_N_TU' },
            ].map((item, index) => (
              <View key={index} style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>{item.label} (V)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={form[item.key as keyof typeof form]}
                    onChangeText={(val) => updateForm(item.key as string, val)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Tolak Ukur</Text>
                  <TextInput
                    style={styles.textInput}
                    value={form[item.tuKey as keyof typeof form]}
                    onChangeText={(val) => updateForm(item.tuKey as string, val)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setTegTotalArusExpanded(!tegTotalArusExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Total Arus Terpakai (AC)</Text>
          {tegTotalArusExpanded ?
            <ChevronUp color={Colors.textMuted} size={20} /> :
            <ChevronDown color={Colors.textMuted} size={20} />
          }
        </TouchableOpacity>

        {tegTotalArusExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Phasa</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={(form.phasaArus || '').replace(/phasa\s*/gi, '').trim()} onChangeText={(val) => updateForm('phasaArus', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Frekuensi (Hz)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.frekuensi} onChangeText={(val) => updateForm('frekuensi', val)} />
              </View>
              <View style={styles.col} />
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>R (A)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.arusPhasaR} onChangeText={(val) => updateForm('arusPhasaR', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>S (A)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.arusPhasaS} onChangeText={(val) => updateForm('arusPhasaS', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>T (A)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.arusPhasaT} onChangeText={(val) => updateForm('arusPhasaT', val)} />
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setTegStabilizerExpanded(!tegStabilizerExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Stabilizer</Text>
          {tegStabilizerExpanded ?
            <ChevronUp color={Colors.textMuted} size={20} /> :
            <ChevronDown color={Colors.textMuted} size={20} />
          }
        </TouchableOpacity>

        {tegStabilizerExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Kapasitas (kVA)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.stabilizerKapasitas} onChangeText={(val) => updateForm('stabilizerKapasitas', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Jumlah</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form.stabilizerJumlah} onChangeText={(val) => updateForm('stabilizerJumlah', val)} />
              </View>
            </View>
          </View>
        )}
      </View>

    </View>
  );

  const renderAcpdb = () => (
    <View style={styles.card}>
      {/* Beban ACPDB */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.sm }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Beban ACPDB</Text>
        <TouchableOpacity onPress={addAcpdbRow} style={{ padding: 8 }}>
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>+ Tambah MCB Baru</Text>
        </TouchableOpacity>
      </View>

      {form.acpdbBeban.map((row: any, i: number) => (
        <View key={row.mcb} style={[styles.card, { marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>MCB #{i + 1}</Text>
            {i > 0 && (
              <TouchableOpacity onPress={() => removeAcpdbRow(i)} style={{ padding: 4 }}>
                <Trash2 color={Colors.danger} size={20} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Kapasitas</Text>
              <TextInput style={styles.textInput} value={row.kapasitas} onChangeText={(val) => updateAcpdbRow(i, 'kapasitas', val)} />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Label MCB</Text>
              <TextInput style={styles.textInput} value={row.labelMcb} onChangeText={(val) => updateAcpdbRow(i, 'labelMcb', val)} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Peruntukan</Text>
              <TextInput style={styles.textInput} value={row.peruntukan} onChangeText={(val) => updateAcpdbRow(i, 'peruntukan', val)} />
            </View>
          </View>

          <Text style={[styles.inputLabel, { marginTop: Spacing.sm, fontWeight: 'bold', color: Colors.primary }]}>Phasa R</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Beban</Text>
              <TextInput style={styles.textInput} value={row.phasaRBeban} onChangeText={(val) => updateAcpdbRow(i, 'phasaRBeban', val)} />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Arus (A)</Text>
              <TextInput style={styles.textInput} keyboardType="numeric" value={row.phasaRArus} onChangeText={(val) => updateAcpdbRow(i, 'phasaRArus', val)} />
            </View>
          </View>

          <Text style={[styles.inputLabel, { marginTop: Spacing.sm, fontWeight: 'bold', color: Colors.primary }]}>Phasa S</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Beban</Text>
              <TextInput style={styles.textInput} value={row.phasaSBeban} onChangeText={(val) => updateAcpdbRow(i, 'phasaSBeban', val)} />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Arus (A)</Text>
              <TextInput style={styles.textInput} keyboardType="numeric" value={row.phasaSArus} onChangeText={(val) => updateAcpdbRow(i, 'phasaSArus', val)} />
            </View>
          </View>

          <Text style={[styles.inputLabel, { marginTop: Spacing.sm, fontWeight: 'bold', color: Colors.primary }]}>Phasa T</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Beban</Text>
              <TextInput style={styles.textInput} value={row.phasaTBeban} onChangeText={(val) => updateAcpdbRow(i, 'phasaTBeban', val)} />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Arus (A)</Text>
              <TextInput style={styles.textInput} keyboardType="numeric" value={row.phasaTArus} onChangeText={(val) => updateAcpdbRow(i, 'phasaTArus', val)} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDcpdb = () => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.sm }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Beban DCPDB</Text>
        <TouchableOpacity onPress={addDcpdbRow} style={{ padding: 8 }}>
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>+ Tambah MCB Baru</Text>
        </TouchableOpacity>
      </View>

      {form.dcpdbBeban.map((row: any, i: number) => (
        <View key={i} style={[styles.card, { marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>MCB #{i + 1}</Text>
            {i > 0 && (
              <TouchableOpacity onPress={() => removeDcpdbRow(i)} style={{ padding: 4 }}>
                <Trash2 color={Colors.danger} size={20} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

          <View style={{ marginBottom: Spacing.sm }}>
            <Text style={styles.inputLabel}>Kapasitas</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={row.kapasitas} onChangeText={(val) => updateDcpdbRow(i, 'kapasitas', val)} />
          </View>

          {[1, 2, 3, 4, 5].map((num) => (
            <View key={num}>
              <Text style={[styles.inputLabel, { marginTop: Spacing.sm, fontWeight: 'bold', color: Colors.primary }]}>DCPDB #{num}</Text>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Beban</Text>
                  <TextInput style={styles.textInput} value={row[`dcpdb${num}Beban`]} onChangeText={(val) => updateDcpdbRow(i, `dcpdb${num}Beban`, val)} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Arus (A)</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={row[`dcpdb${num}Arus`]} onChangeText={(val) => updateDcpdbRow(i, `dcpdb${num}Arus`, val)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderBebanRectifier = () => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.sm }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Beban Rectifier</Text>
        <TouchableOpacity onPress={addRectifierBebanRow} style={{ padding: 8 }}>
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>+ Tambah MCB Baru</Text>
        </TouchableOpacity>
      </View>

      {form.rectifierBeban.map((row: any, i: number) => (
        <View key={i} style={[styles.card, { marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>MCB #{i + 1}</Text>
            {i > 0 && (
              <TouchableOpacity onPress={() => removeRectifierBebanRow(i)} style={{ padding: 4 }}>
                <Trash2 color={Colors.danger} size={20} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

          {[1, 2, 3].map((num) => (
            <View key={num} style={{ marginBottom: Spacing.sm }}>
              <Text style={[styles.inputLabel, { marginTop: Spacing.xs, fontWeight: 'bold', color: Colors.primary }]}>Rectifier #{num}</Text>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>KAP MCB</Text>
                  <TextInput style={styles.textInput} value={row[`rect${num}KapMcb`]} onChangeText={(val) => updateRectifierBebanRow(i, `rect${num}KapMcb`, val)} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>ARUS (A)</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={row[`rect${num}Arus`]} onChangeText={(val) => updateRectifierBebanRow(i, `rect${num}Arus`, val)} />
                </View>
              </View>
              <View style={{ marginTop: 4 }}>
                <Text style={styles.inputLabel}>NAMA NE</Text>
                <TextInput style={styles.textInput} value={row[`rect${num}NamaNe`]} onChangeText={(val) => updateRectifierBebanRow(i, `rect${num}NamaNe`, val)} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderVisual = () => (
    <View style={styles.card}>
      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Visual Check MDP</Text>
      <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />
      {renderComplexField('Cek Kabel', form.cekKabelKet, (val) => updateForm('cekKabelKet', val), form.cekKabel, (val) => updateForm('cekKabel', val))}
      {renderComplexField('Cek Baut Terminal', form.cekBautTerminalKet, (val) => updateForm('cekBautTerminalKet', val), form.cekBautTerminal, (val) => updateForm('cekBautTerminal', val))}
      {renderComplexField('Cek Baut MCB/MCCB', form.cekBautMCBKet, (val) => updateForm('cekBautMCBKet', val), form.cekBautMCB, (val) => updateForm('cekBautMCB', val))}
      {renderComplexField('Indikator Lamp R,S,T', form.indikatorLampKet, (val) => updateForm('indikatorLampKet', val), form.indikatorLamp, (val) => updateForm('indikatorLamp', val))}
      {renderComplexField('COS Genset', form.cosGensetKet, (val) => updateForm('cosGensetKet', val), form.cosGenset, (val) => updateForm('cosGenset', val))}
    </View>
  );

  const renderArresterPhase = (phasa: string, keySuffix: 'R' | 'S' | 'T' | 'N') => (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.inputLabel}>Phasa {phasa}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ flex: 1, color: Colors.textSecondary }}>KWH Box</Text>
        {renderSegmentedControl(form[`kwhBox${keySuffix}` as keyof typeof form], (val) => updateForm(`kwhBox${keySuffix}` as string, val))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ flex: 1, color: Colors.textSecondary }}>ACPDB</Text>
        {renderSegmentedControl(form[`acpdb${keySuffix}` as keyof typeof form], (val) => updateForm(`acpdb${keySuffix}` as string, val))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ flex: 1, color: Colors.textSecondary }}>Rectifier</Text>
        {renderSegmentedControl(form[`rectifier${keySuffix}` as keyof typeof form], (val) => updateForm(`rectifier${keySuffix}` as string, val))}
      </View>
      <View style={{ marginTop: 4 }}>
        <Text style={[styles.inputLabel, { fontSize: 12 }]}>Keterangan Phasa {phasa}</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Catatan / Keterangan Arrester"
          value={form[`arresterKet${keySuffix}` as keyof typeof form]}
          onChangeText={(val) => updateForm(`arresterKet${keySuffix}` as string, val)}
        />
      </View>
    </View>
  );

  const renderArrester = () => (
    <View style={styles.card}>
      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Pengecekan Arrester</Text>
      <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />
      {renderArresterPhase('R', 'R')}
      <View style={styles.divider} />
      {renderArresterPhase('S', 'S')}
      <View style={styles.divider} />
      {renderArresterPhase('T', 'T')}
      <View style={styles.divider} />
      {renderArresterPhase('N', 'N')}
    </View>
  );

  const renderGround = () => (
    <View style={styles.card}>
      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Grounding System</Text>
      <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

      <Text style={styles.inputLabel}>Pengukuran Bak Kontrol Outdoor</Text>
      <TextInput style={styles.textInput} value={form.grOutdoor} onChangeText={(val) => updateForm('grOutdoor', val)} />

      <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>Pengukuran Bak Kontrol Indoor</Text>
      <TextInput style={styles.textInput} value={form.grIndoor} onChangeText={(val) => updateForm('grIndoor', val)} />

      <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>System Grounding</Text>
      <View style={{ marginTop: 4 }}>
        {renderSegmentedControl(form.systemGrounding, (val) => updateForm('systemGrounding', val), ['Single', 'Double (Ganda)'])}
      </View>

      <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>Catatan</Text>
      <TextInput style={styles.textInput} multiline value={form.grCatatan} onChangeText={(val) => updateForm('grCatatan', val)} />
    </View>
  );

  const renderRectifierCard = (num: 1 | 2 | 3) => {
    const key = `rect${num}` as const;
    const isExpanded = num === 1 ? rect1Expanded : num === 2 ? rect2Expanded : rect3Expanded;
    const setExpanded = num === 1 ? setRect1Expanded : num === 2 ? setRect2Expanded : setRect3Expanded;

    return (
      <View style={[styles.card, { marginTop: Spacing.md }]}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle}>Rectifier #{num}</Text>
          {isExpanded ?
            <ChevronUp color={Colors.textMuted} size={20} /> :
            <ChevronDown color={Colors.textMuted} size={20} />
          }
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Input AC (Phasa)</Text>
                <TextInput style={styles.textInput} value={form[`${key}InputAC`]} onChangeText={(val) => updateForm(`${key}InputAC`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Merk</Text>
                <TextInput style={styles.textInput} value={form[`${key}Merk`]} onChangeText={(val) => updateForm(`${key}Merk`, val)} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Tipe Rectifier</Text>
                <TextInput style={styles.textInput} value={form[`${key}Tipe`]} onChangeText={(val) => updateForm(`${key}Tipe`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Kapasitas Slot</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}KapasitasSlot`]} onChangeText={(val) => updateForm(`${key}KapasitasSlot`, val)} />
              </View>
            </View>

            <Text style={styles.inputLabel}>Serial Number</Text>
            <TextInput style={[styles.textInput, { marginBottom: Spacing.md }]} value={form[`${key}SN`]} onChangeText={(val) => updateForm(`${key}SN`, val)} />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Tipe Modul</Text>
                <TextInput style={styles.textInput} value={form[`${key}TipeModul`]} onChangeText={(val) => updateForm(`${key}TipeModul`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Modul Terpasang</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}ModulJml`]} onChangeText={(val) => updateForm(`${key}ModulJml`, val)} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Kap. Modul (A)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}KapasitasModul`]} onChangeText={(val) => updateForm(`${key}KapasitasModul`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Arus Beban (A)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}ArusBeban`]} onChangeText={(val) => updateForm(`${key}ArusBeban`, val)} />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Teg. Input (V)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}TegInput`]} onChangeText={(val) => updateForm(`${key}TegInput`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Boost Charge</Text>
                {renderSegmentedControl(form[`${key}Boost`], (val) => updateForm(`${key}Boost`, val), ['Disable', 'Enable'])}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Teg. Floating (V)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}TegFloating`]} onChangeText={(val) => updateForm(`${key}TegFloating`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Teg. Equalizing (V)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}TegEqualizing`]} onChangeText={(val) => updateForm(`${key}TegEqualizing`, val)} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>LVD Threshold (V)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}Lvd`]} onChangeText={(val) => updateForm(`${key}Lvd`, val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Utilisasi (%)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={form[`${key}Utilisasi`]} onChangeText={(val) => updateForm(`${key}Utilisasi`, val)} />
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={[styles.inputLabel, { marginTop: Spacing.xs, fontWeight: 'bold', color: Colors.primary }]}>Pengecekan Fisik Rectifier #{num}</Text>
            {renderComplexField(
              'Kebersihan Rack',
              form[`${key}KebersihanRackKet`],
              (val) => updateForm(`${key}KebersihanRackKet`, val),
              form[`${key}KebersihanRack`] || 'OK',
              (val) => updateForm(`${key}KebersihanRack`, val),
              ['OK', 'NOK']
            )}
            {renderComplexField(
              'Cek Baut Kabinet',
              form[`${key}CekBautKabinetKet`],
              (val) => updateForm(`${key}CekBautKabinetKet`, val),
              form[`${key}CekBautKabinet`] || 'OK',
              (val) => updateForm(`${key}CekBautKabinet`, val),
              ['OK', 'NOK']
            )}
          </View>
        )}
      </View>
    );
  };

  const renderRectifier = () => (
    <View>
      {renderRectifierCard(1)}
      {renderRectifierCard(2)}
      {renderRectifierCard(3)}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Embedded Sub-Header Tabs */}
      <Header
        title="Power System"
        subtitle="Sistem Kelistrikan"
        onBack={() => navigation.goBack()}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#3B82F6', '#1E40AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeTabGradient}
                  >
                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'tegangan' && renderTegangan()}
        {activeTab === 'rectifier' && renderRectifier()}
        {activeTab === 'acpdb' && renderAcpdb()}
        {activeTab === 'dcpdb' && renderDcpdb()}
        {activeTab === 'bebanRectifier' && renderBebanRectifier()}
        {activeTab === 'visual' && renderVisual()}
        {activeTab === 'arrester' && renderArrester()}
        {activeTab === 'ground' && renderGround()}

        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
          <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
        </TouchableOpacity>
      </ScrollView>
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
  inputGroup: { marginTop: 12 },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
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
    ...Typography.body,
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
  complexFieldContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  complexFieldHeader: {
    flexDirection: 'column',
    marginBottom: Spacing.md,
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
});
