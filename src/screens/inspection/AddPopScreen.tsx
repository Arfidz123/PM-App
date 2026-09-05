import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Building2,
  Tag,
  MapPin,
  Navigation,
  Check,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header, showAlert } from '../../components/common';
import database from '../../database';
import { Asset } from '../../database/models';
import { useInspectionStore } from '../../store/inspectionStore';
import { fetchCurrentLocation } from '../../utils/helpers';
import { upsertAssetToSupabase } from '../../services/supabaseDb';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AddPopScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setActivePop } = useInspectionStore();

  const [idPop, setIdPop] = useState('');
  const [namaPop, setNamaPop] = useState('');
  const [tipePop, setTipePop] = useState('');
  const [alamat, setAlamat] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle GPS location fetch
  const handleGetLiveLocation = async () => {
    setIsFetchingGps(true);
    try {
      const loc = await fetchCurrentLocation();
      if (loc) {
        setLatitude(loc.lat.toFixed(6));
        setLongitude(loc.lng.toFixed(6));

        // If address is still empty and reverse geocoded address is found, auto fill it
        if (!alamat.trim() && loc.address) {
          setAlamat(loc.address);
        }

        showAlert({
          type: 'success',
          title: 'Lokasi Ditemukan',
          message: `Koordinat GPS berhasil disematkan: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`,
        });
      } else {
        showAlert({
          type: 'warning',
          title: 'GPS Tidak Terdeteksi',
          message: 'Pastikan izin lokasi dan GPS aktif pada perangkat Anda.',
        });
      }
    } catch (err) {
      console.error('Error fetching GPS for new POP:', err);
      showAlert({
        type: 'error',
        title: 'Gagal Mengambil Lokasi',
        message: 'Terjadi kesalahan saat mendeteksi titik koordinat GPS.',
      });
    } finally {
      setIsFetchingGps(false);
    }
  };

  const handleSavePop = async () => {
    const trimmedId = idPop.trim();
    const trimmedNama = namaPop.trim();
    const finalTipe = tipePop.trim();
    const trimmedAlamat = alamat.trim();
    const parsedLat = latitude ? parseFloat(latitude) : null;
    const parsedLng = longitude ? parseFloat(longitude) : null;

    if (!trimmedId) {
      showAlert({
        type: 'warning',
        title: 'ID POP Wajib Diisi',
        message: 'Harap masukkan ID atau Kode POP (contoh: POP_1KDI10022).',
      });
      return;
    }

    if (!trimmedNama) {
      showAlert({
        type: 'warning',
        title: 'Nama POP Wajib Diisi',
        message: 'Harap masukkan Nama POP (contoh: POP Kendari).',
      });
      return;
    }

    if (!finalTipe) {
      showAlert({
        type: 'warning',
        title: 'Tipe POP Wajib Diisi',
        message: 'Harap masukkan Tipe POP (contoh: POP A / POP B / POP D).',
      });
      return;
    }

    setIsSaving(true);

    try {
      // 1. Check if assetCode already exists in local DB
      const existingAssets = await database.get<Asset>('assets').query().fetch();
      const isDuplicate = existingAssets.some(
        (a) => a.assetCode.toLowerCase() === trimmedId.toLowerCase()
      );

      if (isDuplicate) {
        showAlert({
          type: 'error',
          title: 'ID POP Sudah Digunakan',
          message: `ID POP "${trimmedId}" sudah terdaftar dalam sistem. Gunakan ID yang lain.`,
        });
        setIsSaving(false);
        return;
      }

      // 2. Prepare specifications JSON
      const specsObj = {
        tipe_pop: [finalTipe],
        tipe: finalTipe,
        address: trimmedAlamat,
        latitude: parsedLat,
        longitude: parsedLng,
        created_locally: true,
      };

      // 3. Save to WatermelonDB (Local SQLite)
      let createdAsset: Asset | null = null;
      await database.write(async () => {
        createdAsset = await database.get<Asset>('assets').create((asset) => {
          asset.assetCode = trimmedId;
          asset.name = trimmedNama;
          asset.category = 'other';
          asset.location = trimmedAlamat;
          asset.latitude = parsedLat || undefined;
          asset.longitude = parsedLng || undefined;
          asset.manufacturer = '';
          asset.assetModel = '';
          asset.serialNumber = '';
          asset.installDate = Date.now();
          asset.qrCode = '';
          asset.photoPath = '';
          asset.specifications = JSON.stringify(specsObj);
          asset.checklistTemplateId = '';
          asset.status = 'active';
        });
      });

      // 4. Sync to Supabase in Background (Cloud persistence)
      try {
        await upsertAssetToSupabase({
          id: trimmedId,
          asset_code: trimmedId,
          name: trimmedNama,
          category: 'other',
          location: trimmedAlamat,
          latitude: parsedLat,
          longitude: parsedLng,
          specifications: specsObj,
          status: 'active',
        });
        console.log(`Successfully synced new POP ${trimmedId} to Supabase`);
      } catch (cloudErr) {
        console.warn(
          'POP saved to local DB. Cloud sync will continue when online:',
          cloudErr
        );
      }

      // 5. Success Dialog with Direct Inspection Action
      showAlert({
        type: 'success',
        title: 'POP Berhasil Disimpan!',
        message: `POP ${trimmedNama} (${trimmedId}) telah tersimpan secara permanen dan siap diinspeksi.`,
        buttons: [
          {
            text: 'Daftar POP',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Mulai Inspeksi',
            style: 'default',
            onPress: () => {
              setActivePop(trimmedId, trimmedNama, trimmedAlamat);
              navigation.replace('InfoPop');
            },
          },
        ],
      });
    } catch (err) {
      console.error('Error saving new POP:', err);
      showAlert({
        type: 'error',
        title: 'Gagal Menyimpan POP',
        message: 'Terjadi kesalahan saat menyimpan data ke database perangkat.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Tambah POP Baru" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Informasi Utama */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building2 size={20} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Informasi Utama POP</Text>
          </View>

          {/* Field: ID POP */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              ID POP <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: POP_1KDI10022"
              placeholderTextColor={Colors.textMuted}
              value={idPop}
              onChangeText={setIdPop}
              autoCapitalize="characters"
            />
            <Text style={styles.fieldHint}>
              identitas unik untuk POP yang baru dibuat.
            </Text>
          </View>

          {/* Field: Nama POP */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Nama POP <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: POP Kendari"
              placeholderTextColor={Colors.textMuted}
              value={namaPop}
              onChangeText={setNamaPop}
            />
          </View>

          {/* Field: Tipe POP (Input Manual) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Tipe POP <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: POP A"
              placeholderTextColor={Colors.textMuted}
              value={tipePop}
              onChangeText={setTipePop}
            />
          </View>
        </View>

        {/* Card: Lokasi & Koordinat */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Lokasi & Titik Koordinat</Text>
          </View>

          {/* Field: Alamat */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Alamat Lengkap</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Masukkan alamat lengkap lokasi POP..."
              placeholderTextColor={Colors.textMuted}
              value={alamat}
              onChangeText={setAlamat}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Tombol Ambil Lokasi GPS Saat Ini */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleGetLiveLocation}
            disabled={isFetchingGps}
            activeOpacity={0.75}
          >
            {isFetchingGps ? (
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            ) : (
              <Navigation size={18} color="#ffffff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.gpsButtonText}>
              {isFetchingGps
                ? 'Mendeteksi Satelit GPS...'
                : 'Ambil Titik Lokasi GPS Saat Ini'}
            </Text>
          </TouchableOpacity>

          {/* Field: Latitude & Longitude */}
          <View style={styles.coordsRow}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                placeholder="-6.200000"
                placeholderTextColor={Colors.textMuted}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                placeholder="106.816666"
                placeholderTextColor={Colors.textMuted}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Tombol Simpan POP */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePop}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
          ) : (
            <Save size={20} color="#ffffff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Menyimpan ke Database...' : 'Simpan POP Baru'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  cardTitle: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  requiredMark: {
    color: Colors.danger,
  },
  fieldHint: {
    ...Typography.caption,
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    color: Colors.text,
    fontSize: 13,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
  },
  multilineInput: {
    minHeight: 70,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  gpsButtonText: {
    ...Typography.caption,
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    ...Shadow.md,
  },
  saveButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
