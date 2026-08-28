/**
 * Asset Detail Screen
 * View full asset info and maintenance history
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {Card, Header, StatusBadge, Button} from '../../components/common';
import database from '../../database';
import {Asset, Inspection} from '../../database/models';
import {formatDate, getCategoryIcon, getRelativeTime, cleanInspectorName} from '../../utils/helpers';
import type {RootStackParamList} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AssetDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const {assetId} = route.params;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAssetData();
    }, [assetId]),
  );

  const loadAssetData = async () => {
    try {
      const assetData = await database.get<Asset>('assets').find(assetId);
      setAsset(assetData);

      const inspectionData = await database
        .get<Inspection>('inspections')
        .query()
        .fetch();
      const assetInspections = inspectionData
        .filter((i: Inspection) => i.assetId === assetId)
        .sort((a: Inspection, b: Inspection) => b.inspectionDate - a.inspectionDate);
      setInspections(assetInspections);
    } catch (error) {
      console.error('Error loading asset:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Aset',
      'Apakah Anda yakin ingin menghapus aset ini? Semua data terkait juga akan dihapus.',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await (asset as any).markAsDeleted();
              });
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting asset:', error);
            }
          },
        },
      ],
    );
  };

  if (!asset) {
    return (
      <View style={styles.container}>
        <Header title="Loading..." onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const specs = asset.specs;

  return (
    <View style={styles.container}>
      <Header
        title={asset.assetCode}
        subtitle={asset.name}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddAsset', {assetId: (asset as any).id})}
            style={styles.editButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroCategoryIcon}>
              {getCategoryIcon(asset.category)}
            </Text>
          </View>
          <Text style={styles.heroName}>{asset.name}</Text>
          <StatusBadge status={asset.status} />
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Aset</Text>
          <Card style={styles.infoCard}>
            <InfoRow label="Kode Aset" value={asset.assetCode} />
            <InfoRow label="Kategori" value={asset.categoryLabel} />
            <InfoRow label="Lokasi" value={asset.location} />
            <InfoRow label="Manufacturer" value={asset.manufacturer} />
            <InfoRow label="Model" value={asset.assetModel} />
            <InfoRow label="Serial Number" value={asset.serialNumber} />
            <InfoRow
              label="Tanggal Instalasi"
              value={formatDate(asset.installDate)}
              isLast
            />
          </Card>
        </View>

        {/* Specifications */}
        {Object.keys(specs).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spesifikasi Teknis</Text>
            <Card style={styles.infoCard}>
              {Object.entries(specs).map(([key, value], index, arr) => (
                <InfoRow
                  key={key}
                  label={key}
                  value={value}
                  isLast={index === arr.length - 1}
                />
              ))}
            </Card>
          </View>
        )}

        {/* Start PM Button */}
        <View style={styles.section}>
          <Button
            title="🔧  Mulai PM untuk Aset Ini"
            onPress={() =>
              navigation.navigate('CapturePhoto', {assetId: (asset as any).id})
            }
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

        {/* Inspection History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Riwayat PM ({inspections.length})
          </Text>
          {inspections.length === 0 ? (
            <Card style={styles.emptyHistory}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>
                Belum ada riwayat
              </Text>
            </Card>
          ) : (
            inspections.map((inspection) => (
              <Card
                key={(inspection as any).id}
                style={styles.historyCard}
                onPress={() =>
                  navigation.navigate('InspectionDetail', {
                    inspectionId: (inspection as any).id,
                  })
                }>
                <View style={styles.historyContent}>
                  <View>
                    <Text style={styles.historyType}>
                      {inspection.typeLabel}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(inspection.inspectionDate)}
                    </Text>
                    <Text style={styles.historyInspector}>
                      👤 {cleanInspectorName(inspection.inspectorName)}
                    </Text>
                  </View>
                  <StatusBadge status={inspection.status} size="sm" />
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Delete Button */}
        <View style={styles.section}>
          <Button
            title="Hapus Aset"
            onPress={handleDelete}
            variant="ghost"
            size="sm"
            textStyle={{color: Colors.danger}}
          />
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

// Info row sub-component
const InfoRow: React.FC<{
  label: string;
  value: string;
  isLast?: boolean;
}> = ({label, value, isLast = false}) => (
  <View
    style={[
      infoRowStyles.row,
      !isLast && infoRowStyles.rowBorder,
    ]}>
    <Text style={infoRowStyles.label}>{label}</Text>
    <Text style={infoRowStyles.value}>{value || '-'}</Text>
  </View>
);

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  value: {
    ...Typography.label,
    color: Colors.text,
    flex: 1.5,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 18,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.glassBorder,
  },
  heroCategoryIcon: {
    fontSize: 36,
  },
  heroName: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  infoCard: {},
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  historyCard: {
    marginBottom: Spacing.sm,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyType: {
    ...Typography.label,
    color: Colors.text,
  },
  historyDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyInspector: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
