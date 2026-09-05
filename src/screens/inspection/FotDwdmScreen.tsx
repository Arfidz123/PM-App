/**
 * FOT DWDM Screen
 * Langkah Pembersihan Perangkat Aktif DWDM dengan 3 Card:
 * 1. Anti Dust Screen
 * 2. Fan Unit
 * 3. Equipment Unit
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

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, DropdownModalPicker, ImageZoomModal } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProcedureItem {
  id: string;
  code: string;
  label: string;
}

// Card 1 Data: Anti Dust Screen
const EQUIPMENT_ANTI_DUST = [
  'a. Blower',
  'b. Kain pengering',
  'c. ESD-Preventive Wrist Strap (Gelang Statis)',
];

const PROCEDURES_ANTI_DUST: ProcedureItem[] = [
  {
    id: '1.1',
    code: '1.1',
    label: 'Menarik Anti Dust Screen keluar secara perlahan',
  },
  {
    id: '1.2',
    code: '1.2',
    label:
      'Memastikan bahwa ESD-Preventive Wrist Strap digunakan pada saat melakukan kegiatan preventive',
  },
  {
    id: '1.3',
    code: '1.3',
    label: 'Menyiram Anti Dust Screen dengan air sampai bersih',
  },
  {
    id: '1.4',
    code: '1.4',
    label:
      'Mengelap dengan kain pada permukaan Anti Dust Screen dan keringkan dengan blower',
  },
];

// Card 2 Data: Fan Unit
const EQUIPMENT_FAN_UNIT = [
  'a. Kantong Plastik (Box)',
  'b. Adhesive Tape',
  'c. Sikat',
  'd. ESD-Protection Wrist Strap',
  'e. Vacuum Cleaner',
  'f. Obeng Plus',
];

const PROCEDURES_FAN_UNIT: ProcedureItem[] = [
  {
    id: '2.1',
    code: '2.1',
    label: 'Mengenakan ESD-Preventive Wrist Strap pada tangan',
  },
  {
    id: '2.2',
    code: '2.2',
    label: 'Melepas modul kipas',
  },
  {
    id: '2.3',
    code: '2.3',
    label:
      'Menarik modul kipas dari subrak dengan menekan penjepret kedalam, sesuai gambar dibawah ini',
  },
  {
    id: '2.4',
    code: '2.4',
    label:
      'Melepaskan skrup pada kipas panel dan menarik kipas dari subrak, seperti gambar',
  },
  {
    id: '2.5',
    code: '2.5',
    label:
      'Meletakkan peralatan yang terlepas dari modul kipas pada kantong plastik agar terhindar debu',
  },
  {
    id: '2.6',
    code: '2.6',
    label: 'Menggunakan vacuum cleaner dan sikat untuk membersihkan kipas',
  },
  {
    id: '2.7',
    code: '2.7',
    label:
      'Memasang kembali kipas pada jalurnya sampai bunyi "click", dan mengencangkan baut yang ada',
  },
  {
    id: '2.8',
    code: '2.8',
    label: 'Memastikan bahwa kipas berputar normal',
  },
  {
    id: '2.9',
    code: '2.9',
    label:
      'Jika kipas berputar secara abnormal, lambat atau mati, memastikan kembali kipas terpasang dengan benar, jika tidak mengganti kipas dengan yang baru',
  },
];

// Card 3 Data: Equipment Unit
const EQUIPMENT_EQUIPMENT_UNIT = [
  'a. Tissue / kain kering',
  'b. Vacuum cleaner',
];

const PROCEDURES_EQUIPMENT_UNIT: ProcedureItem[] = [
  {
    id: '3.1',
    code: '3.1',
    label:
      'Membersihkan perangkat dengan cara mengelap peralatan dari luar atau permukaan dengan tissue kering atau handuk',
  },
  {
    id: '3.2',
    code: '3.2',
    label: 'Memastikan patchcord bersih (tidak berdebu)',
  },
  {
    id: '3.3',
    code: '3.3',
    label: 'Cek koneksi patchcord dan perapihan patchcord',
  },
];

export const FotDwdmScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { formData, updateFormData } = useInspectionStore();

  const savedFotDwdm = formData.fot_dwdm || {};
  const [procStatus, setProcStatus] = useState<Record<string, string>>(() => {
    return savedFotDwdm.procedures || {};
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
    onSelect: () => {},
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

    updateFormData('fot_dwdm', {
      ...(formData.fot_dwdm || {}),
      procedures: updated,
      [`proc_${id.replace('.', '_')}`]: val,
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
        title="FOT DWDM"
        subtitle="Langkah Pembersihan Perangkat Aktif DWDM"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Anti Dust Screen */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Anti Dust Screen</Text>
          <View style={styles.divider} />

          {/* Peralatan */}
          <Text style={styles.subHeader}>Peralatan yang dibutuhkan meliputi :</Text>
          <View style={styles.listContainer}>
            {EQUIPMENT_ANTI_DUST.map((item, idx) => (
              <Text key={idx} style={styles.descText}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Prosedur */}
          <Text style={styles.subHeader}>Prosedur :</Text>
          <View style={styles.procedureList}>
            {/* 1.1 */}
            {renderProcedureItem(PROCEDURES_ANTI_DUST[0])}

            {/* Picture 1 di bawah 1.1 */}
            <TouchableOpacity
              style={styles.imageCardWrapper}
              onPress={() =>
                setZoomModal({
                  visible: true,
                  source: require('../../assets/images/dwdm_anti_dust.png'),
                  title: 'Anti Dust Screen - Perangkat DWDM',
                })
              }
              activeOpacity={0.85}
            >
              <Image
                source={require('../../assets/images/dwdm_anti_dust.png')}
                style={styles.antiDustImage}
                resizeMode="contain"
              />
              <View style={styles.zoomHintBadge}>
                <Maximize2 color="#FFFFFF" size={11} />
                <Text style={styles.zoomHintText}>Ketuk untuk perbesar</Text>
              </View>
            </TouchableOpacity>

            {/* 1.2 sampai 1.4 */}
            {PROCEDURES_ANTI_DUST.slice(1).map(renderProcedureItem)}
          </View>
        </View>

        {/* Card 2: Fan Unit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Fan Unit</Text>
          <View style={styles.divider} />

          {/* Peralatan */}
          <Text style={styles.subHeader}>Peralatan yang dibutuhkan meliputi :</Text>
          <View style={styles.listContainer}>
            {EQUIPMENT_FAN_UNIT.map((item, idx) => (
              <Text key={idx} style={styles.descText}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Prosedur */}
          <Text style={styles.subHeader}>Prosedur :</Text>
          <View style={styles.procedureList}>
            {/* 2.1 sampai 2.3 */}
            {PROCEDURES_FAN_UNIT.slice(0, 3).map(renderProcedureItem)}

            {/* Picture 2 di bawah 2.3 */}
            <TouchableOpacity
              style={styles.imageCardWrapper}
              onPress={() =>
                setZoomModal({
                  visible: true,
                  source: require('../../assets/images/dwdm_fan_latch.png'),
                  title: 'Penarikan Modul Kipas - DWDM',
                })
              }
              activeOpacity={0.85}
            >
              <Image
                source={require('../../assets/images/dwdm_fan_latch.png')}
                style={styles.fanLatchImage}
                resizeMode="contain"
              />
              <View style={styles.zoomHintBadge}>
                <Maximize2 color="#FFFFFF" size={11} />
                <Text style={styles.zoomHintText}>Ketuk untuk perbesar</Text>
              </View>
            </TouchableOpacity>

            {/* 2.4 */}
            {renderProcedureItem(PROCEDURES_FAN_UNIT[3])}

            {/* Picture 3 di bawah 2.4 */}
            <TouchableOpacity
              style={styles.imageCardWrapper}
              onPress={() =>
                setZoomModal({
                  visible: true,
                  source: require('../../assets/images/dwdm_fan_panel.png'),
                  title: 'Pelepasan Skrup Panel Kipas - DWDM',
                })
              }
              activeOpacity={0.85}
            >
              <Image
                source={require('../../assets/images/dwdm_fan_panel.png')}
                style={styles.fanPanelImage}
                resizeMode="contain"
              />
              <View style={styles.zoomHintBadge}>
                <Maximize2 color="#FFFFFF" size={11} />
                <Text style={styles.zoomHintText}>Ketuk untuk perbesar</Text>
              </View>
            </TouchableOpacity>

            {/* 2.5 sampai 2.9 */}
            {PROCEDURES_FAN_UNIT.slice(4).map(renderProcedureItem)}
          </View>
        </View>

        {/* Card 3: Equipment Unit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Equipment Unit</Text>
          <View style={styles.divider} />

          {/* Peralatan */}
          <Text style={styles.subHeader}>Peralatan yang dibutuhkan meliputi :</Text>
          <View style={styles.listContainer}>
            {EQUIPMENT_EQUIPMENT_UNIT.map((item, idx) => (
              <Text key={idx} style={styles.descText}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Prosedur */}
          <Text style={styles.subHeader}>Prosedur :</Text>
          <View style={styles.procedureList}>
            {PROCEDURES_EQUIPMENT_UNIT.map(renderProcedureItem)}
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
  antiDustImage: {
    width: '100%',
    height: 220,
  },
  fanLatchImage: {
    width: '100%',
    height: 140,
  },
  fanPanelImage: {
    width: '100%',
    height: 140,
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
