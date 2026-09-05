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
  Lock,
  Plus,
  Check,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, showAlert, DropdownModalPicker } from '../../components/common';
import LinearGradient from 'react-native-linear-gradient';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabKey = 'tegangan' | 'rectifier' | 'visual' | 'arrester' | 'ground' | 'bebanRectifier';

export const PowerSystemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [activeTab, setActiveTab] = useState<TabKey>('tegangan');

  const [rect1Expanded, setRect1Expanded] = useState(true);
  const [rect2Expanded, setRect2Expanded] = useState(false);
  const [rect3Expanded, setRect3Expanded] = useState(false);

  const { formData, updateFormData } = useInspectionStore();

  const getInitialActiveRectifiers = (): number[] => {
    const ps = formData.powerSystem || {};
    if (Array.isArray(ps.activeRectifiers) && ps.activeRectifiers.length > 0) {
      return ps.activeRectifiers;
    }
    const rects = formData.rectifier?.rectifiers;
    if (Array.isArray(rects) && rects.length > 0) {
      const parsed = rects.map((r: any) => parseInt(r.id, 10)).filter((n: number) => !isNaN(n));
      if (parsed.length > 0) return parsed;
    }
    const list = [1];
    if (ps.rect2Merk || ps.rect2Tipe || ps.rect2SN || ps.rect2TipeModul || ps.rect2ModulJml || ps.rect2KapasitasSlot) {
      list.push(2);
    }
    if (ps.rect3Merk || ps.rect3Tipe || ps.rect3SN || ps.rect3TipeModul || ps.rect3ModulJml || ps.rect3KapasitasSlot) {
      list.push(3);
    }
    return list;
  };

  // Active rectifiers synced with store
  const [activeRectifiers, setActiveRectifiers] = useState<number[]>(getInitialActiveRectifiers);

  useEffect(() => {
    const ps = formData.powerSystem || {};
    if (Array.isArray(ps.activeRectifiers) && ps.activeRectifiers.length > 0) {
      const isDiff = ps.activeRectifiers.length !== activeRectifiers.length || ps.activeRectifiers.some((id: number, idx: number) => id !== activeRectifiers[idx]);
      if (isDiff) {
        setActiveRectifiers(ps.activeRectifiers);
        return;
      }
    }
    const rects = formData.rectifier?.rectifiers;
    if (Array.isArray(rects) && rects.length > 0) {
      const rectIds = rects.map((r: any) => parseInt(r.id, 10)).filter((n: number) => !isNaN(n)).sort((a: number, b: number) => a - b);
      if (rectIds.length > 0) {
        const isDiff = rectIds.length !== activeRectifiers.length || rectIds.some((id: number, idx: number) => id !== activeRectifiers[idx]);
        if (isDiff) {
          setActiveRectifiers(rectIds);
        }
      }
    }
  }, [formData.powerSystem?.activeRectifiers, formData.rectifier?.rectifiers]);

  // Expand states for Tegangan cards
  const [tegCatuanUtamaExpanded, setTegCatuanUtamaExpanded] = useState(true);
  const [tegTeganganAcExpanded, setTegTeganganAcExpanded] = useState(false);
  const [tegTotalArusExpanded, setTegTotalArusExpanded] = useState(false);
  const [tegStabilizerExpanded, setTegStabilizerExpanded] = useState(false);
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
    // Catuan Utama & Eksternal
    tipePln: '',
    idPelanggan: '', dayaListrik: '', phasaCatuan: '', bulanLalu: '', bulanIni: '', pengukuranKwh: '',
    gensetAda: '', merkGenset: '', snGenset: '', jenisGenset: '', tipeGenset: '', kapasitasGenset: '', phasaGenset: '',
    acpdbBeban: [{ mcb: '1', kapasitas: '', phasa: '', peruntukan: '', labelMcb: '', beban: '', arus: '', phasaRBeban: '', phasaRArus: '', phasaSBeban: '', phasaSArus: '', phasaTBeban: '', phasaTArus: '' }],
    dcpdbBeban: [{ mcb: '1', kapasitas: '', dcpdb: 'DCPDB 1', beban: '', arus: '', dcpdb1Beban: '', dcpdb1Arus: '', dcpdb2Beban: '', dcpdb2Arus: '', dcpdb3Beban: '', dcpdb3Arus: '', dcpdb4Beban: '', dcpdb4Arus: '', dcpdb5Beban: '', dcpdb5Arus: '' }],
    rectifierBeban: [{ mcb: '1', kapasitas: '', rectifier: 'Rectifier 1', beban: '', arus: '', namaNe: '', rect1KapMcb: '', rect1Arus: '', rect1NamaNe: '', rect2KapMcb: '', rect2Arus: '', rect2NamaNe: '', rect3KapMcb: '', rect3Arus: '', rect3NamaNe: '' }],

    // Tegangan
    teganganR_N: '', teganganS_N: '', teganganT_N: '',
    teganganR_T: '', teganganS_T: '', teganganR_S: '', teganganG_N: '',
    teganganR_N_TU: '220 ± 10%', teganganS_N_TU: '220 ± 10%', teganganT_N_TU: '220 ± 10%',
    teganganR_T_TU: '400 ± 10%', teganganS_T_TU: '400 ± 10%', teganganR_S_TU: '400 ± 10%', teganganG_N_TU: '< 1 V',
    arusPhasaR: '', arusPhasaS: '', arusPhasaT: '', arusPhasaN: '',
    frekuensi: '',
    stabilizerKapasitas: '', stabilizerJumlah: '',

    // Visual
    cekKabel: '', cekKabelKet: '',
    cekBautTerminal: '', cekBautTerminalKet: '',
    cekBautMCB: '', cekBautMCBKet: '',
    indikatorLamp: '', indikatorLampKet: '',
    cosGenset: '', cosGensetKet: '',

    // Arrester
    kwhBoxR: '', kwhBoxS: '', kwhBoxT: '', kwhBoxN: '',
    acpdbR: '', acpdbS: '', acpdbT: '', acpdbN: '',
    rectifierR: '', rectifierS: '', rectifierT: '', rectifierN: '',

    // Grounding
    grOutdoor: '', grIndoor: '', systemGrounding: '',
    grCatatan: '',

    // Rectifier Grid
    rect1InputAC: '', rect1Merk: '', rect1Tipe: '', rect1KapasitasSlot: '', rect1SN: '', rect1TipeModul: '', rect1ModulJml: '', rect1KapasitasModul: '', rect1ArusBeban: '', rect1TegInput: '', rect1TegFloating: '', rect1TegEqualizing: '', rect1Lvd: '', rect1Boost: '', rect1Utilisasi: '',
    rect1KebersihanRack: '', rect1KebersihanRackKet: '', rect1CekBautKabinet: '', rect1CekBautKabinetKet: '',
    rect2InputAC: '', rect2Merk: '', rect2Tipe: '', rect2KapasitasSlot: '', rect2SN: '', rect2TipeModul: '', rect2ModulJml: '', rect2KapasitasModul: '', rect2ArusBeban: '', rect2TegInput: '', rect2TegFloating: '', rect2TegEqualizing: '', rect2Lvd: '', rect2Boost: '', rect2Utilisasi: '',
    rect2KebersihanRack: '', rect2KebersihanRackKet: '', rect2CekBautKabinet: '', rect2CekBautKabinetKet: '',
    rect3InputAC: '', rect3Merk: '', rect3Tipe: '', rect3KapasitasSlot: '', rect3SN: '', rect3TipeModul: '', rect3ModulJml: '', rect3KapasitasModul: '', rect3ArusBeban: '', rect3TegInput: '', rect3TegFloating: '', rect3TegEqualizing: '', rect3Lvd: '', rect3Boost: '', rect3Utilisasi: '',
    rect3KebersihanRack: '', rect3KebersihanRackKet: '', rect3CekBautKabinet: '', rect3CekBautKabinetKet: '',
    activeRectifiers: [1],
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
    const normalized = list.map((item: any) => {
      const phasa = item.phasa || '';
      const labelMcb = item.labelMcb || phasa;
      const peruntukan = item.peruntukan || '';
      const beban = item.beban ?? (phasa === 'S' ? (item.phasaSBeban || item.sBeban) : phasa === 'T' ? (item.phasaTBeban || item.tBeban) : (item.phasaRBeban || item.rBeban)) ?? '';
      const arus = item.arus ?? (phasa === 'S' ? (item.phasaSArus || item.sArus) : phasa === 'T' ? (item.phasaTArus || item.tArus) : (item.phasaRArus || item.rArus)) ?? '';
      return {
        ...item,
        phasa,
        labelMcb,
        peruntukan,
        beban,
        arus,
        rBeban: phasa === 'R' ? beban : '',
        rArus: phasa === 'R' ? arus : '',
        sBeban: phasa === 'S' ? beban : '',
        sArus: phasa === 'S' ? arus : '',
        tBeban: phasa === 'T' ? beban : '',
        tArus: phasa === 'T' ? arus : '',
        phasaRBeban: phasa === 'R' ? beban : '',
        phasaRArus: phasa === 'R' ? arus : '',
        phasaSBeban: phasa === 'S' ? beban : '',
        phasaSArus: phasa === 'S' ? arus : '',
        phasaTBeban: phasa === 'T' ? beban : '',
        phasaTArus: phasa === 'T' ? arus : '',
      };
    });
    updateFormData('powerSystem', { acpdbBeban: normalized, bebanAcpdb: normalized });
  };

  const addAcpdbRow = () => {
    const list = form.acpdbBeban || form.bebanAcpdb || [];
    const nextMcb = (list.length > 0 ? Math.max(...list.map((r: any) => parseInt(r.mcb) || 0)) + 1 : 1).toString();
    const newList = [...list, { mcb: nextMcb, kapasitas: '', phasa: '', peruntukan: '', labelMcb: '', beban: '', arus: '', phasaRBeban: '', phasaRArus: '', phasaSBeban: '', phasaSArus: '', phasaTBeban: '', phasaTArus: '' }];
    syncAcpdbList(newList);
    showAlert({
      type: 'success',
      title: 'Berhasil Ditambahkan',
      message: `Baris MCB #${nextMcb} ACPDB berhasil ditambahkan.`,
    });
  };

  const updateAcpdbRow = (index: number, fieldOrUpdates: string | Record<string, string>, value?: string) => {
    const list = [...(form.acpdbBeban || form.bebanAcpdb || [])];
    if (typeof fieldOrUpdates === 'string') {
      list[index] = { ...list[index], [fieldOrUpdates]: value || '' };
    } else {
      list[index] = { ...list[index], ...fieldOrUpdates };
    }
    syncAcpdbList(list);
  };

  const removeAcpdbRow = (index: number) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus MCB ACPDB',
      message: `Apakah Anda yakin ingin menghapus MCB #${index + 1}?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const list = [...(form.acpdbBeban || form.bebanAcpdb || [])];
            list.splice(index, 1);
            const updatedList = list.map((item: any, i: number) => ({ ...item, mcb: (i + 1).toString() }));
            syncAcpdbList(updatedList);
          }
        }
      ]
    });
  };

  // DCPDB Helpers
  const syncDcpdbList = (list: any[]) => {
    const normalized = list.map((item: any) => {
      let dcpdb = item.dcpdb;
      if (!dcpdb) {
        if (item.dcpdb5Beban || item.dcpdb5Arus || item.d5Beban || item.d5Arus) dcpdb = 'DCPDB 5';
        else if (item.dcpdb4Beban || item.dcpdb4Arus || item.d4Beban || item.d4Arus) dcpdb = 'DCPDB 4';
        else if (item.dcpdb3Beban || item.dcpdb3Arus || item.d3Beban || item.d3Arus) dcpdb = 'DCPDB 3';
        else if (item.dcpdb2Beban || item.dcpdb2Arus || item.d2Beban || item.d2Arus) dcpdb = 'DCPDB 2';
        else dcpdb = 'DCPDB 1';
      }

      const numMatch = (dcpdb || '1').match(/\d+/);
      const num = numMatch ? numMatch[0] : '1';

      const beban = item.beban ?? item[`dcpdb${num}Beban`] ?? item[`d${num}Beban`] ?? '';
      const arus = item.arus ?? item[`dcpdb${num}Arus`] ?? item[`d${num}Arus`] ?? '';
      const kapasitas = item.kapasitas ?? '';

      return {
        ...item,
        kapasitas,
        dcpdb,
        beban,
        arus,
        dcpdb1Beban: num === '1' ? beban : '',
        dcpdb1Arus: num === '1' ? arus : '',
        dcpdb2Beban: num === '2' ? beban : '',
        dcpdb2Arus: num === '2' ? arus : '',
        dcpdb3Beban: num === '3' ? beban : '',
        dcpdb3Arus: num === '3' ? arus : '',
        dcpdb4Beban: num === '4' ? beban : '',
        dcpdb4Arus: num === '4' ? arus : '',
        dcpdb5Beban: num === '5' ? beban : '',
        dcpdb5Arus: num === '5' ? arus : '',
        d1Beban: num === '1' ? beban : '',
        d1Arus: num === '1' ? arus : '',
        d2Beban: num === '2' ? beban : '',
        d2Arus: num === '2' ? arus : '',
        d3Beban: num === '3' ? beban : '',
        d3Arus: num === '3' ? arus : '',
        d4Beban: num === '4' ? beban : '',
        d4Arus: num === '4' ? arus : '',
        d5Beban: num === '5' ? beban : '',
        d5Arus: num === '5' ? arus : '',
      };
    });
    updateFormData('powerSystem', { dcpdbBeban: normalized, bebanDcpdb: normalized });
  };

  const addDcpdbRow = () => {
    const list = form.dcpdbBeban || form.bebanDcpdb || [];
    const nextMcb = (list.length > 0 ? Math.max(...list.map((r: any) => parseInt(r.mcb) || 0)) + 1 : 1).toString();
    const newList = [
      ...list,
      {
        mcb: nextMcb,
        kapasitas: '',
        dcpdb: 'DCPDB 1',
        beban: '',
        arus: '',
        dcpdb1Beban: '', dcpdb1Arus: '',
        dcpdb2Beban: '', dcpdb2Arus: '',
        dcpdb3Beban: '', dcpdb3Arus: '',
        dcpdb4Beban: '', dcpdb4Arus: '',
        dcpdb5Beban: '', dcpdb5Arus: '',
      }
    ];
    syncDcpdbList(newList);
    showAlert({
      type: 'success',
      title: 'Berhasil Ditambahkan',
      message: `Baris MCB #${nextMcb} DCPDB berhasil ditambahkan.`,
    });
  };

  const updateDcpdbRow = (index: number, fieldOrUpdates: string | Record<string, string>, value?: string) => {
    const list = [...(form.dcpdbBeban || form.bebanDcpdb || [])];
    if (typeof fieldOrUpdates === 'string') {
      list[index] = { ...list[index], [fieldOrUpdates]: value || '' };
    } else {
      list[index] = { ...list[index], ...fieldOrUpdates };
    }
    syncDcpdbList(list);
  };

  const removeDcpdbRow = (index: number) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Baris DCPDB',
      message: `Apakah Anda yakin ingin menghapus MCB #${index + 1}?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const list = [...(form.dcpdbBeban || form.bebanDcpdb || [])];
            list.splice(index, 1);
            const updatedList = list.map((item: any, i: number) => ({ ...item, mcb: (i + 1).toString() }));
            syncDcpdbList(updatedList);
          }
        }
      ]
    });
  };

  // Rectifier Beban Helpers
  const syncRectifierBebanList = (list: any[]) => {
    const normalized = list.map((item: any) => {
      let rectifier = item.rectifier;
      if (!rectifier) {
        if (item.rect3KapMcb || item.rect3Arus || item.rect3NamaNe || item.r3Kap || item.r3Arus || item.r3Nama) rectifier = 'Rectifier 3';
        else if (item.rect2KapMcb || item.rect2Arus || item.rect2NamaNe || item.r2Kap || item.r2Arus || item.r2Nama) rectifier = 'Rectifier 2';
        else rectifier = 'Rectifier 1';
      }

      const numMatch = (rectifier || '1').match(/\d+/);
      const num = numMatch ? numMatch[0] : '1';

      const kapasitas = item.kapasitas ?? item[`rect${num}KapMcb`] ?? item[`r${num}Kap`] ?? '';
      const arus = item.arus ?? item[`rect${num}Arus`] ?? item[`r${num}Arus`] ?? '';
      const namaNe = item.namaNe ?? item[`rect${num}NamaNe`] ?? item[`r${num}Nama`] ?? '';
      const beban = item.beban ?? '';

      return {
        ...item,
        kapasitas,
        rectifier,
        beban,
        arus,
        namaNe,
        rect1KapMcb: num === '1' ? kapasitas : '',
        rect1Arus: num === '1' ? arus : '',
        rect1NamaNe: num === '1' ? namaNe : '',
        rect2KapMcb: num === '2' ? kapasitas : '',
        rect2Arus: num === '2' ? arus : '',
        rect2NamaNe: num === '2' ? namaNe : '',
        rect3KapMcb: num === '3' ? kapasitas : '',
        rect3Arus: num === '3' ? arus : '',
        rect3NamaNe: num === '3' ? namaNe : '',
        r1Kap: num === '1' ? kapasitas : '',
        r1Arus: num === '1' ? arus : '',
        r1Nama: num === '1' ? namaNe : '',
        r2Kap: num === '2' ? kapasitas : '',
        r2Arus: num === '2' ? arus : '',
        r2Nama: num === '2' ? namaNe : '',
        r3Kap: num === '3' ? kapasitas : '',
        r3Arus: num === '3' ? arus : '',
        r3Nama: num === '3' ? namaNe : '',
      };
    });
    updateFormData('powerSystem', { rectifierBeban: normalized, bebanRectifier: normalized });
  };

  const addRectifierBebanRow = () => {
    const list = form.rectifierBeban || form.bebanRectifier || [];
    const nextMcb = (list.length > 0 ? Math.max(...list.map((r: any) => parseInt(r.mcb) || 0)) + 1 : 1).toString();
    const newList = [
      ...list,
      {
        mcb: nextMcb,
        kapasitas: '',
        rectifier: 'Rectifier 1',
        beban: '',
        arus: '',
        namaNe: '',
        rect1KapMcb: '', rect1Arus: '', rect1NamaNe: '',
        rect2KapMcb: '', rect2Arus: '', rect2NamaNe: '',
        rect3KapMcb: '', rect3Arus: '', rect3NamaNe: '',
      }
    ];
    syncRectifierBebanList(newList);
    showAlert({
      type: 'success',
      title: 'Berhasil Ditambahkan',
      message: `Baris MCB #${nextMcb} Beban Rectifier berhasil ditambahkan.`,
    });
  };

  const updateRectifierBebanRow = (index: number, fieldOrUpdates: string | Record<string, string>, value?: string) => {
    const list = [...(form.rectifierBeban || form.bebanRectifier || [])];
    if (typeof fieldOrUpdates === 'string') {
      list[index] = { ...list[index], [fieldOrUpdates]: value || '' };
    } else {
      list[index] = { ...list[index], ...fieldOrUpdates };
    }
    syncRectifierBebanList(list);
  };

  const removeRectifierBebanRow = (index: number) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Baris Beban Rectifier',
      message: `Apakah Anda yakin ingin menghapus MCB #${index + 1}?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const list = [...(form.rectifierBeban || form.bebanRectifier || [])];
            list.splice(index, 1);
            const updatedList = list.map((item: any, i: number) => ({ ...item, mcb: (i + 1).toString() }));
            syncRectifierBebanList(updatedList);
          }
        }
      ]
    });
  };

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'tegangan', label: 'PLN', icon: Zap },
    { key: 'rectifier', label: 'Rectifier', icon: PlugZap },
    { key: 'visual', label: 'Visual', icon: Search },
    { key: 'arrester', label: 'Arrester', icon: Shield },
    { key: 'ground', label: 'Ground', icon: ArrowDownToLine },
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
            onPress={() => onValueChange(value === opt ? '' : opt)}
          >
            <Text style={[styles.segmentText, value === opt && styles.segmentTextActive]}>
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
    title?: string
  ) => {
    const displayText = value ? (prefix ? `${prefix}${value}` : value) : 'Pilih';
    const modalTitle =
      title ||
      (key.includes('dcpdb')
        ? 'Pilih DCPDB'
        : key.includes('rect')
          ? 'Pilih Rectifier'
          : key.includes('phasa')
            ? 'Pilih Phasa'
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

  const renderComplexField = (
    label: string,
    value: string,
    onChangeText: (val: string) => void,
    dropdownKey: string,
    selectValue: string,
    onSelectChange: (val: string) => void,
    options: string[] = ['OK', 'NOK', 'N/A'],
    placeholder: string = 'Keterangan...'
  ) => {
    const isOpen = openDropdownKey === dropdownKey;
    return (
      <View style={[styles.complexFieldContainer, { zIndex: isOpen ? 1000 : 1 }]}>
        <View style={[styles.row, { alignItems: 'center', marginBottom: Spacing.sm, zIndex: isOpen ? 1000 : 1 }]}>
          <Text style={[styles.inputLabel, { flex: 1, marginBottom: 0 }]}>{label}</Text>
          <View style={{ width: 130, zIndex: isOpen ? 1000 : 1 }}>
            {renderDropdownSelect(dropdownKey, selectValue || '', onSelectChange, options)}
          </View>
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
            <View style={[styles.row, { zIndex: openDropdownKey === 'tipePln' ? 1000 : 1 }]}>
              <View style={[styles.col, { zIndex: openDropdownKey === 'tipePln' ? 1000 : 1 }]}>
                <Text style={styles.inputLabel}>PLN</Text>
                {renderDropdownSelect(
                  'tipePln',
                  form.tipePln || '',
                  (val) => updateForm('tipePln', val),
                  ['PS Gi', 'Distribusi', 'Lainnya']
                )}
              </View>
              <View style={styles.col} />
            </View>

            {/* Baris 1: ID Pelanggan & Phasa */}
            <View style={[styles.row, { zIndex: openDropdownKey === 'phasaCatuan' ? 1000 : 1 }]}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>ID Pelanggan</Text>
                <TextInput style={styles.textInput} value={form.idPelanggan} onChangeText={(val) => updateForm('idPelanggan', val)} />
              </View>
              <View style={[styles.col, { zIndex: openDropdownKey === 'phasaCatuan' ? 1000 : 1 }]}>
                <Text style={styles.inputLabel}>Phasa</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    {renderDropdownSelect(
                      'phasaCatuan',
                      (form.phasaCatuan || '').replace(/phasa\s*/gi, '').trim(),
                      (val) => updateForm('phasaCatuan', val),
                      ['1', '3']
                    )}
                  </View>
                  <View style={styles.measurementUnit} />
                </View>
              </View>
            </View>

            {/* Baris 2: Bulan Ini & Daya Listrik */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Bulan Ini</Text>
                <TextInput style={styles.textInput} value={form.bulanIni} onChangeText={(val) => updateForm('bulanIni', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Daya Listrik</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form.dayaListrik} onChangeText={(val) => updateForm('dayaListrik', val)} />
                  <Text style={styles.measurementUnit}>kVA</Text>
                </View>
              </View>
            </View>

            {/* Baris 3: Bulan Lalu & Pengukuran KWH */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Bulan Lalu</Text>
                <TextInput style={styles.textInput} value={form.bulanLalu} onChangeText={(val) => updateForm('bulanLalu', val)} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Pengukuran KWH</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form.pengukuranKwh} onChangeText={(val) => updateForm('pengukuranKwh', val)} />
                  <Text style={styles.measurementUnit}>kWh</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {renderTeganganAcCard()}
      {renderTotalArusCard()}
      {renderStabilizerCard()}
    </View>
  );

  const renderTeganganAcCard = () => (
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
          {/* Helper component for Tegangan with Tolak Ukur (Locked/View-Only) */}
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
        {tegTotalArusExpanded ?
          <ChevronUp color={Colors.textMuted} size={20} /> :
          <ChevronDown color={Colors.textMuted} size={20} />
        }
      </TouchableOpacity>

      {tegTotalArusExpanded && (
        <View style={styles.cardBody}>
          <View style={[styles.row, { zIndex: openDropdownKey === 'phasaArus' ? 1000 : 1 }]}>
            <View style={{ width: 110, zIndex: openDropdownKey === 'phasaArus' ? 1000 : 1 }}>
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

  const renderStabilizerCard = () => (
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
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Kapasitas</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  keyboardType="numeric"
                  value={form.stabilizerKapasitas}
                  onChangeText={(val) => updateForm('stabilizerKapasitas', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text style={styles.measurementUnit}>kVA</Text>
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
                  onChangeText={(val) => updateForm('stabilizerJumlah', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text style={styles.measurementUnit}>Unit</Text>
            </View>
          </View>
        </View>
      )}
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
        <View
          key={row.mcb || i}
          style={[
            styles.card,
            {
              marginTop: Spacing.md,
              borderWidth: 1,
              borderColor: Colors.border,
              zIndex: openDropdownKey?.startsWith(`rectBeban_${i}_`) ? 1000 : 1,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>MCB #{i + 1}</Text>
            {i > 0 && (
              <TouchableOpacity onPress={() => removeRectifierBebanRow(i)} style={{ padding: 4 }}>
                <Trash2 color={Colors.danger} size={20} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

          <View style={[styles.row, { alignItems: 'flex-start', zIndex: openDropdownKey === `rectBeban_${i}_rectifier` ? 2000 : 1 }]}>
            <View style={{ flex: 1.4, marginRight: Spacing.sm }}>
              <Text style={styles.inputLabel}>Kapasitas</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  keyboardType="numeric"
                  value={row.kapasitas}
                  onChangeText={(val) => updateRectifierBebanRow(i, 'kapasitas', val)}
                />
                <Text style={styles.measurementUnit}>A</Text>
              </View>
            </View>
            <View style={{ width: 125, zIndex: openDropdownKey === `rectBeban_${i}_rectifier` ? 3000 : 1 }}>
              <Text style={styles.inputLabel}>Rectifier</Text>
              {renderDropdownSelect(
                `rectBeban_${i}_rectifier`,
                row.rectifier || 'Rectifier 1',
                (val) => updateRectifierBebanRow(i, 'rectifier', val),
                ['Rectifier 1', 'Rectifier 2', 'Rectifier 3']
              )}
            </View>
          </View>

          <View style={[styles.divider, { marginVertical: Spacing.sm }]} />

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Beban</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  value={row.beban ?? ''}
                  onChangeText={(val) => updateRectifierBebanRow(i, 'beban', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Arus</Text>
            <View style={styles.measurementInputWrapper}>
              <View style={styles.measurementInputContainer}>
                <TextInput
                  style={styles.measurementInput}
                  value={row.arus ?? ''}
                  onChangeText={(val) => updateRectifierBebanRow(i, 'arus', val)}
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={{ marginTop: Spacing.sm }}>
            <Text style={styles.inputLabel}>Nama NE</Text>
            <TextInput
              style={styles.textInput}
              value={row.namaNe ?? ''}
              onChangeText={(val) => updateRectifierBebanRow(i, 'namaNe', val)}
              placeholder=""
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderVisualRow = (
    label: string,
    key: string,
    ketKey: string,
    options: string[] = ['OK', 'NOK', 'N/A']
  ) => {
    const isOpen = openDropdownKey === key;
    return (
      <View style={[styles.row, { marginBottom: Spacing.sm, zIndex: isOpen ? 1000 : 1 }]}>
        <View style={{ width: 135, zIndex: isOpen ? 1000 : 1 }}>
          <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]} numberOfLines={1}>
            {label}
          </Text>
          {renderDropdownSelect(
            key,
            form[key as keyof typeof form] || '',
            (val) => updateForm(key, val),
            options
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TextInput
            style={styles.textInput}
            value={form[ketKey as keyof typeof form]}
            onChangeText={(val) => updateForm(ketKey, val)}
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>
    );
  };

  const renderVisual = () => {
    const isAnyOpen = ['cekKabel', 'cekBautTerminal', 'cekBautMCB', 'indikatorLamp', 'cosGenset'].includes(openDropdownKey || '');

    return (
      <View style={[styles.card, { zIndex: isAnyOpen ? 1000 : 1 }]}>
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Visual Check MDP</Text>
        <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

        {renderVisualRow('Cek Kabel', 'cekKabel', 'cekKabelKet')}
        {renderVisualRow('Cek Baut Terminal', 'cekBautTerminal', 'cekBautTerminalKet')}
        {renderVisualRow('Cek Baut MCB/MCCB', 'cekBautMCB', 'cekBautMCBKet')}
        {renderVisualRow('Indikator Lamp R,S,T', 'indikatorLamp', 'indikatorLampKet')}
        {renderVisualRow('COS Genset', 'cosGenset', 'cosGensetKet')}
      </View>
    );
  };

  const renderArresterPhase = (phasa: string, keySuffix: 'R' | 'S' | 'T' | 'N') => {
    const isAnyOpen = openDropdownKey === `kwhBox${keySuffix}` || openDropdownKey === `acpdb${keySuffix}` || openDropdownKey === `rectifier${keySuffix}`;

    return (
      <View style={{ marginBottom: Spacing.md, zIndex: isAnyOpen ? 1000 : 1 }}>
        <Text style={[styles.inputLabel, { fontWeight: 'bold', color: '#FFFFFF', marginBottom: Spacing.sm }]}>Phasa {phasa}</Text>

        <View style={[styles.row, { marginBottom: Spacing.sm, zIndex: isAnyOpen ? 1000 : 1 }]}>
          <View style={[styles.col, { zIndex: openDropdownKey === `kwhBox${keySuffix}` ? 1000 : 1 }]}>
            <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>KWH Box</Text>
            {renderDropdownSelect(
              `kwhBox${keySuffix}`,
              form[`kwhBox${keySuffix}` as keyof typeof form] || '',
              (val) => updateForm(`kwhBox${keySuffix}` as string, val),
              ['OK', 'NOK', 'N/A']
            )}
          </View>

          <View style={[styles.col, { zIndex: openDropdownKey === `acpdb${keySuffix}` ? 1000 : 1 }]}>
            <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>ACPDB</Text>
            {renderDropdownSelect(
              `acpdb${keySuffix}`,
              form[`acpdb${keySuffix}` as keyof typeof form] || '',
              (val) => updateForm(`acpdb${keySuffix}` as string, val),
              ['OK', 'NOK', 'N/A']
            )}
          </View>

          <View style={[styles.col, { zIndex: openDropdownKey === `rectifier${keySuffix}` ? 1000 : 1 }]}>
            <Text style={[styles.inputLabel, { fontSize: 11, marginBottom: 4 }]}>Rectifier</Text>
            {renderDropdownSelect(
              `rectifier${keySuffix}`,
              form[`rectifier${keySuffix}` as keyof typeof form] || '',
              (val) => updateForm(`rectifier${keySuffix}` as string, val),
              ['OK', 'NOK', 'N/A']
            )}
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          <TextInput
            style={styles.textInput}
            value={form[`arresterKet${keySuffix}` as keyof typeof form]}
            onChangeText={(val) => updateForm(`arresterKet${keySuffix}` as string, val)}
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>
    );
  };

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
    <View style={[styles.card, { zIndex: openDropdownKey === 'systemGrounding' ? 1000 : 1 }]}>
      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Grounding System</Text>
      <View style={[styles.divider, { marginTop: 0, marginBottom: Spacing.md }]} />

      <Text style={styles.inputLabel}>System Grounding</Text>
      <View style={{ marginBottom: Spacing.md, zIndex: openDropdownKey === 'systemGrounding' ? 1000 : 1 }}>
        {renderDropdownSelect(
          'systemGrounding',
          form.systemGrounding || '',
          (val) => updateForm('systemGrounding', val),
          ['Single', 'Double (Ganda)']
        )}
      </View>

      <Text style={[styles.inputLabel, { marginTop: Spacing.sm }]}>Catatan</Text>
      <TextInput
        style={[styles.textInput, { height: 80, minHeight: 80, textAlignVertical: 'top' }]}
        multiline
        value={form.grCatatan}
        onChangeText={(val) => updateForm('grCatatan', val)}
        placeholder="Tambahkan catatan..."
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );

  const addRectifier = () => {
    if (activeRectifiers.length >= 3) {
      showAlert({
        type: 'warning',
        title: 'Maksimal Rectifier',
        message: 'Maksimal 3 Rectifier pada sistem.',
        buttons: [{ text: 'OK' }]
      });
      return;
    }
    const nextNum = [1, 2, 3].find(n => !activeRectifiers.includes(n)) || (activeRectifiers.length + 1);
    const updated = [...activeRectifiers, nextNum].sort((a, b) => a - b);
    setActiveRectifiers(updated);
    updateFormData('powerSystem', { activeRectifiers: updated });
    if (nextNum === 2) setRect2Expanded(true);
    if (nextNum === 3) setRect3Expanded(true);

    const currentRectifiers = formData.rectifier?.rectifiers || [
      {
        id: '1',
        isExpanded: true,
        merk: form.rect1Merk || '',
        tipe: form.rect1Tipe || '',
        sn: form.rect1SN || '',
        tipeModul: form.rect1TipeModul || '',
        jmlModul: form.rect1ModulJml || '',
        jmlSlot: form.rect1KapasitasSlot || '',
        modules: [],
        mcbs: [
          {
            id: '1',
            merk: '',
            kapasitas: '',
            peruntukan: ''
          }
        ],
        arusBeban: form.rect1ArusBeban || '',
        tegInput: form.rect1TegInput || '',
        tegFloating: form.rect1TegFloating || '',
      }
    ];

    const exists = currentRectifiers.some((r: any) => r.id === nextNum.toString());
    if (!exists) {
      const newRects = [
        ...currentRectifiers,
        {
          id: nextNum.toString(),
          isExpanded: true,
          merk: form[`rect${nextNum}Merk`] || '',
          tipe: form[`rect${nextNum}Tipe`] || '',
          sn: form[`rect${nextNum}SN`] || '',
          tipeModul: form[`rect${nextNum}TipeModul`] || '',
          jmlModul: form[`rect${nextNum}ModulJml`] || '',
          jmlSlot: form[`rect${nextNum}KapasitasSlot`] || '',
          modules: [],
          mcbs: [
            {
              id: '1',
              merk: '',
              kapasitas: '',
              peruntukan: ''
            }
          ],
          arusBeban: form[`rect${nextNum}ArusBeban`] || '',
          tegInput: form[`rect${nextNum}TegInput`] || '',
          tegFloating: form[`rect${nextNum}TegFloating`] || '',
        }
      ];
      updateFormData('rectifier', { rectifiers: newRects });
    }

    showAlert({
      type: 'success',
      title: 'Berhasil Ditambahkan',
      message: `Rectifier #${nextNum} berhasil ditambahkan.`,
    });
  };

  const removeRectifier = (num: number) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Rectifier',
      message: `Apakah Anda yakin ingin menghapus Rectifier #${num}?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const updated = activeRectifiers.filter(n => n !== num);
            setActiveRectifiers(updated);
            const key = `rect${num}`;
            const clearedFields: Record<string, any> = {
              [`${key}InputAC`]: '',
              [`${key}Merk`]: '',
              [`${key}Tipe`]: '',
              [`${key}KapasitasSlot`]: '',
              [`${key}SN`]: '',
              [`${key}TipeModul`]: '',
              [`${key}ModulJml`]: '',
              [`${key}KapasitasModul`]: '',
              [`${key}ArusBeban`]: '',
              [`${key}TegInput`]: '',
              [`${key}TegFloating`]: '',
              [`${key}TegEqualizing`]: '',
              [`${key}Lvd`]: '',
              [`${key}Boost`]: 'Disable',
              [`${key}Utilisasi`]: '',
              [`${key}KebersihanRack`]: 'OK',
              [`${key}KebersihanRackKet`]: '',
              [`${key}CekBautKabinet`]: 'OK',
              [`${key}CekBautKabinetKet`]: '',
              activeRectifiers: updated,
            };
            updateFormData('powerSystem', clearedFields);

            if (formData.rectifier?.rectifiers) {
              const newRects = formData.rectifier.rectifiers.filter((r: any) => r.id !== num.toString());
              updateFormData('rectifier', { rectifiers: newRects });
            }
          }
        }
      ]
    });
  };

  const renderRectifierCard = (num: 1 | 2 | 3) => {
    const key = `rect${num}` as const;
    const isExpanded = num === 1 ? rect1Expanded : num === 2 ? rect2Expanded : rect3Expanded;
    const setExpanded = num === 1 ? setRect1Expanded : num === 2 ? setRect2Expanded : setRect3Expanded;

    return (
      <View style={[styles.card, { marginTop: Spacing.md }]}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            onPress={() => setExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle}>Rectifier #{num}</Text>
            {isExpanded ?
              <ChevronUp color={Colors.textMuted} size={20} /> :
              <ChevronDown color={Colors.textMuted} size={20} />
            }
          </TouchableOpacity>
          {num > 1 && (
            <TouchableOpacity
              onPress={() => removeRectifier(num)}
              style={{ padding: 6, marginLeft: Spacing.sm }}
            >
              <Trash2 color={Colors.danger} size={18} />
            </TouchableOpacity>
          )}
        </View>

        {isExpanded && (
          <View style={styles.cardBody}>
            <View style={[styles.row, { zIndex: openDropdownKey === `${key}InputAC` ? 1000 : 1 }]}>
              <View style={[styles.col, { zIndex: openDropdownKey === `${key}InputAC` ? 1000 : 1 }]}>
                <Text style={styles.inputLabel}>Input AC (Phasa)</Text>
                {renderDropdownSelect(
                  `${key}InputAC`,
                  (form[`${key}InputAC`] || '1').replace(/phasa\s*/gi, '').trim() || '1',
                  (val) => updateForm(`${key}InputAC`, val),
                  ['1', '3']
                )}
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
                <Text style={styles.inputLabel}>Kapasitas Modul</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}KapasitasModul`]} onChangeText={(val) => updateForm(`${key}KapasitasModul`, val)} />
                  <Text style={styles.measurementUnit}>A</Text>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Arus Beban</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}ArusBeban`]} onChangeText={(val) => updateForm(`${key}ArusBeban`, val)} />
                  <Text style={styles.measurementUnit}>A</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={[styles.row, { zIndex: openDropdownKey === `${key}Boost` ? 1000 : 1 }]}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Tegangan Input</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}TegInput`]} onChangeText={(val) => updateForm(`${key}TegInput`, val)} />
                  <Text style={styles.measurementUnit}>V</Text>
                </View>
              </View>
              <View style={[styles.col, { zIndex: openDropdownKey === `${key}Boost` ? 1000 : 1 }]}>
                <Text style={styles.inputLabel}>Boost Charge</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    {renderDropdownSelect(
                      `${key}Boost`,
                      form[`${key}Boost` as keyof typeof form] || '',
                      (val) => updateForm(`${key}Boost`, val),
                      ['Disable', 'Enable']
                    )}
                  </View>
                  <View style={styles.measurementUnit} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Tegangan Floating</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}TegFloating`]} onChangeText={(val) => updateForm(`${key}TegFloating`, val)} />
                  <Text style={styles.measurementUnit}>V</Text>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Tegangan Equalizing</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}TegEqualizing`]} onChangeText={(val) => updateForm(`${key}TegEqualizing`, val)} />
                  <Text style={styles.measurementUnit}>V</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>LVD Threshold</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}Lvd`]} onChangeText={(val) => updateForm(`${key}Lvd`, val)} />
                  <Text style={styles.measurementUnit}>V</Text>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Utilisasi</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} keyboardType="numeric" value={form[`${key}Utilisasi`]} onChangeText={(val) => updateForm(`${key}Utilisasi`, val)} />
                  <Text style={styles.measurementUnit}>%</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={[styles.inputLabel, { marginTop: Spacing.xs, marginBottom: Spacing.sm, fontWeight: 'bold', color: Colors.primary }]}>Pengecekan Fisik Rectifier #{num}</Text>
            {renderVisualRow(
              'Kebersihan Rack',
              `${key}KebersihanRack`,
              `${key}KebersihanRackKet`,
              ['OK', 'NOK']
            )}
            {renderVisualRow(
              'Cek Baut Kabinet',
              `${key}CekBautKabinet`,
              `${key}CekBautKabinetKet`,
              ['OK', 'NOK']
            )}
          </View>
        )}
      </View>
    );
  };

  const renderRectifier = () => (
    <View>
      {activeRectifiers.map((num) => renderRectifierCard(num as 1 | 2 | 3))}

      {activeRectifiers.length < 3 && (
        <TouchableOpacity
          style={styles.addRectifierButton}
          onPress={addRectifier}
          activeOpacity={0.7}
        >
          <Plus size={18} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.addRectifierText}>Tambah Rectifier</Text>
        </TouchableOpacity>
      )}
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
        {activeTab === 'bebanRectifier' && renderBebanRectifier()}
        {activeTab === 'visual' && renderVisual()}
        {activeTab === 'arrester' && renderArrester()}
        {activeTab === 'ground' && renderGround()}

        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
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
  addRectifierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addRectifierText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: 'bold',
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
  selectBoxActive: {
    borderColor: '#3B82F6',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
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
    ...Typography.body,
    color: Colors.text,
  },
  selectTextPlaceholder: {
    color: Colors.textMuted,
  },
});
