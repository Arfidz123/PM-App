import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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
import { Header, ImagePreviewModal, DynamicPhotoCard } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import { requestCameraPermission } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RectifierModule {
  id: string;
  sn: string;
  kapasitas: string;
  beban: string;
}

interface RectifierMCB {
  id: string;
  merk: string;
  kapasitas: string;
  peruntukan: string;
}

interface RectifierData {
  id: string;
  isExpanded: boolean;
  merk: string;
  tipe: string;
  sn: string;
  tipeModul: string;
  jmlModul: string;
  jmlSlot: string;
  modules: RectifierModule[];
  mcbs: RectifierMCB[];
  arusBeban: string;
  tegInput: string;
  tegFloating: string;
}

export const RectifierScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const { formData, updateFormData, addPhotoBySection, removePhotoBySection, currentLocation, activePopLocation, getPhotoTimestamp } = useInspectionStore();
  const rectData = formData.rectifier || {};
  const sectionPhotos: string[] = rectData.photos || [];

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

  const [fotoExpanded, setFotoExpanded] = useState(true);
  const catatan = rectData.catatan || '';
  const setCatatan = (val: string) => updateFormData('rectifier', { ...rectData, catatan: val });

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Izin Kamera Ditolak', 'Aplikasi memerlukan izin kamera untuk mengambil foto.');
      return;
    }
    launchCamera(
      { mediaType: 'photo', cameraType: 'back', quality: 0.8, saveToPhotos: false, includeBase64: false },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Kamera Error', response.errorMessage || 'Gagal membuka kamera pada perangkat ini');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            addPhotoBySection('rectifier', uri);
          }
        }
      }
    );
  };

  const handlePickGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, includeBase64: false },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Galeri Error', response.errorMessage || 'Gagal membuka galeri');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            addPhotoBySection('rectifier', uri);
          }
        }
      }
    );
  };

  const ps = formData.powerSystem || {};

  const rawRectifiers: RectifierData[] = rectData.rectifiers && rectData.rectifiers.length > 0
    ? rectData.rectifiers
    : [
        {
          id: '1',
          isExpanded: true,
          merk: ps.rect1Merk || '',
          tipe: ps.rect1Tipe || '',
          sn: ps.rect1SN || '',
          tipeModul: ps.rect1TipeModul || '',
          jmlModul: ps.rect1ModulJml || '',
          jmlSlot: ps.rect1KapasitasSlot || '',
          modules: [],
          mcbs: Array.from({ length: 8 }, (_, i) => ({
            id: (i + 1).toString(),
            merk: '',
            kapasitas: '',
            peruntukan: ''
          })),
          arusBeban: ps.rect1ArusBeban || '',
          tegInput: ps.rect1TegInput || '',
          tegFloating: ps.rect1TegFloating || '',
        }
      ];

  const rectifiers: RectifierData[] = rawRectifiers.map((r: RectifierData, idx: number) => {
    const num = idx + 1;
    return {
      ...r,
      merk: r.merk || ps[`rect${num}Merk`] || '',
      tipe: r.tipe || ps[`rect${num}Tipe`] || '',
      sn: r.sn || ps[`rect${num}SN`] || '',
      tipeModul: r.tipeModul || ps[`rect${num}TipeModul`] || '',
      jmlModul: r.jmlModul || ps[`rect${num}ModulJml`] || '',
      jmlSlot: r.jmlSlot || ps[`rect${num}KapasitasSlot`] || '',
      arusBeban: r.arusBeban || ps[`rect${num}ArusBeban`] || '',
      tegInput: r.tegInput || ps[`rect${num}TegInput`] || '',
      tegFloating: r.tegFloating || ps[`rect${num}TegFloating`] || '',
    };
  });

  const setRectifiers = (newRectifiers: RectifierData[]) => {
    updateFormData('rectifier', { rectifiers: newRectifiers });

    const powerUpdates: Record<string, any> = {};
    newRectifiers.forEach((r, idx) => {
      const rectNum = idx + 1;
      if (rectNum <= 3) {
        if (r.merk !== undefined) powerUpdates[`rect${rectNum}Merk`] = r.merk;
        if (r.tipe !== undefined) powerUpdates[`rect${rectNum}Tipe`] = r.tipe;
        if (r.sn !== undefined) powerUpdates[`rect${rectNum}SN`] = r.sn;
        if (r.tipeModul !== undefined) powerUpdates[`rect${rectNum}TipeModul`] = r.tipeModul;
        if (r.jmlModul !== undefined) powerUpdates[`rect${rectNum}ModulJml`] = r.jmlModul;
        if (r.jmlSlot !== undefined) powerUpdates[`rect${rectNum}KapasitasSlot`] = r.jmlSlot;
        if (r.arusBeban !== undefined) powerUpdates[`rect${rectNum}ArusBeban`] = r.arusBeban;
        if (r.tegInput !== undefined) powerUpdates[`rect${rectNum}TegInput`] = r.tegInput;
        if (r.tegFloating !== undefined) powerUpdates[`rect${rectNum}TegFloating`] = r.tegFloating;
      }
    });
    updateFormData('powerSystem', powerUpdates);
  };

  const addRectifier = () => {
    const newId = (rectifiers.length > 0 ? Math.max(...rectifiers.map(r => parseInt(r.id))) + 1 : 1).toString();
    setRectifiers([
      ...rectifiers,
      {
        id: newId,
        isExpanded: true,
        merk: '',
        tipe: '',
        sn: '',
        tipeModul: '',
        jmlModul: '',
        jmlSlot: '',
        modules: [],
        mcbs: [
          { id: '1', merk: '', kapasitas: '', peruntukan: '' }
        ],
        arusBeban: '',
        tegInput: '',
        tegFloating: '',
      }
    ]);
  };

  const deleteRectifier = (id: string) => {
    Alert.alert(
      "Hapus Rectifier",
      `Apakah Anda yakin ingin menghapus Rectifier #${id}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            setRectifiers(rectifiers.filter((r: RectifierData) => r.id !== id));
          }
        }
      ]
    );
  };

  const updateRectifier = (id: string, field: keyof RectifierData, value: any) => {
    setRectifiers(
      rectifiers.map((r: RectifierData) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleJmlModulChange = (rectId: string, val: string) => {
    const num = Math.min(parseInt(val) || 0, 20); // Cap at 20 modules
    setRectifiers(rectifiers.map((r: RectifierData) => {
      if (r.id === rectId) {
        let newModules = [...r.modules];
        if (num > newModules.length) {
          for (let i = newModules.length; i < num; i++) {
            newModules.push({ id: (i + 1).toString(), sn: '', kapasitas: '', beban: '' });
          }
        } else {
          newModules = newModules.slice(0, num);
        }
        return { ...r, jmlModul: val, modules: newModules };
      }
      return r;
    }));
  };

  const updateModule = (rectId: string, moduleId: string, field: keyof RectifierModule, value: string) => {
    setRectifiers(rectifiers.map((r: RectifierData) => {
      if (r.id === rectId) {
        return {
          ...r,
          modules: r.modules.map(m => m.id === moduleId ? { ...m, [field]: value } : m)
        };
      }
      return r;
    }));
  };

  const renderMeasurement = (
    rectId: string,
    label: string,
    value: string,
    field: keyof RectifierData,
    unit: string = 'V'
  ) => {
    return (
      <View style={styles.measurementRow}>
        <Text style={styles.measurementLabel}>{label}</Text>
        <View style={styles.measurementInputWrapper}>
          <View style={styles.measurementInputContainer}>
            <TextInput
              style={styles.measurementInput}
              value={value}
              onChangeText={(val) => updateRectifier(rectId, field, val)}
              placeholder="—"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.measurementUnit}>{unit}</Text>
        </View>
      </View>
    );
  };

  const addMCB = (rectId: string) => {
    setRectifiers(rectifiers.map((r: RectifierData) => {
      if (r.id === rectId) {
        const newMcbId = (r.mcbs.length > 0 ? Math.max(...r.mcbs.map(m => parseInt(m.id))) + 1 : 1).toString();
        return {
          ...r,
          mcbs: [...r.mcbs, { id: newMcbId, merk: '', kapasitas: '', peruntukan: '' }]
        };
      }
      return r;
    }));
  };

  const updateMCB = (rectId: string, mcbId: string, field: keyof RectifierMCB, value: string) => {
    setRectifiers(rectifiers.map((r: RectifierData) => {
      if (r.id === rectId) {
        return {
          ...r,
          mcbs: r.mcbs.map(m => m.id === mcbId ? { ...m, [field]: value } : m)
        };
      }
      return r;
    }));
  };

  const removeMCB = (rectId: string, mcbId: string) => {
    setRectifiers(rectifiers.map((r: RectifierData) => {
      if (r.id === rectId) {
        return {
          ...r,
          mcbs: r.mcbs.filter(m => m.id !== mcbId)
        };
      }
      return r;
    }));
  };



  return (
    <View style={styles.container}>
      <Header
        title="Rectifier"
        subtitle="Pengukuran Rectifier"
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
          {rectifiers.map((rect, index) => (
            <View key={rect.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  style={styles.cardTitleRow}
                  onPress={() => updateRectifier(rect.id, 'isExpanded', !rect.isExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardTitle}>Rectifier #{rect.id}</Text>
                  {rect.isExpanded ?
                    <ChevronUp color={Colors.textMuted} size={20} style={{ marginLeft: 8 }} /> :
                    <ChevronDown color={Colors.textMuted} size={20} style={{ marginLeft: 8 }} />
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteRectifier(rect.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 color={Colors.danger} size={18} />
                </TouchableOpacity>
              </View>

              {rect.isExpanded && (
                <View style={styles.cardBody}>
                  {/* Merk */}
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.inputLabel}>MERK</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={rect.merk}
                      onChangeText={(val) => updateRectifier(rect.id, 'merk', val)}
                      placeholder=" "
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>

                  {/* Tipe & SN */}
                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>TIPE</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={rect.tipe}
                        onChangeText={(val) => updateRectifier(rect.id, 'tipe', val)}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>SN</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={rect.sn}
                        onChangeText={(val) => updateRectifier(rect.id, 'sn', val)}
                      />
                    </View>
                  </View>

                  {/* Tipe Modul */}
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.inputLabel}>TIPE MODUL</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={rect.tipeModul}
                      onChangeText={(val) => updateRectifier(rect.id, 'tipeModul', val)}
                    />
                  </View>

                  {/* Jml Modul & Jml Slot */}
                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>JUMLAH MODUL</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={rect.jmlModul}
                        onChangeText={(val) => handleJmlModulChange(rect.id, val)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>JUMLAH SLOT MODUL</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={rect.jmlSlot}
                        onChangeText={(val) => updateRectifier(rect.id, 'jmlSlot', val)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Dynamic Modules based on Jumlah Modul */}
                  {rect.modules.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <View style={styles.subHeadingContainer}>
                        <Text style={styles.subHeading}>Detail Modul</Text>
                      </View>
                      {rect.modules.map(mod => (
                        <View key={mod.id} style={styles.moduleItem}>
                          <Text style={styles.moduleItemTitle}>Modul {mod.id}</Text>
                          <View style={styles.row}>
                            <View style={styles.inputGroup}>
                              <Text style={styles.inputLabel}>Serial Number</Text>
                              <TextInput
                                style={styles.inputBox}
                                value={mod.sn}
                                onChangeText={(val) => updateModule(rect.id, mod.id, 'sn', val)}
                              />
                            </View>
                            <View style={styles.inputGroup}>
                              <Text style={styles.inputLabel}>Kapasitas (A)</Text>
                              <TextInput
                                style={styles.inputBox}
                                value={mod.kapasitas}
                                onChangeText={(val) => updateModule(rect.id, mod.id, 'kapasitas', val)}
                                keyboardType="numeric"
                              />
                            </View>
                          </View>

                        </View>
                      ))}
                    </View>
                  )}

                  {/* Measurements */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.subHeadingContainer}>
                      <Text style={styles.subHeading}>Pengukuran</Text>
                    </View>

                    {renderMeasurement(rect.id, 'ARUS BEBAN', rect.arusBeban, 'arusBeban', 'A')}
                    {renderMeasurement(rect.id, 'TEGANGAN INPUT', rect.tegInput, 'tegInput', 'V')}
                    {renderMeasurement(rect.id, 'TEGANGAN FLOATING', rect.tegFloating, 'tegFloating', 'V')}
                  </View>

                  {/* Output MCB */}
                  <View style={styles.sectionContainer}>
                    <View style={[styles.sectionHeaderRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                      <Text style={[styles.subHeading, { marginBottom: 0 }]}>Output MCB</Text>
                      <TouchableOpacity onPress={() => addMCB(rect.id)} style={{ padding: 8 }}>
                        <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>+ Tambah Baris</Text>
                      </TouchableOpacity>
                    </View>

                    {rect.mcbs.map((mcb, index) => (
                      <View key={mcb.id} style={styles.mcbItem}>
                        <View style={styles.mcbHeaderRow}>
                          <Text style={styles.mcbItemTitle}>MCB {index + 1}</Text>
                          <TouchableOpacity onPress={() => removeMCB(rect.id, mcb.id)}>
                            <Trash2 size={16} color={Colors.danger} />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Merk</Text>
                            <TextInput
                              style={styles.inputBox}
                              value={mcb.merk}
                              onChangeText={(val) => updateMCB(rect.id, mcb.id, 'merk', val)}
                              placeholder="Merk"
                              placeholderTextColor={Colors.textMuted}
                            />
                          </View>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kapasitas (A)</Text>
                            <TextInput
                              style={styles.inputBox}
                              value={mcb.kapasitas}
                              onChangeText={(val) => updateMCB(rect.id, mcb.id, 'kapasitas', val)}
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroupFull}>
                          <Text style={styles.inputLabel}>Peruntukan</Text>
                          <TextInput
                            style={styles.inputBox}
                            value={mcb.peruntukan}
                            onChangeText={(val) => updateMCB(rect.id, mcb.id, 'peruntukan', val)}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Add Rectifier Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={addRectifier}
            activeOpacity={0.7}
          >
            <Plus color={Colors.white} size={20} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.addButtonText}>Tambah Rectifier Baru</Text>
          </TouchableOpacity>

          {/* Card: Foto */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setFotoExpanded(!fotoExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Camera color={Colors.primary} size={20} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.cardTitle}>Foto ({sectionPhotos.length})</Text>
              </View>
              {fotoExpanded ? (
                <ChevronUp color={Colors.textMuted} size={20} />
              ) : (
                <ChevronDown color={Colors.textMuted} size={20} />
              )}
            </TouchableOpacity>

            {fotoExpanded && (
              <View style={styles.cardBody}>
                <View style={styles.photoGrid}>
                  {sectionPhotos.map((fotoUri, index) => (
                    <DynamicPhotoCard
                      key={index}
                      uri={fotoUri}
                      onPress={() => setSelectedPhoto(fotoUri)}
                      onDelete={() => removePhotoBySection('rectifier', index)}
                      dateStr={getPhotoTimestamp(fotoUri)}
                      coordsStr={coordsStr}
                      addressStr={addressStr}
                      label={`Rectifier #${index + 1}`}
                    />
                  ))}

                  <TouchableOpacity
                    style={styles.photoUploadBoxWrapper}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                  >
                    <View style={styles.photoUploadBoxAdd}>
                      <Camera color={Colors.primary} size={26} style={{ marginBottom: 4 }} />
                      <Text style={styles.photoUploadText}>Kamera</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoUploadBoxWrapper}
                    onPress={handlePickGallery}
                    activeOpacity={0.7}
                  >
                    <View style={styles.photoUploadBoxAdd}>
                      <ImageIcon color={Colors.textMuted} size={26} style={{ marginBottom: 4 }} />
                      <Text style={styles.photoUploadText}>Galeri</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

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

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={!!selectedPhoto}
        imageUri={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
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
    flex: 1,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 8,
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
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupFull: {
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
    minHeight: 44,
    backgroundColor: Colors.background,
    color: Colors.text,
    ...Typography.body,
  },
  sectionContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subHeading: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: 'bold',
  },
  subHeadingContainer: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  smallAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
  },
  smallAddBtnText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  moduleItem: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  moduleItemTitle: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  mcbItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  mcbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mcbItemTitle: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.text,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    ...Typography.body,
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
