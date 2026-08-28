import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronUp, ChevronDown, Camera, Trash2, Plus, Image as ImageIcon, Clock, MapPin } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, ImagePreviewModal, DynamicPhotoCard } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import { requestCameraPermission, fetchCurrentLocation } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DokumentasiScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    photos,
    addPhoto,
    removePhoto,
    removePhotoBySection,
    currentLocation,
    setCurrentLocation,
    activePopLocation,
    formData,
    getPhotoTimestamp,
  } = useInspectionStore();
  const [fotoExpanded, setFotoExpanded] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Entrance animations
  const contentAnim = useRef(new Animated.Value(0)).current;
  const saveButtonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(contentAnim, {
      toValue: 1,
      friction: 7,
      tension: 45,
      delay: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSavePressIn = () => {
    Animated.spring(saveButtonAnim, { toValue: 0.96, friction: 4, tension: 200, useNativeDriver: true }).start();
  };
  const handleSavePressOut = () => {
    Animated.spring(saveButtonAnim, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true }).start();
  };

  React.useEffect(() => {
    const loadGps = async () => {
      const loc = await fetchCurrentLocation();
      if (loc) setCurrentLocation(loc);
    };
    loadGps();
  }, []);

  const infoPop = formData.infoPop || {};
  const coordsStr = infoPop.koordinat || (currentLocation ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}` : '');
  const addressStr = (infoPop.alamat && infoPop.alamat.trim() !== '') ? infoPop.alamat : (activePopLocation || currentLocation?.address || '-');
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`;

  // Collect all unique photo items across sections
  const allPhotoItems: { uri: string; label: string; sectionKey?: string; indexInSection?: number }[] = [];
  const seenUris = new Set<string>();

  const addPhotoItem = (uri: string, label: string, sectionKey?: string, indexInSection?: number) => {
    if (!uri) return;
    const cleanKey = uri.trim().replace(/^file:\/\//i, '').split('?')[0];
    if (!seenUris.has(cleanKey)) {
      seenUris.add(cleanKey);
      allPhotoItems.push({ uri, label, sectionKey, indexInSection });
    }
  };

  const sectionList = [
    { key: 'kwhMeter', label: 'Foto KWH Meter' },
    { key: 'rectifier', label: 'Foto Rectifier' },
    { key: 'battery', label: 'Foto Battery' },
    { key: 'mechanicalElect', label: 'Foto ME' },
    { key: 'powerSystem', label: 'Foto Power System' },
  ];

  sectionList.forEach((sec) => {
    const secData = formData[sec.key] || {};
    const secPhotos: string[] = secData.photos || secData.fotos || [];
    if (Array.isArray(secPhotos)) {
      secPhotos.forEach((p, idx) => addPhotoItem(p, `${sec.label} #${idx + 1}`, sec.key, idx));
    }
  });

  if (Array.isArray(photos)) {
    photos.forEach((p, idx) => addPhotoItem(p, `Foto Dokumentasi #${idx + 1}`));
  }
  const dok = formData.dokumentasi || {};
  const dokPhotos: string[] = dok.photos || dok.fotos || [];
  if (Array.isArray(dokPhotos)) {
    dokPhotos.forEach((p, idx) => addPhotoItem(p, `Foto Dokumentasi #${idx + 1}`));
  }

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Izin Kamera Ditolak', 'Aplikasi memerlukan izin kamera untuk mengambil foto.');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: false,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Kamera Error', response.errorMessage || 'Tidak dapat membuka kamera pada perangkat ini');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) addPhoto(uri);
        }
      }
    );
  };

  const handlePickGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          response.assets.forEach(asset => {
            if (asset.uri) addPhoto(asset.uri);
          });
        }
      }
    );
  };



  return (
    <View style={styles.container}>
      <Header
        title="Dokumentasi"
        subtitle="Foto Hasil Inspeksi POP"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setFotoExpanded(!fotoExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.cardTitleRow}>
              <Camera color={Colors.primary} size={20} style={{ marginRight: Spacing.sm }} />
              <Text style={styles.cardTitle}>Foto Dokumentasi ({allPhotoItems.length})</Text>
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
                {allPhotoItems.map((item, index) => (
                  <DynamicPhotoCard
                    key={index}
                    uri={item.uri}
                    onPress={() => setSelectedPhoto(item.uri)}
                    onDelete={() => {
                      if (item.sectionKey && item.indexInSection !== undefined) {
                        removePhotoBySection(item.sectionKey, item.indexInSection);
                      } else {
                        const globalIdx = photos.indexOf(item.uri);
                        if (globalIdx !== -1) removePhoto(globalIdx);
                      }
                    }}
                    dateStr={getPhotoTimestamp(item.uri)}
                    coordsStr={coordsStr}
                    addressStr={addressStr}
                    label={item.label}
                  />
                ))}

                {/* Add Photo options */}
                <TouchableOpacity
                  style={styles.photoUploadBoxWrapper}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <View style={styles.photoUploadBoxAdd}>
                    <Camera color={Colors.primary} size={28} style={{ marginBottom: 6 }} />
                    <Text style={styles.photoUploadText}>Kamera</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoUploadBoxWrapper}
                  onPress={handlePickGallery}
                  activeOpacity={0.7}
                >
                  <View style={styles.photoUploadBoxAdd}>
                    <ImageIcon color={Colors.textMuted} size={28} style={{ marginBottom: 6 }} />
                    <Text style={styles.photoUploadText}>Galeri</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Animated.View style={{ transform: [{ scale: saveButtonAnim }] }}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.goBack()}
            onPressIn={handleSavePressIn}
            onPressOut={handleSavePressOut}
            activeOpacity={1}
          >
            <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Fullscreen Photo Viewer Modal */}
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
    borderColor: Colors.glassBorder,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
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
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: 'bold',
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
  timestampOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
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
});
