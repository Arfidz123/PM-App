/**
 * Asset List Screen
 * Browse all registered assets with search and filter
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {Card, StatusBadge, EmptyState} from '../../components/common';
import database from '../../database';
import {Asset} from '../../database/models';
import {getCategoryIcon} from '../../utils/helpers';
import type {RootStackParamList, AssetCategory} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: {key: AssetCategory | 'all'; label: string}[] = [
  {key: 'all', label: 'Semua'},
  {key: 'hvac', label: '❄️ HVAC'},
  {key: 'cooling', label: '🧊 Cooling'},
  {key: 'electrical', label: '⚡ Listrik'},
  {key: 'other', label: '🔩 Lainnya'},
];

export const AssetListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const loadAssets = useCallback(async () => {
    try {
      const allAssets = await database.get<Asset>('assets').query().fetch();
      setAssets(allAssets);
      filterAssets(allAssets, searchQuery, activeCategory);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }, [searchQuery, activeCategory]);

  useFocusEffect(
    useCallback(() => {
      loadAssets();
    }, [loadAssets]),
  );

  const filterAssets = (
    assetList: Asset[],
    query: string,
    category: string,
  ) => {
    let filtered = assetList;

    if (category !== 'all') {
      filtered = filtered.filter((a) => a.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetCode.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q),
      );
    }

    setFilteredAssets(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterAssets(assets, text, activeCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
    filterAssets(assets, searchQuery, category);
  };

  const renderAssetCard = ({item}: {item: Asset}) => (
    <Card
      style={styles.assetCard}
      onPress={() => navigation.navigate('AssetDetail', {assetId: (item as any).id})}>
      <View style={styles.assetCardContent}>
        <View style={styles.assetCardLeft}>
          <Text style={styles.assetIcon}>{getCategoryIcon(item.category)}</Text>
        </View>
        <View style={styles.assetCardCenter}>
          <Text style={styles.assetCode}>{item.assetCode}</Text>
          <Text style={styles.assetName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.assetLocation} numberOfLines={1}>
            📍 {item.location}
          </Text>
        </View>
        <View style={styles.assetCardRight}>
          <StatusBadge status={item.status} size="sm" />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari aset, kode, atau lokasi..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeCategory === item.key && styles.filterChipActive,
              ]}
              onPress={() => handleCategoryFilter(item.key)}>
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === item.key && styles.filterChipTextActive,
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Asset List */}
      <FlatList
        data={filteredAssets}
        renderItem={renderAssetCard}
        keyExtractor={(item) => (item as any).id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🏭"
            title="Belum Ada Aset"
            message="Tambahkan aset pertama untuk memulai preventive maintenance"
            actionLabel="Tambah Aset"
            onAction={() => navigation.navigate('AddAsset', {})}
          />
        }
        ListFooterComponent={<View style={{height: 100}} />}
      />

      {/* FAB - Add Asset */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAsset', {})}
        activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  clearIcon: {
    color: Colors.textMuted,
    fontSize: 16,
    padding: Spacing.sm,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  filterChipText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  assetCard: {
    marginBottom: Spacing.md,
  },
  assetCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetCardLeft: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  assetIcon: {
    fontSize: 24,
  },
  assetCardCenter: {
    flex: 1,
  },
  assetCode: {
    ...Typography.overline,
    color: Colors.info,
    marginBottom: 2,
  },
  assetName: {
    ...Typography.label,
    color: Colors.text,
  },
  assetLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  assetCardRight: {
    marginLeft: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 30,
  },
});
