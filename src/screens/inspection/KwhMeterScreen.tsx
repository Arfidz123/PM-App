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
import { ChevronUp, ChevronDown, ChevronLeft, Clock, Zap, Camera, FileText, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, ImagePreviewModal, DynamicPhotoCard, showAlert } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import { requestCameraPermission, getLiveCoordinatesString, getCurrentFormattedTimestamp } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const KwhMeterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Accordion state
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [cosExpanded, setCosExpanded] = useState(true);
  const [kabelExpanded, setKabelExpanded] = useState(true);
  const [fotoExpanded, setFotoExpanded] = useState(true);

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

  const { formData, updateFormData, addPhotoBySection, removePhotoBySection, currentLocation, activePopLocation, getPhotoTimestamp, getPhotoCoordinates } = useInspectionStore();
  const kwhData = formData.kwhMeter || {};
  const sectionPhotos: string[] = kwhData.photos || [];

  const infoPop = formData.infoPop || {};
  const coordsStr = infoPop.koordinat || (currentLocation ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}` : '');
  const addressStr = (infoPop.alamat && infoPop.alamat.trim() !== '') ? infoPop.alamat : (activePopLocation || currentLocation?.address || '-');
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`;

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showAlert({type: 'error', title: 'Izin Kamera Ditolak', message: 'Aplikasi memerlukan izin kamera untuk mengambil foto.'});
      return;
    }
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.7,
        saveToPhotos: false,
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showAlert({type: 'error', title: 'Kamera Error', message: response.errorMessage || 'Gagal membuka kamera pada perangkat ini'});
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            const liveCoords = await getLiveCoordinatesString();
            const photoTs = getCurrentFormattedTimestamp();
            addPhotoBySection('kwhMeter', uri, photoTs, liveCoords || undefined);
          }
        }
      }
    );
  };

  const handlePickGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.7,
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showAlert({type: 'error', title: 'Galeri Error', message: response.errorMessage || 'Gagal membuka galeri'});
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            const liveCoords = await getLiveCoordinatesString();
            const photoTs = getCurrentFormattedTimestamp();
            addPhotoBySection('kwhMeter', uri, photoTs, liveCoords || undefined);
          }
        }
      }
    );
  };
  const powerSystemData = formData.powerSystem || {};

  const updateField = (field: string, value: any) => {
    updateFormData('kwhMeter', { [field]: value });
  };

  const syncWithPowerSystem = (kwhField: string, psField: string, value: string) => {
    updateField(kwhField, value);
    updateFormData('powerSystem', { [psField]: value });
  };

  const cosDropdownOpen = kwhData.cosDropdownOpen ?? false;
  const setCosDropdownOpen = (v: boolean) => updateField('cosDropdownOpen', v);

  const aresterDropdownOpen = kwhData.aresterDropdownOpen ?? false;
  const setAresterDropdownOpen = (v: boolean) => updateField('aresterDropdownOpen', v);

  const cosValue = kwhData.cosValue ?? 'Ada';
  const setCosValue = (v: string) => updateField('cosValue', v);

  const aresterValue = kwhData.aresterValue ?? 'Ada';
  const setAresterValue = (v: string) => updateField('aresterValue', v);

  const idCustomer = powerSystemData.idPelanggan ?? kwhData.idCustomer ?? '';
  const setIdCustomer = (v: string) => syncWithPowerSystem('idCustomer', 'idPelanggan', v);

  const phasa = (powerSystemData.phasaCatuan ?? kwhData.phasa ?? '').replace(/(phase|phasa)\s*/i, '');
  const setPhasa = (v: string) => syncWithPowerSystem('phasa', 'phasaCatuan', v);

  const daya = powerSystemData.dayaListrik ?? kwhData.daya ?? '';
  const setDaya = (v: string) => syncWithPowerSystem('daya', 'dayaListrik', v);

  const mcbR = powerSystemData.arusPhasaR ?? kwhData.mcbR ?? '';
  const setMcbR = (v: string) => syncWithPowerSystem('mcbR', 'arusPhasaR', v);

  const mcbS = powerSystemData.arusPhasaS ?? kwhData.mcbS ?? '';
  const setMcbS = (v: string) => syncWithPowerSystem('mcbS', 'arusPhasaS', v);

  const mcbT = powerSystemData.arusPhasaT ?? kwhData.mcbT ?? '';
  const setMcbT = (v: string) => syncWithPowerSystem('mcbT', 'arusPhasaT', v);

  // Form state - Pengukuran
  const rn = powerSystemData.teganganR_N ?? kwhData.rn ?? '';
  const setRn = (v: string) => syncWithPowerSystem('rn', 'teganganR_N', v);

  const rAmpere = powerSystemData.arusPhasaR ?? kwhData.rAmpere ?? '';
  const setRAmpere = (v: string) => syncWithPowerSystem('rAmpere', 'arusPhasaR', v);

  const sn = powerSystemData.teganganS_N ?? kwhData.sn ?? '';
  const setSn = (v: string) => syncWithPowerSystem('sn', 'teganganS_N', v);

  const sAmpere = powerSystemData.arusPhasaS ?? kwhData.sAmpere ?? '';
  const setSAmpere = (v: string) => syncWithPowerSystem('sAmpere', 'arusPhasaS', v);

  const tn = powerSystemData.teganganT_N ?? kwhData.tn ?? '';
  const setTn = (v: string) => syncWithPowerSystem('tn', 'teganganT_N', v);

  const tAmpere = powerSystemData.arusPhasaT ?? kwhData.tAmpere ?? '';
  const setTAmpere = (v: string) => syncWithPowerSystem('tAmpere', 'arusPhasaT', v);

  const ngVoltage = powerSystemData.teganganG_N ?? kwhData.ngVoltage ?? '';
  const setNgVoltage = (v: string) => syncWithPowerSystem('ngVoltage', 'teganganG_N', v);

  // Form state - Kabel Output
  const warnaR = kwhData.warnaR ?? '';
  const setWarnaR = (v: string) => updateField('warnaR', v);

  const luasR = kwhData.luasR ?? '';
  const setLuasR = (v: string) => updateField('luasR', v);

  const warnaS = kwhData.warnaS ?? '';
  const setWarnaS = (v: string) => updateField('warnaS', v);

  const luasS = kwhData.luasS ?? '';
  const setLuasS = (v: string) => updateField('luasS', v);

  const warnaT = kwhData.warnaT ?? '';
  const setWarnaT = (v: string) => updateField('warnaT', v);

  const luasT = kwhData.luasT ?? '';
  const setLuasT = (v: string) => updateField('luasT', v);

  const warnaN = kwhData.warnaN ?? '';
  const setWarnaN = (v: string) => updateField('warnaN', v);

  const luasN = kwhData.luasN ?? '';
  const setLuasN = (v: string) => updateField('luasN', v);

  const warnaG = kwhData.warnaG ?? '';
  const setWarnaG = (v: string) => updateField('warnaG', v);

  const luasG = kwhData.luasG ?? '';
  const setLuasG = (v: string) => updateField('luasG', v);

  const suhuR = kwhData.suhuR ?? '';
  const setSuhuR = (v: string) => updateField('suhuR', v);

  const suhuS = kwhData.suhuS ?? '';
  const setSuhuS = (v: string) => updateField('suhuS', v);

  const suhuT = kwhData.suhuT ?? '';
  const setSuhuT = (v: string) => updateField('suhuT', v);

  const suhuN = kwhData.suhuN ?? '';
  const setSuhuN = (v: string) => updateField('suhuN', v);

  const suhuG = kwhData.suhuG ?? '';
  const setSuhuG = (v: string) => updateField('suhuG', v);

  // Form state - Comment
  const comment = kwhData.comment ?? '';
  const setComment = (v: string) => updateField('comment', v);

  return (
    <View style={styles.container}>
      <Header
        title="KWH Meter"
        subtitle="Panel KWH Meter"
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
          {/* Card 1: Panel KWH Meter */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setPanelExpanded(!panelExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Panel KWH Meter</Text>
              </View>
              {panelExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {panelExpanded && (
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ID Customer</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={idCustomer}
                      onChangeText={setIdCustomer}
                      placeholder="-"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phasa</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={phasa}
                      onChangeText={setPhasa}
                      placeholder="-"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Daya (VA)</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={daya}
                      onChangeText={setDaya}
                      placeholder="-"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.subHeading}>KAPASITAS MCB</Text>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>R (Ampere)</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={mcbR} onChangeText={setMcbR} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>S (Ampere)</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={mcbS} onChangeText={setMcbS} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>T (Ampere)</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={mcbT} onChangeText={setMcbT} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.subHeading}>PENGUKURAN</Text>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>R-N Voltage</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={rn} onChangeText={setRn} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>R Ampere</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={rAmpere} onChangeText={setRAmpere} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>S-N Voltage</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={sn} onChangeText={setSn} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>S Ampere</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={sAmpere} onChangeText={setSAmpere} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>T-N Voltage</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={tn} onChangeText={setTn} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>T Ampere</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={tAmpere} onChangeText={setTAmpere} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>N-G Voltage</Text>
                    <TextInput style={styles.inputBox} keyboardType="numeric" value={ngVoltage} onChangeText={setNgVoltage} placeholder="—" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroup} />
                </View>
              </View>
            )}
          </View>

          {/* Card 2: COS & Arester */}
          <View style={[styles.card, { zIndex: 100 }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setCosExpanded(!cosExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>COS & Arester</Text>
              </View>
              {cosExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {cosExpanded && (
              <View style={[styles.cardBody, { zIndex: 100 }]}>
                <View style={[styles.row, { zIndex: 100 }]}>
                  <View style={[styles.inputGroup, { zIndex: cosDropdownOpen ? 1000 : 1 }]}>
                    <Text style={styles.inputLabel}>COS</Text>
                    <View>
                      <TouchableOpacity
                        style={[styles.selectBox, cosDropdownOpen && styles.selectBoxActive]}
                        onPress={() => {
                          setCosDropdownOpen(!cosDropdownOpen);
                          if (!cosDropdownOpen) setAresterDropdownOpen(false);
                        }}
                        activeOpacity={1}
                      >
                        <Text style={styles.selectText}>{cosValue}</Text>
                        <ChevronDown color={Colors.textMuted} size={16} />
                      </TouchableOpacity>
                      {cosDropdownOpen && (
                        <View style={styles.dropdownMenu}>
                          {['Ada', 'Tidak Ada'].map((opt) => (
                            <TouchableOpacity
                              key={opt}
                              style={[
                                styles.dropdownItem,
                                cosValue === opt && styles.dropdownItemActive
                              ]}
                              onPress={() => {
                                setCosValue(opt);
                                setCosDropdownOpen(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                cosValue === opt && styles.dropdownItemTextActive
                              ]}>
                                {opt}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { zIndex: aresterDropdownOpen ? 1000 : 1 }]}>
                    <Text style={styles.inputLabel}>ARESTER</Text>
                    <View>
                      <TouchableOpacity
                        style={[styles.selectBox, aresterDropdownOpen && styles.selectBoxActive]}
                        onPress={() => {
                          setAresterDropdownOpen(!aresterDropdownOpen);
                          if (!aresterDropdownOpen) setCosDropdownOpen(false);
                        }}
                        activeOpacity={1}
                      >
                        <Text style={styles.selectText}>{aresterValue}</Text>
                        <ChevronDown color={Colors.textMuted} size={16} />
                      </TouchableOpacity>
                      {aresterDropdownOpen && (
                        <View style={styles.dropdownMenu}>
                          {['Ada', 'Tidak Ada'].map((opt) => (
                            <TouchableOpacity
                              key={opt}
                              style={[
                                styles.dropdownItem,
                                aresterValue === opt && styles.dropdownItemActive
                              ]}
                              onPress={() => {
                                setAresterValue(opt);
                                setAresterDropdownOpen(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                aresterValue === opt && styles.dropdownItemTextActive
                              ]}>
                                {opt}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Card 3: Kabel Output KWH */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setKabelExpanded(!kabelExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Kabel Output KWH</Text>
              </View>
              {kabelExpanded ?
                <ChevronUp color={Colors.textMuted} size={20} /> :
                <ChevronDown color={Colors.textMuted} size={20} />
              }
            </TouchableOpacity>

            {kabelExpanded && (
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WARNA R</Text>
                    <TextInput style={styles.inputBox} value={warnaR} onChangeText={setWarnaR} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>LUAS (MM)</Text>
                    <TextInput style={styles.inputBox} value={luasR} onChangeText={setLuasR} keyboardType="numeric" />
                  </View>
                  <View style={[styles.inputGroup, { marginRight: 0 }]}>
                    <Text style={styles.inputLabel}>SUHU (°C)</Text>
                    <TextInput style={styles.inputBox} value={suhuR} onChangeText={setSuhuR} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WARNA S</Text>
                    <TextInput style={styles.inputBox} value={warnaS} onChangeText={setWarnaS} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>LUAS (MM)</Text>
                    <TextInput style={styles.inputBox} value={luasS} onChangeText={setLuasS} keyboardType="numeric" />
                  </View>
                  <View style={[styles.inputGroup, { marginRight: 0 }]}>
                    <Text style={styles.inputLabel}>SUHU (°C)</Text>
                    <TextInput style={styles.inputBox} value={suhuS} onChangeText={setSuhuS} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WARNA T</Text>
                    <TextInput style={styles.inputBox} value={warnaT} onChangeText={setWarnaT} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>LUAS (MM)</Text>
                    <TextInput style={styles.inputBox} value={luasT} onChangeText={setLuasT} keyboardType="numeric" />
                  </View>
                  <View style={[styles.inputGroup, { marginRight: 0 }]}>
                    <Text style={styles.inputLabel}>SUHU (°C)</Text>
                    <TextInput style={styles.inputBox} value={suhuT} onChangeText={setSuhuT} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WARNA N</Text>
                    <TextInput style={styles.inputBox} value={warnaN} onChangeText={setWarnaN} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>LUAS (MM)</Text>
                    <TextInput style={styles.inputBox} value={luasN} onChangeText={setLuasN} keyboardType="numeric" />
                  </View>
                  <View style={[styles.inputGroup, { marginRight: 0 }]}>
                    <Text style={styles.inputLabel}>SUHU (°C)</Text>
                    <TextInput style={styles.inputBox} value={suhuN} onChangeText={setSuhuN} keyboardType="numeric" />
                  </View>
                </View>

                <View style={[styles.row, { marginBottom: 0 }]}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WARNA G</Text>
                    <TextInput style={styles.inputBox} value={warnaG} onChangeText={setWarnaG} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>LUAS (MM)</Text>
                    <TextInput style={styles.inputBox} value={luasG} onChangeText={setLuasG} keyboardType="numeric" />
                  </View>
                  <View style={[styles.inputGroup, { marginRight: 0 }]}>
                    <Text style={styles.inputLabel}>SUHU (°C)</Text>
                    <TextInput style={styles.inputBox} value={suhuG} onChangeText={setSuhuG} keyboardType="numeric" />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Card 4: Foto */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setFotoExpanded(!fotoExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Camera color={Colors.primary} size={20} style={{ marginRight: 8 }} />
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
                      onDelete={() => removePhotoBySection('kwhMeter', index)}
                      dateStr={getPhotoTimestamp(fotoUri)}
                      coordsStr={getPhotoCoordinates(fotoUri) || coordsStr}
                      addressStr={addressStr}
                      label={`KWH Meter #${index + 1}`}
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

          {/* Catatan Section */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Catatan</Text>
            </View>
            <View style={styles.cardBody}>
              <TextInput
                style={[styles.inputBox, { height: 100, textAlignVertical: 'top' }]}
                value={comment}
                onChangeText={setComment}
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
    width: 60,
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
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataLabel: {
    ...Typography.body,
    color: Colors.textMuted,
    flex: 1,
  },
  textInputBold: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  subHeading: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gridLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginRight: 4,
  },
  gridInput: {
    ...Typography.caption,
    color: Colors.text,
    padding: 0,
    margin: 0,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    height: 40,
  },
  selectBoxActive: {
    borderColor: '#3B82F6',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40, // Height of the selectBox
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    ...Shadow.sm,
    zIndex: 9999,
    elevation: 5,
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
  commentContainer: {
    marginBottom: Spacing.lg,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.background,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    ...Typography.body,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
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
