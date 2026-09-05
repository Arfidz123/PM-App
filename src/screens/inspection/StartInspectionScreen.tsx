/**
 * Start Inspection (Camera + GPS Detection) Screen
 * Opens system camera/gallery to take a photo of POP and automatically detects closest POP within 100 meters via GPS
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { showAlert } from '../../components/common';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import { getDistance } from 'geolib';
import { Camera as CameraIcon, MapPin, Image as ImageIcon, Building2, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import database from '../../database';
import { Asset, ChecklistItem } from '../../database/models';
import { useInspectionStore } from '../../store/inspectionStore';
import { requestCameraPermission, requestLocationPermission, cleanPopId, cleanPopName } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NearbyPopItem {
  asset: Asset;
  distance: number;
}

export const StartInspectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [detecting, setDetecting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [nearbyPops, setNearbyPops] = useState<NearbyPopItem[]>([]);
  const [showMultiPopModal, setShowMultiPopModal] = useState(false);

  const {
    setActivePop,
    setCurrentLocation,
    setChecklistEntries,
    setAsset,
    addPhoto,
  } = useInspectionStore();

  React.useEffect(() => {
    handleOpenCamera();
  }, []);

  const applySelectedPop = async (selectedAsset: Asset, photoUri?: string) => {
    try {
      setShowMultiPopModal(false);
      setDetecting(true);
      setLoadingMsg(`Menyiapkan data: ${cleanPopName(selectedAsset.name)}...`);

      const templateItems = await database
        .get<ChecklistItem>('checklist_items')
        .query()
        .fetch();

      const assetTemplateItems = templateItems.filter(
        (item) => item.templateId === selectedAsset?.checklistTemplateId
      );

      const entries = assetTemplateItems.map((item) => ({
        templateItemId: (item as any).id,
        category: item.category,
        label: item.label,
        type: item.type,
        unit: item.unit,
        options: item.options ? JSON.parse(item.options) : [],
        minValue: item.minValue,
        maxValue: item.maxValue,
        required: item.isRequired,
        status: 'na' as any,
        value: '',
        photoPath: '',
        notes: '',
        order: item.sortOrder,
      }));

      setChecklistEntries(entries);
      setActivePop(selectedAsset.assetCode, selectedAsset.name, selectedAsset.location, selectedAsset.specifications);
      setAsset((selectedAsset as any).id);

      if (photoUri) {
        addPhoto(photoUri);
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 300));
      setDetecting(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error applying selected POP:', error);
      setDetecting(false);
      navigation.goBack();
    }
  };

  const processGpsDetection = async (photoUri?: string) => {
    setDetecting(true);
    setLoadingMsg('Mendapatkan lokasi GPS...');

    await requestLocationPermission();

    const fetchPosition = (enableHighAcc: boolean): Promise<{ latitude: number; longitude: number }> => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: enableHighAcc, timeout: 10000, maximumAge: 0 }
        );
      });
    };

    let coords: { latitude: number; longitude: number } | null = null;
    try {
      coords = await fetchPosition(true);
    } catch (err1) {
      console.log('High accuracy GPS failed, trying network location...', err1);
      try {
        coords = await fetchPosition(false);
      } catch (err2) {
        console.log('Network location failed as well', err2);
      }
    }

    if (coords) {
      const { latitude, longitude } = coords;
      const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setCurrentLocation({ lat: latitude, lng: longitude });

      if (photoUri) {
        addPhoto(photoUri, undefined, coordsStr);
      }

      setLoadingMsg('Mencari POP terdekat dalam radius 100m...');

      try {
        const assets = await database.get<Asset>('assets').query().fetch();

        const matchedPops: NearbyPopItem[] = [];
        for (const asset of assets) {
          if (asset.latitude && asset.longitude) {
            const distance = getDistance(
              { latitude, longitude },
              { latitude: asset.latitude, longitude: asset.longitude }
            );
            // Jarak deteksi dibatasi 100 meter
            if (distance <= 100) {
              matchedPops.push({ asset, distance });
            }
          }
        }

        matchedPops.sort((a, b) => a.distance - b.distance);

        // Jika ditemukan 1 POP
        if (matchedPops.length === 1) {
          const singlePop = matchedPops[0];
          setDetecting(false);

          showAlert({
            type: 'success',
            title: 'POP Terdeteksi!',
            message: `Terdeteksi via GPS:\n${cleanPopName(singlePop.asset.name)} (${cleanPopId(singlePop.asset.assetCode)})\nJarak: ${singlePop.distance} meter`,
            buttons: [
              {
                text: 'Pilih POP Lain',
                style: 'cancel',
                onPress: () => navigation.replace('SelectPop'),
              },
              {
                text: 'Lanjutkan',
                onPress: () => applySelectedPop(singlePop.asset, photoUri),
              },
            ],
          });
          return;
        }

        // Jika ditemukan lebih dari 1 POP dalam 100m
        if (matchedPops.length > 1) {
          setNearbyPops(matchedPops);
          setDetecting(false);
          setShowMultiPopModal(true);
          return;
        }
      } catch (error) {
        console.error('Error during GPS matching:', error);
      }
    } else {
      if (photoUri) {
        addPhoto(photoUri);
      }
    }

    setDetecting(false);
    showAlert({
      type: 'warning',
      title: 'Lokasi Tidak Cocok',
      message: 'Lokasi GPS Anda tidak berada dalam radius 100 meter dari POP manapun. Silakan pilih POP secara manual.',
      buttons: [
        {
          text: 'Batal',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Pilih POP',
          onPress: () => navigation.replace('SelectPop'),
        },
      ],
    });
  };

  const handleOpenCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showAlert({
        type: 'error',
        title: 'Izin Kamera Ditolak',
        message: 'Aplikasi memerlukan izin kamera untuk fitur ini.',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
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
      (response) => {
        if (response.didCancel) {
          navigation.goBack();
        } else if (response.errorCode) {
          showAlert({
            type: 'error',
            title: 'Error Kamera',
            message: response.errorMessage || 'Gagal membuka kamera pada perangkat ini',
            buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
          });
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            setCapturedPhotoUri(uri);
            processGpsDetection(uri);
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.detectingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.detectingText}>{loadingMsg || 'Membuka Kamera...'}</Text>
        <View style={styles.locationBadge}>
          <MapPin color={Colors.info} size={16} />
          <Text style={styles.locationText}>Radius Deteksi GPS: 100 Meter</Text>
        </View>
      </View>

      {/* Modal Pilihan Multi-POP Terdekat */}
      <Modal
        visible={showMultiPopModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowMultiPopModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Building2 color={Colors.primary} size={24} />
              </View>
              <Text style={styles.modalTitle}>Pilih POP Terdekat</Text>
              <Text style={styles.modalSubtitle}>
                Ditemukan {nearbyPops.length} POP dalam radius 100 meter dari posisi Anda:
              </Text>
            </View>

            <FlatList
              data={nearbyPops}
              keyExtractor={(item) => (item.asset as any).id || item.asset.assetCode}
              style={styles.popList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.popCard}
                  activeOpacity={0.75}
                  onPress={() => applySelectedPop(item.asset, capturedPhotoUri || undefined)}
                >
                  <View style={styles.popCardLeft}>
                    <Text style={styles.popCardName}>{cleanPopName(item.asset.name)}</Text>
                    <Text style={styles.popCardCode}>{cleanPopId(item.asset.assetCode)}</Text>
                    {item.asset.location ? (
                      <Text style={styles.popCardLocation} numberOfLines={1}>{item.asset.location}</Text>
                    ) : null}
                  </View>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{item.distance}m</Text>
                    <ChevronRight color={Colors.primary} size={16} />
                  </View>
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.selectManualBtn}
                onPress={() => {
                  setShowMultiPopModal(false);
                  navigation.replace('SelectPop');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.selectManualText}>Pilih POP Lainnya dari Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  detectingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    width: '100%',
    ...Shadow.lg,
  },
  detectingText: {
    color: Colors.white,
    ...Typography.h4,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  locationText: {
    color: Colors.info,
    ...Typography.caption,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },

  // Multi-POP Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    width: '100%',
    maxHeight: '80%',
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  popList: {
    marginVertical: Spacing.sm,
  },
  popCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  popCardLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  popCardName: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  popCardCode: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  popCardLocation: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 2,
  },
  distanceText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalFooter: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: Spacing.md,
  },
  selectManualBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  selectManualText: {
    color: Colors.primary,
    ...Typography.button,
    fontSize: 13,
  },
});
