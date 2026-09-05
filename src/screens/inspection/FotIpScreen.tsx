/**
 * FOT IP Screen
 * Tampilan deskripsi FOT IP dengan 3 card:
 * 1. Lower Fan Tray (Peralatan, Prosedur 1.1-1.2, Diagram Fan Tray, Prosedur 1.3-1.10)
 * 2. Rear Exhaust Screen
 * 3. Chassis Air Filter
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown, Maximize2 } from 'lucide-react-native';

import { Colors, Typography, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, DropdownModalPicker, ImageZoomModal } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProcedureItem {
  id: string;
  code: string;
  label: string;
}

const EQUIPMENT_ITEMS = [
  'a. ESD-Preventive Wrist Strap (Gelang Statis)',
  'b. Peralatan Toolset',
  'c. Fan tray (Router product number CRS-8-LCC-FAN-TR)',
  'd. Vacuum Cleaner',
  'e. Laptop, USB Console',
];

const PROCEDURES_PART_1: ProcedureItem[] = [
  {
    id: '1.1',
    code: '1.1',
    label: 'Melakukan pembersihan di area sekitar perangkat Router',
  },
  {
    id: '1.2',
    code: '1.2',
    label: 'Memastikan bahwa ESD-Preventive Wrist Strap digunakan pada saat melakukan kegiatan preventive',
  },
];

const PROCEDURES_PART_2: ProcedureItem[] = [
  {
    id: '1.3',
    code: '1.3',
    label:
      'Melakukan komunikasi terminal dengan perangkat Router dengan laptop untuk mengcapture running config, history log sebagai back-up data saat ini',
  },
  {
    id: '1.4',
    code: '1.4',
    label: 'Membuka pintu chassis dan melepas cover perangkat',
  },
  {
    id: '1.5',
    code: '1.5',
    label: 'Menggunakan kedua tangan untuk menarik tray kipas[8.69kg] pada jalurnya',
  },
  {
    id: '1.6',
    code: '1.6',
    label:
      'Membersihan kipas dengan menggunakan vacuum cleaner Pembersihan dengan vacuum cleaner selama max 3 menit',
  },
  {
    id: '1.7',
    code: '1.7',
    label: 'Memasang kembali kipas yang sudah dibersihkan sesuai jalurnya',
  },
  {
    id: '1.8',
    code: '1.8',
    label: 'Memastikan bahwa pegangan tray kipas sudah diputar tertutup',
  },
  {
    id: '1.9',
    code: '1.9',
    label: 'Menggunakan peralatan obeng untuk mengencangkan baut skrup pada chassis',
  },
  {
    id: '1.10',
    code: '1.10',
    label: 'Memastikan bahwa perangkat sudah selesai',
  },
];

// Card 2 Data: Rear Exhaust Screen
const EQUIPMENT_REAR_EXHAUST = [
  'a. ESD-Preventive Wrist Strap',
  'b. Obeng',
  'c. Rear Exhaust Screen',
];

// Card 3 Data: Chassis Air Filter
const EQUIPMENT_AIR_FILTER = [
  'a. ESD-preventive wrist strap',
  'b. Large Phillips screwdriver',
  'c. Chassis air filter (Router product number CRS-8-LCC-FILTER=)',
  'd. Vacuum Cleaner',
];

const PROCEDURES_AIR_FILTER_PART_1: ProcedureItem[] = [
  {
    id: '3.1',
    code: '3.1',
    label: 'Melakukan pembersihan di area sekitar perangkat Router',
  },
  {
    id: '3.2',
    code: '3.2',
    label:
      'Memastikan bahwa ESD-Preventive Wrist Strap digunakan pada saat melakukan kegiatan preventive',
  },
];

const PROCEDURES_AIR_FILTER_PART_2: ProcedureItem[] = [
  {
    id: '3.3',
    code: '3.3',
    label:
      'Melakukan komunikasi terminal dengan perangkat Router dengan laptop untuk mengcapture running config, history log sebagai back-up data saat ini',
  },
  {
    id: '3.4',
    code: '3.4',
    label: 'Membuka pintu chassis dan melepas cover perangkat',
  },
  {
    id: '3.5',
    code: '3.5',
    label: 'Menggunakan kedua tangan untuk menarik tray kipas[8.69kg] pada jalurnya',
  },
  {
    id: '3.6',
    code: '3.6',
    label:
      'Membersihan kipas dengan menggunakan vacuum cleaner Pembersihan dengan vacuum cleaner selama max 3 menit',
  },
  {
    id: '3.7',
    code: '3.7',
    label: 'Memasang kembali kipas yang sudah dibersihkan sesuai jalurnya',
  },
  {
    id: '3.8',
    code: '3.8',
    label: 'Memastikan bahwa pegangan tray kipas sudah diputar tertutup',
  },
  {
    id: '3.9',
    code: '3.9',
    label: 'Menggunakan peralatan obeng untuk mengencangkan baut skrup pada chassis',
  },
  {
    id: '3.10',
    code: '3.10',
    label: 'Memastikan bahwa perangkat sudah selesai',
  },
  {
    id: '3.11',
    code: '3.11',
    label:
      'Membersihkan perangkat dengan cara mengelap peralatan dari luar atau permukaan dengan tissue kering atau handuk',
  },
  {
    id: '3.12',
    code: '3.12',
    label: 'Memastikan patchcord bersih (tidak berdebu)',
  },
  {
    id: '3.13',
    code: '3.13',
    label: 'Cek koneksi patchcord dan perapihan patchcord',
  },
];

export const FotIpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { formData, updateFormData } = useInspectionStore();

  const savedFotIp = formData.fot_ip || {};
  const [procStatus, setProcStatus] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = savedFotIp.procedures || {};
    if (savedFotIp.proc1_1 && !initial['1.1']) initial['1.1'] = savedFotIp.proc1_1;
    if (savedFotIp.proc1_2 && !initial['1.2']) initial['1.2'] = savedFotIp.proc1_2;
    return initial;
  });

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

  // Image Zoom Modal state
  const [zoomModal, setZoomModal] = useState<{
    visible: boolean;
    source: any;
    title: string;
  }>({
    visible: false,
    source: null,
    title: '',
  });

  const updateProc = (id: string, val: string) => {
    const updated = {
      ...procStatus,
      [id]: val,
    };
    setProcStatus(updated);

    updateFormData('fot_ip', {
      ...(formData.fot_ip || {}),
      procedures: updated,
      [`proc_${id.replace('.', '_')}`]: val,
      proc1_1: updated['1.1'] || '',
      proc1_2: updated['1.2'] || '',
    });
  };

  const renderDropdownSelect = (
    value: string,
    onSelect: (val: string) => void,
    options: string[] = ['OK', 'NOK'],
    title: string = 'Pilih Status'
  ) => {
    return (
      <TouchableOpacity
        style={styles.selectBox}
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
          style={[
            styles.selectText,
            !value && styles.selectTextPlaceholder,
            value === 'OK' && { color: Colors.success, fontWeight: '700' },
            value === 'NOK' && { color: Colors.danger, fontWeight: '700' },
            (value === 'N/A' || value === 'NA') && { color: Colors.warning, fontWeight: '700' },
          ]}
          numberOfLines={1}
        >
          {value || 'Pilih'}
        </Text>
        <ChevronDown color={Colors.textMuted} size={16} />
      </TouchableOpacity>
    );
  };

  const renderProcedureItem = (item: ProcedureItem) => (
    <View key={item.id} style={styles.procedureRow}>
      <View style={styles.procedureTextContainer}>
        <Text style={styles.descText}>
          {item.code} {item.label}
        </Text>
      </View>
      <View style={styles.selectWrap}>
        {renderDropdownSelect(
          procStatus[item.id] || '',
          (val) => updateProc(item.id, val),
          ['OK', 'NOK'],
          `Pilih Status Prosedur ${item.code}`
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="FOT IP"
        subtitle="Langkah Pembersihan Perangkat Aktif IP"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Lower Fan Tray */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lower Fan Tray</Text>
          <View style={styles.divider} />

          {/* Peralatan (Murni Teks Deskripsi) */}
          <Text style={styles.subHeader}>Peralatan yang dibutuhkan meliputi :</Text>
          <View style={styles.listContainer}>
            {EQUIPMENT_ITEMS.map((item, idx) => (
              <Text key={idx} style={styles.descText}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Prosedur */}
          <Text style={styles.subHeader}>Prosedur :</Text>
          <View style={styles.procedureList}>
            {/* 1.1 dan 1.2 */}
            {PROCEDURES_PART_1.map(renderProcedureItem)}

            {/* Gambar di bawah 1.2 */}
            <TouchableOpacity
              style={styles.imageCardWrapper}
              onPress={() =>
                setZoomModal({
                  visible: true,
                  source: require('../../assets/images/crs_fan_tray.png'),
                  title: 'Diagram Fan Tray Router CRS',
                })
              }
              activeOpacity={0.85}
            >
              <Image
                source={require('../../assets/images/crs_fan_tray.png')}
                style={styles.fanTrayImage}
                resizeMode="contain"
              />
              <View style={styles.zoomHintBadge}>
                <Maximize2 color="#FFFFFF" size={11} />
                <Text style={styles.zoomHintText}>Ketuk untuk perbesar</Text>
              </View>
            </TouchableOpacity>

            {/* 1.3 sampai 1.10 */}
            {PROCEDURES_PART_2.map(renderProcedureItem)}
          </View>
        </View>

        {/* Card 2: Rear Exhaust Screen */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rear Exhaust Screen</Text>
          <View style={styles.divider} />

          {/* Peralatan */}
          <Text style={styles.subHeader}>Peralatan yang dibutuhkan meliputi :</Text>
          <View style={styles.listContainer}>
            {EQUIPMENT_REAR_EXHAUST.map((item, idx) => (
              <Text key={idx} style={styles.descText}>
                {item}
              </Text>
            ))}
          </View>

          {/* Gambar di bawah c. Rear Exhaust Screen */}
          <TouchableOpacity
            style={styles.imageCardWrapper}
            onPress={() =>
              setZoomModal({
                visible: true,
                source: require('../../assets/images/crs_rear_exhaust.png'),
                title: 'Diagram Rear Exhaust Screen',
              })
            }
            activeOpacity={0.85}
          >
            <Image
              source={require('../../assets/images/crs_rear_exhaust.png')}
              style={styles.rearExhaustImage}
              resizeMode="contain"
            />
            <View style={styles.zoomHintBadge}>
              <Maximize2 color="#FFFFFF" size={11} />
              <Text style={styles.zoomHintText}>Ketuk untuk perbesar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Card 3: Chassis Air Filter */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chassis Air Filter</Text>
          <View style={styles.divider} />

          {/* Peralatan */}
          <Text style={styles.subHeader}>Peralatan yang dibutuhkan meliputi :</Text>
          <View style={styles.listContainer}>
            {EQUIPMENT_AIR_FILTER.map((item, idx) => (
              <Text key={idx} style={styles.descText}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Prosedur */}
          <Text style={styles.subHeader}>Prosedur :</Text>
          <View style={styles.procedureList}>
            {/* 3.1 dan 3.2 */}
            {PROCEDURES_AIR_FILTER_PART_1.map(renderProcedureItem)}

            {/* Gambar di bawah 3.2 */}
            <TouchableOpacity
              style={styles.imageCardWrapper}
              onPress={() =>
                setZoomModal({
                  visible: true,
                  source: require('../../assets/images/crs_air_filter.png'),
                  title: 'Diagram Chassis Air Filter',
                })
              }
              activeOpacity={0.85}
            >
              <Image
                source={require('../../assets/images/crs_air_filter.png')}
                style={styles.airFilterImage}
                resizeMode="contain"
              />
              <View style={styles.zoomHintBadge}>
                <Maximize2 color="#FFFFFF" size={11} />
                <Text style={styles.zoomHintText}>Ketuk untuk perbesar</Text>
              </View>
            </TouchableOpacity>

            {/* 3.3 sampai 3.13 */}
            {PROCEDURES_AIR_FILTER_PART_2.map(renderProcedureItem)}
          </View>
        </View>
      </ScrollView>

      {/* Modal Picker Pilihan OK / NOK */}
      <DropdownModalPicker
        visible={modalPicker.visible}
        title={modalPicker.title}
        options={modalPicker.options}
        selectedValue={modalPicker.selectedValue}
        onSelect={modalPicker.onSelect}
        onClose={() => setModalPicker((prev) => ({ ...prev, visible: false }))}
      />

      {/* Modal Zoom Gambar */}
      <ImageZoomModal
        visible={zoomModal.visible}
        source={zoomModal.source}
        title={zoomModal.title}
        onClose={() => setZoomModal((prev) => ({ ...prev, visible: false }))}
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
    paddingBottom: 40,
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
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  subHeader: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  listContainer: {
    paddingLeft: Spacing.xs,
    gap: 5,
  },
  descText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.text,
  },
  procedureList: {
    gap: 10,
  },
  procedureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  procedureTextContainer: {
    flex: 1,
  },
  selectWrap: {
    width: 80,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 34,
  },
  selectText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  selectTextPlaceholder: {
    color: Colors.textMuted,
    fontWeight: 'normal',
  },
  imageCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xs,
    marginVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fanTrayImage: {
    width: '100%',
    height: 140,
  },
  rearExhaustImage: {
    width: '100%',
    height: 240,
  },
  airFilterImage: {
    width: '100%',
    height: 140,
  },
  emptyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  zoomHintBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoomHintText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
