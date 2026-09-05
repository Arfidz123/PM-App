import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronUp, ChevronDown, ChevronLeft, Camera, Plus, Check, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, showAlert } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import { requestCameraPermission, getLiveCoordinatesString, getCurrentFormattedTimestamp } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BatteryData {
  id: string;
  isExpanded: boolean;
  merk: string;
  tipe: string;
  kapasitas: string;
  sn: string;
  tahunInstalasi: string;
  suhuBaterai: string;
  cell1: string;
  cell2: string;
  cell3: string;
  cell4: string;
  vTotal: string;
  kondisi: string;
}

export const BatteryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { formData, updateFormData, currentLocation, activePopLocation } = useInspectionStore();
  const batteryData = formData.battery || {};

  const infoPop = formData.infoPop || {};
  const coordsStr = infoPop.koordinat || (currentLocation ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}` : '');
  const addressStr = (infoPop.alamat && infoPop.alamat.trim() !== '') ? infoPop.alamat : (activePopLocation || currentLocation?.address || '-');
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`;

  // Entrance animations
  const contentAnim = useRef(new Animated.Value(0)).current;
  const saveButtonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(contentAnim, {
      toValue: 1,
      friction: 7,
      tension: 45,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSavePressIn = () => {
    Animated.spring(saveButtonAnim, { toValue: 0.96, friction: 4, tension: 200, useNativeDriver: true }).start();
  };
  const handleSavePressOut = () => {
    Animated.spring(saveButtonAnim, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true }).start();
  };

  const catatan = batteryData.catatan || '';
  const setCatatan = (val: string) => updateFormData('battery', { ...batteryData, catatan: val });

  const banks: BatteryData[] = batteryData.banks || [
    {
      id: '1',
      isExpanded: true,
      merk: 'Huawei',
      tipe: 'VRLA',
      kapasitas: '100',
      sn: '',
      tahunInstalasi: '',
      suhuBaterai: '',
      cell1: '',
      cell2: '',
      cell3: '',
      cell4: '',
      vTotal: '54.4',
      kondisi: 'OK',
    }
  ];

  const setBanks = (newBanks: BatteryData[]) => {
    updateFormData('battery', { banks: newBanks });
  };

  const addBank = () => {
    const newId = (banks.length + 1).toString();
    setBanks([
      ...banks,
      {
        id: newId,
        isExpanded: true,
        merk: '',
        tipe: '',
        kapasitas: '',
        sn: '',
        tahunInstalasi: '',
        suhuBaterai: '',
        cell1: '',
        cell2: '',
        cell3: '',
        cell4: '',
        vTotal: '',
        kondisi: '',
      }
    ]);
    showAlert({
      type: 'success',
      title: 'Berhasil Ditambahkan',
      message: `Bank Baterai #${newId} berhasil ditambahkan.`,
    });
  };

  const deleteBank = (bankId: string) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Bank Baterai',
      message: `Apakah Anda yakin ingin menghapus Bank #${bankId}?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setBanks(banks.filter((b: BatteryData) => b.id !== bankId));
          }
        }
      ]
    });
  };

  const updateBank = (id: string, field: keyof BatteryData, value: any) => {
    setBanks(
      banks.map((b: BatteryData) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const renderSegmentedControl = (
    label: string,
    value: string,
    onChange: (val: string) => void
  ) => {
    return (
      <View style={styles.segmentContainer}>
        <Text style={styles.segmentLabel}>{label}</Text>
        <View style={styles.segmentedControl}>
          {['OK', 'NOK', 'N/A'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.segmentBtn,
                value === opt &&
                  (opt === 'OK'
                    ? styles.segmentBtnActiveOk
                    : opt === 'NOK'
                    ? styles.segmentBtnActiveNok
                    : styles.segmentBtnActiveNa),
              ]}
              onPress={() => onChange(value === opt ? '' : opt)}
            >
              {value === opt && opt === 'OK' && (
                <Check size={14} color={Colors.white} style={{ marginRight: 4 }} />
              )}
              <Text style={value === opt ? styles.segmentTextActive : styles.segmentText}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCellMeasurement = (
    id: string,
    label: string,
    value: string,
    field: keyof BatteryData,
    isTotal: boolean = false
  ) => {
    return (
      <View style={styles.measurementRow}>
        <Text style={[styles.measurementLabel, isTotal && { fontWeight: 'bold' }]}>{label}</Text>
        <View style={styles.measurementInputWrapper}>
          <View style={styles.measurementInputContainer}>
            <TextInput
              style={styles.measurementInput}
              value={value}
              onChangeText={(val) => updateBank(id, field, val)}
              placeholder="—"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.measurementUnit}>V</Text>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <Header
        title="Baterai"
        subtitle="Kondisi Baterai"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          }}
        >
          {banks.map((bank, index) => (
            <View key={bank.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  style={styles.cardTitleRow}
                  onPress={() => updateBank(bank.id, 'isExpanded', !bank.isExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardTitle}>Bank #{bank.id}</Text>
                  {bank.isExpanded ?
                    <ChevronUp color={Colors.textMuted} size={20} style={{ marginLeft: 8 }} /> :
                    <ChevronDown color={Colors.textMuted} size={20} style={{ marginLeft: 8 }} />
                  }
                </TouchableOpacity>
                {parseInt(bank.id, 10) > 1 && (
                  <TouchableOpacity
                    onPress={() => deleteBank(bank.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 color={Colors.danger} size={18} />
                  </TouchableOpacity>
                )}
              </View>

              {bank.isExpanded && (
                <View style={styles.cardBody}>
                  {/* Section: Baterai */}
                  <View style={[styles.cardTitleRow, styles.subHeadingContainer, { marginBottom: Spacing.sm }]}>
                    <Text style={styles.cardTitle}>BATERAI</Text>
                  </View>

                  {/* Merk */}
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.inputLabel}>MERK</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={bank.merk}
                      onChangeText={(val) => updateBank(bank.id, 'merk', val)}
                    />
                  </View>

                  {/* Tipe & Kapasitas */}
                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>TIPE</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={[styles.inputBox, { flex: 1 }]}
                          value={bank.tipe}
                          onChangeText={(val) => updateBank(bank.id, 'tipe', val)}
                        />
                        <View style={styles.measurementUnit} />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>KAPASITAS</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={[styles.inputBox, { flex: 1 }]}
                          value={bank.kapasitas}
                          onChangeText={(val) => updateBank(bank.id, 'kapasitas', val)}
                          keyboardType="numeric"
                        />
                        <Text style={styles.measurementUnit}>AH</Text>
                      </View>
                    </View>
                  </View>

                  {/* SN */}
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.inputLabel}>SERIAL NUMBER</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={bank.sn}
                      onChangeText={(val) => updateBank(bank.id, 'sn', val)}
                    />
                  </View>



                  {/* Section: Tegangan */}
                  <View style={styles.divider} />
                  <View style={[styles.cardTitleRow, styles.subHeadingContainer, { marginBottom: Spacing.sm, marginTop: Spacing.sm }]}>
                    <Text style={styles.cardTitle}>TEGANGAN</Text>
                  </View>

                  {/* Cells */}
                  {renderCellMeasurement(bank.id, 'Cell #1', bank.cell1, 'cell1')}
                  {renderCellMeasurement(bank.id, 'Cell #2', bank.cell2, 'cell2')}
                  {renderCellMeasurement(bank.id, 'Cell #3', bank.cell3, 'cell3')}
                  {renderCellMeasurement(bank.id, 'Cell #4', bank.cell4, 'cell4')}

                  <View style={styles.divider} />

                  {renderCellMeasurement(bank.id, 'V Total', bank.vTotal, 'vTotal', true)}
                </View>
              )}
            </View>
          ))}

          {/* Add Bank Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={addBank}
            activeOpacity={0.7}
          >
            <Plus size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Tambah Bank</Text>
          </TouchableOpacity>


          {/* Card: Catatan */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Catatan</Text>
            </View>
            <View style={styles.cardBody}>
              <TextInput
                style={[styles.inputBox, { height: 100, textAlignVertical: 'top' }]}
                value={catatan}
                onChangeText={setCatatan}
                placeholder="Tambahkan catatan..."
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: saveButtonAnim }] }}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => navigation.goBack()}
              onPressIn={handleSavePressIn}
              onPressOut={handleSavePressOut}
              activeOpacity={1}>
              <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
            </TouchableOpacity>
          </Animated.View>

        </Animated.ScrollView>
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
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  iconBox: {
    marginRight: Spacing.sm,
  },
  batteryIcon: {
    width: 16,
    height: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 2,
    position: 'relative',
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
    marginBottom: Spacing.md,
  },
  inputGroupFull: {
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
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
  badgePW: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: 6,
  },
  badgePWText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  subHeadingContainer: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    width: 80,
    height: 40,
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
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  segmentLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
    flex: 1,
    textTransform: 'uppercase',
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
    backgroundColor: '#EF4444', // Red for NOK
    borderColor: '#EF4444',
  },
  segmentBtnActiveNa: {
    backgroundColor: '#F59E0B', // Amber for N/A
    borderColor: '#F59E0B',
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
  addButton: {
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
  addButtonText: {
    ...Typography.body,
    color: Colors.primary,
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
    marginBottom: Spacing.sm,
  },
  photoUploadBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surfaceLight,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  photoUploadBoxAdd: {
    width: '100%',
    aspectRatio: 4 / 3,
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
    zIndex: 10,
  },
  timestampBadgeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  timestampOverlayText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  timestampOverlayTextSub: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
