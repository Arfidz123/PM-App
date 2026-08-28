import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, MapPin, CheckCircle2, XCircle, Building2 } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header } from '../../components/common';
import LinearGradient from 'react-native-linear-gradient';
import database from '../../database';
import { Asset } from '../../database/models';
import { useInspectionStore } from '../../store/inspectionStore';
import { cleanPopId, cleanPopName } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';
import { POP_SEED_DATA } from '../../database/popSeedData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SelectPopScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [pops, setPops] = useState<Asset[]>([]);
  const [filteredPops, setFilteredPops] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { activePopId, setActivePop, setAsset } = useInspectionStore();

  useEffect(() => {
    loadPops();
  }, []);

  useEffect(() => {
    let result = pops;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (pop) =>
          pop.name.toLowerCase().includes(query) ||
          pop.assetCode.toLowerCase().includes(query) ||
          pop.location.toLowerCase().includes(query)
      );
    }

    // Default sort: by Category, then by Name
    result = [...result].sort((a, b) => {
      const catCompare = (a.category || '').localeCompare(b.category || '');
      if (catCompare !== 0) return catCompare;
      return a.name.localeCompare(b.name);
    });

    setFilteredPops(result);
  }, [pops, searchQuery]);

  const loadPops = async () => {
    try {
      const assets = await database.get<Asset>('assets').query().fetch();
      const assetsCollection = database.get<Asset>('assets');
      
      const existingAssetsMap = new Map<string, Asset>(assets.map(a => [a.assetCode, a]));
      const batchOps: any[] = [];
      
      POP_SEED_DATA.forEach(pop => {
        const existing = existingAssetsMap.get(pop.asset_code);
        const newLat = (pop as any).latitude ?? null;
        const newLng = (pop as any).longitude ?? null;
        const newCat = (pop.category || 'other') as any;
        const newLoc = pop.location || '';
        const newSpecs = pop.specifications || '';
        const newName = pop.name;

        if (existing) {
          if (
            existing.latitude !== newLat || 
            existing.longitude !== newLng ||
            existing.category !== newCat ||
            existing.location !== newLoc ||
            existing.specifications !== newSpecs ||
            existing.name !== newName
          ) {
            batchOps.push(
              existing.prepareUpdate(a => {
                a.latitude = newLat;
                a.longitude = newLng;
                a.category = newCat;
                a.location = newLoc;
                a.specifications = newSpecs;
                a.name = newName;
              })
            );
          }
        } else {
          batchOps.push(
            assetsCollection.prepareCreate(asset => {
              asset.assetCode = pop.asset_code;
              asset.name = newName;
              asset.category = newCat;
              asset.location = newLoc;
              asset.latitude = newLat;
              asset.longitude = newLng;
              asset.manufacturer = '';
              asset.assetModel = '';
              asset.serialNumber = '';
              asset.installDate = Date.now();
              asset.qrCode = '';
              asset.photoPath = '';
              asset.specifications = newSpecs;
              asset.checklistTemplateId = '';
              asset.status = 'active';
            })
          );
        }
      });
      
      if (batchOps.length > 0) {
        console.log(`Syncing ${batchOps.length} POPs to database...`);
        await database.write(async () => {
          await database.batch(...batchOps);
        });
      }

      const updatedAssets = await database.get<Asset>('assets').query().fetch();
      const uniqueAssetsMap = new Map<string, Asset>();
      updatedAssets.forEach(asset => {
        if (!uniqueAssetsMap.has(asset.assetCode)) {
          uniqueAssetsMap.set(asset.assetCode, asset);
        }
      });
      
      setPops(Array.from(uniqueAssetsMap.values()));
      
    } catch (error) {
      console.error('Error loading POPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSelectPop = (pop: Asset) => {
    setActivePop(pop.assetCode, pop.name, pop.location, pop.specifications);
    setAsset(pop.id);
    navigation.goBack();
  };

  const renderPopItem = ({ item }: { item: Asset }) => {
    const isActive = activePopId === item.assetCode;

    return (
      <TouchableOpacity
        style={[styles.popItem, isActive && styles.popItemActive]}
        onPress={() => handleSelectPop(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.popItemIcon, isActive && styles.popItemIconActive]}>
          <Building2 color={isActive ? Colors.primary : Colors.textMuted} size={22} />
        </View>
        <View style={styles.popItemContent}>
          <Text style={[styles.popItemName, isActive && styles.popItemNameActive]}>
            {cleanPopName(item.name)}
          </Text>
          <View style={styles.popItemMetaRow}>
            <Text style={styles.popItemCode}>{cleanPopId(item.assetCode)}</Text>
            {item.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            ) : null}
          </View>
          {item.location ? (
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
              <Text style={styles.popItemLocation} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}
        </View>
        {isActive && (
          <View style={styles.popItemCheck}>
            <CheckCircle2 color={Colors.primary} size={22} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Shared Header with Embedded Search Bar */}
      <Header
        title="Pilih POP"
        subtitle={`${filteredPops.length} POP tersedia`}
        onBack={() => navigation.goBack()}
      >
        <View
          style={[
            styles.searchInputWrapper,
            isSearchFocused && styles.searchInputWrapperFocused,
          ]}
        >
          <Search
            color={isSearchFocused ? Colors.primary : Colors.textMuted}
            size={18}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama POP, ID, atau lokasi..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
              <XCircle size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </Header>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat data POP...</Text>
        </View>
      ) : filteredPops.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Tidak ada POP yang ditemukan</Text>
          {pops.length === 0 && (
            <Text style={styles.emptySubText}>
              Anda belum melakukan Sync Master Data POP di menu Home.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPops}
          keyExtractor={(item) => item.id}
          renderItem={renderPopItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Shadow.sm,
  },
  searchInputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: 0,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  popItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.sm,
  },
  popItemActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  popItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  popItemIconActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  popItemContent: {
    flex: 1,
  },
  popItemName: {
    ...Typography.h4,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  popItemNameActive: {
    color: Colors.primaryLight,
  },
  popItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  popItemCode: {
    ...Typography.overline,
    color: Colors.primary,
    letterSpacing: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popItemLocation: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    flex: 1,
  },
  popItemCheck: {
    marginLeft: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
