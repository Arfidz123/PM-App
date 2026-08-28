/**
 * Inspection Detail Screen
 * Premium view of complete inspection details with animated sections
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Animated,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  MapPin,
  Calendar,
  User,
  FileText,
  Share2,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  ClipboardList,
  Eye,
} from 'lucide-react-native';

import {Colors, Typography, Spacing, BorderRadius, Shadow, FontFamily} from '../../theme';
import {Button, StatusBadge} from '../../components/common';
import database from '../../database';
import {Inspection, InspectionItem, Asset} from '../../database/models';
import {formatDate, cleanPopId, cleanPopName, cleanInspectorName, sharePdfFile} from '../../utils/helpers';
import type {RootStackParamList} from '../../types';
import {TouchableOpacity} from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ok':
      return <CheckCircle2 size={16} color={Colors.success} />;
    case 'warning':
      return <AlertTriangle size={16} color={Colors.warning} />;
    case 'critical':
      return <XCircle size={16} color={Colors.danger} />;
    default:
      return <Minus size={16} color={Colors.textMuted} />;
  }
};

export const InspectionDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const {inspectionId} = route.params;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [hasFormData, setHasFormData] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.stagger(200, [
      Animated.spring(headerAnim, {toValue: 1, friction: 8, tension: 40, useNativeDriver: true}),
      Animated.spring(contentAnim, {toValue: 1, friction: 8, tension: 40, useNativeDriver: true}),
    ]).start();
  }, [inspectionId]);

  const loadData = async () => {
    try {
      const insp = await database
        .get<Inspection>('inspections')
        .find(inspectionId);
      setInspection(insp);

      // Check if formData is available
      if (insp.formData) {
        try {
          const parsed = JSON.parse(insp.formData);
          setHasFormData(parsed && Object.keys(parsed).length > 0);
        } catch {
          setHasFormData(false);
        }
      }

      const inspItems = await database
        .get<InspectionItem>('inspection_items')
        .query()
        .fetch();
      const filtered = inspItems
        .filter((i: InspectionItem) => i.inspectionId === inspectionId)
        .sort((a: InspectionItem, b: InspectionItem) => a.sortOrder - b.sortOrder);
      setItems(filtered);

      // Try to find asset by WatermelonDB id first, then by assetCode
      let assetData: Asset | null = null;
      try {
        assetData = await database
          .get<Asset>('assets')
          .find(insp.assetId);
      } catch {
        // Fallback: find by assetCode
        const allAssets = await database.get<Asset>('assets').query().fetch();
        assetData = allAssets.find((a: Asset) => a.assetCode === insp.assetId) || null;
      }
      setAsset(assetData);
    } catch (error) {
      console.error('Error loading inspection detail:', error);
    }
  };

  const handleSharePDF = async () => {
    if (inspection?.pdfPath) {
      try {
        await sharePdfFile(
          inspection.pdfPath,
          `PM Report - ${asset?.assetCode || 'POP'}`,
          `Laporan PM untuk ${asset?.name || asset?.assetCode || 'POP'} - ${formatDate(
            inspection.inspectionDate,
          )}`,
        );
      } catch (error) {
        Alert.alert('Error', 'Gagal membagikan PDF');
      }
    } else {
      Alert.alert('Info', 'PDF belum tersedia untuk laporan ini');
    }
  };

  if (!inspection || !asset) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      </View>
    );
  }

  const statusCounts = {
    ok: items.filter((i) => i.status === 'ok').length,
    warning: items.filter((i) => i.status === 'warning').length,
    critical: items.filter((i) => i.status === 'critical').length,
    na: items.filter((i) => i.status === 'na').length,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Premium Header */}
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        {/* Back button */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [{translateX: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
          }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <ChevronLeft color={Colors.white} size={22} />
          </TouchableOpacity>
        </Animated.View>

        {/* Asset info */}
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: headerAnim,
              transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}],
            },
          ]}>
          <Text style={styles.headerOverline}>{cleanPopId(asset.assetCode || '')}</Text>
          <Text style={styles.headerTitle}>{cleanPopName(asset.name || '')}</Text>
          <View style={styles.headerLocationRow}>
            <MapPin size={13} color="rgba(255,255,255,0.7)" style={{marginRight: 4}} />
            <Text style={styles.headerLocation}>{asset.location}</Text>
          </View>

          {/* Meta chips */}
          <View style={styles.headerChips}>
            <View style={styles.chip}>
              <Calendar size={12} color={Colors.white} style={{marginRight: 4}} />
              <Text style={styles.chipText}>{formatDate(inspection.inspectionDate)}</Text>
            </View>
            <View style={styles.chip}>
              <User size={12} color={Colors.white} style={{marginRight: 4}} />
              <Text style={styles.chipText}>{cleanInspectorName(inspection.inspectorName)}</Text>
            </View>
            <StatusBadge status={inspection.status} size="sm" />
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
          }}>

          {/* Type Tag */}
          <View style={styles.typeSection}>
            <View style={styles.typeChip}>
              <ClipboardList size={14} color={Colors.primary} style={{marginRight: 6}} />
              <Text style={styles.typeText}>{inspection.typeLabel}</Text>
            </View>
          </View>

          {/* Checklist Results */}
          {items.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>HASIL CHECKLIST</Text>
                <View style={styles.sectionLine} />
              </View>

              {items.map((item: InspectionItem, index: number) => (
                <View key={(item as any).id} style={styles.resultCard}>
                  <View style={styles.resultLeft}>
                    <View style={styles.resultNum}>
                      <Text style={styles.resultNumText}>{index + 1}</Text>
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultLabel}>{item.label}</Text>
                      <Text style={styles.resultValue}>{item.displayValue}</Text>
                      {item.notes ? (
                        <View style={styles.resultNotesRow}>
                          <FileText size={11} color={Colors.textMuted} style={{marginRight: 4}} />
                          <Text style={styles.resultNotes}>{item.notes}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.resultStatusIcon}>
                    {getStatusIcon(item.status)}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Notes */}
          {inspection.notes ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>CATATAN</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{inspection.notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {/* Review PDF Button - only show if formData exists */}
            {hasFormData && (
              <TouchableOpacity
                style={styles.reviewPdfBtn}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('HistoryReviewPdf', {inspectionId})
                }>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.reviewPdfBtnGradient}>
                  <Eye size={20} color={Colors.white} style={{marginRight: 8}} />
                  <Text style={styles.reviewPdfBtnText}>Lihat Review PDF</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.8}
              onPress={handleSharePDF}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.shareBtnGradient}>
                <Share2 size={18} color={Colors.white} style={{marginRight: 8}} />
                <Text style={styles.shareBtnText}>Bagikan PDF</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backTextBtn}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backTextBtnLabel}>Kembali ke Riwayat</Text>
            </TouchableOpacity>
          </View>

          <View style={{height: 40}} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Header
  headerGradient: {
    paddingTop: 52,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headerContent: {},
  headerOverline: {
    ...Typography.overline,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLocation: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  headerChips: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },

  // Content
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Summary Cards
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderLeftWidth: 3,
  },
  summaryCount: {
    ...Typography.h3,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },

  // Type
  typeSection: {
    marginBottom: Spacing.lg,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  typeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginLeft: Spacing.md,
  },

  // Results
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  resultLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  resultNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  resultNumText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  resultValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resultNotesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  resultNotes: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  resultStatusIcon: {
    marginLeft: Spacing.sm,
    paddingTop: 4,
  },

  // Notes
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  notesText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },

  // Actions
  actionsSection: {
    marginTop: Spacing.md,
  },
  reviewPdfBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  reviewPdfBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  reviewPdfBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  shareBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  shareBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '700',
  },
  backTextBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
    marginTop: Spacing.sm,
  },
  backTextBtnLabel: {
    ...Typography.label,
    color: Colors.textMuted,
  },
});
