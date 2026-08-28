/**
 * Start Inspection (Camera + GPS Detection) Screen
 * Opens system camera/gallery to take a photo of POP and automatically detects closest POP via GPS
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import { getDistance } from 'geolib';
import { Camera as CameraIcon, MapPin, Image as ImageIcon, ChevronLeft, Search } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import database from '../../database';
import { Asset, ChecklistItem } from '../../database/models';
import { useInspectionStore } from '../../store/inspectionStore';
import { requestCameraPermission, requestLocationPermission, cleanPopId, cleanPopName } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const StartInspectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [detecting, setDetecting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

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

  const processGpsDetection = async (photoUri?: string) => {
    setDetecting(true);
    setLoadingMsg('Mendapatkan lokasi GPS...');

    await requestLocationPermission();

    const fetchPosition = (enableHighAcc: boolean): Promise<{ latitude: number; longitude: number }> => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: enableHighAcc, timeout: 10000, maximumAge: 10000 }
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
      setCurrentLocation({ lat: latitude, lng: longitude });

      setLoadingMsg('Mencari POP terdekat...');

      try {
        const assets = await database.get<Asset>('assets').query().fetch();
        let closestAsset: Asset | null = null;
        let minDistance = Infinity;

        for (const asset of assets) {
          if (asset.latitude && asset.longitude) {
            const distance = getDistance(
              { latitude, longitude },
              { latitude: asset.latitude, longitude: asset.longitude }
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestAsset = asset;
            }
          }
        }

        if (photoUri) addPhoto(photoUri);

        // Accept GPS match if within 500 meters
        if (closestAsset && minDistance <= 500) {
          setLoadingMsg(`POP Ditemukan: ${cleanPopName(closestAsset.name)}`);

          const templateItems = await database
            .get<ChecklistItem>('checklist_items')
            .query()
            .fetch();

          const assetTemplateItems = templateItems.filter(
            (item) => item.templateId === closestAsset?.checklistTemplateId
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
          setActivePop(closestAsset.assetCode, closestAsset.name, closestAsset.location, closestAsset.specifications);
          setAsset((closestAsset as any).id);

          await new Promise<void>((resolve) => setTimeout(resolve, 600));
          setDetecting(false);

          Alert.alert(
            'POP Terdeteksi!',
            `Terdeteksi via GPS:\n${cleanPopName(closestAsset.name)} (${cleanPopId(closestAsset.assetCode)})\nJarak: ${minDistance} meter`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }

    setDetecting(false);
    if (photoUri) addPhoto(photoUri);
    Alert.alert(
      'Foto Disimpan',
      'Lokasi GPS tidak terdeteksi atau tidak pas dengan koordinat POP. Silakan pilih POP target dari daftar.',
      [
        {
          text: 'Pilih POP',
          onPress: () => navigation.replace('SelectPop'),
        },
        { text: 'Batal', style: 'cancel' },
      ]
    );
  };

  const handleOpenCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Izin Kamera Ditolak', 'Aplikasi memerlukan izin kamera untuk fitur ini.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
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
        if (response.didCancel) {
          console.log('User cancelled camera');
          navigation.goBack();
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error Kamera', response.errorMessage || 'Gagal membuka kamera pada perangkat ini', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
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

  const handleOpenGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          Alert.alert('Error Galeri', response.errorMessage || 'Gagal membuka galeri');
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
          <Text style={styles.locationText}>Mendeteksi Koordinat GPS</Text>
        </View>
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
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.white,
    ...Typography.body,
    marginLeft: 4,
  },
  headerTitle: {
    color: Colors.white,
    ...Typography.h4,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  cameraBoxContainer: {
    width: '100%',
    height: 280,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraPreviewContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  cameraTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  cameraHelperText: {
    color: Colors.textMuted,
    textAlign: 'center',
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  mainActionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  cameraBtn: {
    backgroundColor: Colors.primary,
  },
  galleryBtn: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  mainActionText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: 'bold',
  },
  selectManuallyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  selectManuallyText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  detectingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    width: '100%',
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
  },
});
