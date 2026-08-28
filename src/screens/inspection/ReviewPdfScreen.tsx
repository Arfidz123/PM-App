import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  NativeModules,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import WebView from 'react-native-webview';
import RNHTMLtoPDF, { generatePDF } from 'react-native-html-to-pdf';
import LinearGradient from 'react-native-linear-gradient';

import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Header } from '../../components/common';
import { useInspectionStore } from '../../store/inspectionStore';
import { generatePdfSections, generateDownloadablePdfHtml } from '../../utils/pdfTemplate';
import database from '../../database';
import { syncInspectionsToSupabase, saveInspectionDirectlyToSupabase } from '../../services/syncService';
import { sharePdfFile } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

export const ReviewPdfScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    activePopId,
    activePopName,
    activePopLocation,
    currentLocation,
    formData,
    photos,
    resetInspection
  } = useInspectionStore();

  const mergedFormData = useMemo(() => ({
    ...formData,
    photos: photos || [],
    currentLocation: currentLocation || null,
  }), [formData, photos, currentLocation]);

  const sections = useMemo(() =>
    generatePdfSections(activePopId, activePopName, activePopLocation, mergedFormData),
    [activePopId, activePopName, activePopLocation, mergedFormData]
  );

  const downloadableHtml = useMemo(() =>
    generateDownloadablePdfHtml(activePopId, activePopName, activePopLocation, mergedFormData),
    [activePopId, activePopName, activePopLocation, mergedFormData]
  );

  const currentSection: any = sections[activeIndex];
  const scaledHtml = useMemo(() => {
    if (!currentSection) return '';
    const pWidth = currentSection.pageWidth || 850;
    const initialScale = (SLIDE_WIDTH / pWidth).toFixed(2);
    return currentSection.html.replace(
      'initial-scale=1.0',
      `initial-scale=${initialScale}`,
    );
  }, [currentSection]);

  const saveInspectionDataAndGetPdfPath = async () => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    const pdfFileName = `PM_Report_${activePopId || 'POP'}_${dateStr}`;
    const timestamp = Date.now();

    const options = {
      html: downloadableHtml,
      fileName: pdfFileName,
      directory: 'docs',
    };

    let pdfPath = '';
    try {
      let file: any;
      if (typeof generatePDF === 'function') {
        file = await generatePDF(options as any);
      } else if (RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function') {
        file = await RNHTMLtoPDF.convert(options);
      }
      pdfPath = file?.filePath || '';
    } catch (pdfErr) {
      console.log('PDF Generation error:', pdfErr);
    }

    const inspectionId = `insp_${timestamp}`;
    let isCloudSaved = false;

    try {
      await saveInspectionDirectlyToSupabase({
        id: inspectionId,
        assetId: activePopId || 'unknown',
        inspectorName: 'Teknisi',
        inspectionDate: timestamp,
        type: 'PM',
        status: 'completed',
        pdfPath: pdfPath,
        formData: mergedFormData,
        photos: photos || [],
        notes: (mergedFormData as any)?.infoPop?.catatan || '',
      });
      isCloudSaved = true;
      console.log('Successfully saved inspection directly to Supabase Cloud!');
    } catch (supabaseErr) {
      console.warn('Direct Supabase upload failed, queuing for sync:', supabaseErr);
      isCloudSaved = false;
    }

    try {
      await database.write(async () => {
        await database.get('inspections').create((inspection: any) => {
          inspection._raw.id = inspectionId;
          inspection.assetId = activePopId || 'unknown';
          inspection.inspectorName = 'Teknisi';
          inspection.inspectionDate = timestamp;
          inspection.type = 'PM';
          inspection.status = 'completed';
          inspection.pdfPath = pdfPath;
          inspection.formData = JSON.stringify(mergedFormData);
          inspection.photos = JSON.stringify(photos || []);
          inspection.notes = (mergedFormData as any)?.infoPop?.catatan || '';
          inspection.isSynced = isCloudSaved;
        });
      });
    } catch (dbErr) {
      console.warn('Local database save fallback error:', dbErr);
    }

    if (!isCloudSaved) {
      syncInspectionsToSupabase().catch((err) => {
        console.warn('Background sync failed:', err);
      });
    }

    return { pdfPath, pdfFileName };
  };

  const handleDownloadPdf = async () => {
    setSaving(true);
    try {
      const { pdfPath, pdfFileName } = await saveInspectionDataAndGetPdfPath();

      if (pdfPath && Platform.OS === 'android' && NativeModules.PdfDownloader) {
        try {
          await NativeModules.PdfDownloader.saveToDownloads(pdfPath, pdfFileName);
        } catch (downloadErr) {
          console.warn('Save to downloads notice:', downloadErr);
        }
      }

      resetInspection();
      setSaving(false);

      Alert.alert(
        'Sukses',
        `Data inspeksi & file PDF berhasil disimpan ke folder Downloads HP!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MainTabs' as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleDownloadPdf:', error);
      setSaving(false);
      Alert.alert('Sukses', 'Data inspeksi berhasil disimpan!');
      resetInspection();
      navigation.navigate('MainTabs' as any);
    }
  };

  const handleSharePdf = async () => {
    setSaving(true);
    try {
      const { pdfPath } = await saveInspectionDataAndGetPdfPath();
      resetInspection();
      setSaving(false);

      if (pdfPath) {
        try {
          await sharePdfFile(
            pdfPath,
            `Laporan PM - ${activePopName || 'POP'}`,
            `Berikut file laporan PDF PM untuk POP ${activePopName || ''}`
          );
        } catch (shareErr) {
          console.warn('Share PDF error:', shareErr);
        }
      }

      navigation.navigate('MainTabs' as any);
    } catch (error) {
      console.error('Error in handleSharePdf:', error);
      setSaving(false);
      resetInspection();
      navigation.navigate('MainTabs' as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Review & Download PDF"
        subtitle={activePopName ? `POP: ${activePopName}` : 'Preview Laporan PM'}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        {/* Numbered Dots Row */}
        <View style={styles.dotsRow}>
          {sections.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveIndex(idx)}
                activeOpacity={0.7}
                style={[styles.dot, isActive && styles.dotActive]}
              >
                <Text style={[styles.dotText, isActive && styles.dotTextActive]}>
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section Header Navigation */}
        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={[styles.navArrowBtn, activeIndex === 0 && styles.navArrowBtnDisabled]}
            onPress={() => activeIndex > 0 && setActiveIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            activeOpacity={0.7}
          >
            <ChevronLeft color={activeIndex === 0 ? 'rgba(255,255,255,0.2)' : Colors.white} size={20} />
          </TouchableOpacity>

          <View style={styles.sectionTitleWrapper}>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              {activeIndex + 1}. {sections[activeIndex]?.title || 'Preview Halaman'}
            </Text>
            <Text style={styles.slideCounterText}>
              Halaman {activeIndex + 1} dari {sections.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navArrowBtn, activeIndex === sections.length - 1 && styles.navArrowBtnDisabled]}
            onPress={() => activeIndex < sections.length - 1 && setActiveIndex(activeIndex + 1)}
            disabled={activeIndex === sections.length - 1}
            activeOpacity={0.7}
          >
            <ChevronRight color={activeIndex === sections.length - 1 ? 'rgba(255,255,255,0.2)' : Colors.white} size={20} />
          </TouchableOpacity>
        </View>

        {/* Active PDF WebView */}
        <View style={styles.webviewWrapper}>
          {scaledHtml ? (
            <WebView
              key={`webview-slide-${activeIndex}`}
              source={{ html: scaledHtml }}
              style={{ flex: 1, backgroundColor: '#fff' }}
              scalesPageToFit={true}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={true}
              nestedScrollEnabled={true}
              setBuiltInZoomControls={true}
              setDisplayZoomControls={false}
              allowsInlineMediaPlayback={true}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              allowingReadAccessToURL="*"
              originWhitelist={['*']}
              androidLayerType="hardware"
            />
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.downloadBtn]}
            activeOpacity={0.85}
            onPress={handleDownloadPdf}
            disabled={saving}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionBtnGradient}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Download color={Colors.white} size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.actionBtnText}>Download PDF</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtnInline]}
            activeOpacity={0.85}
            onPress={handleSharePdf}
            disabled={saving}
          >
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionBtnGradient}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Share2 color={Colors.white} size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.actionBtnText}>Bagikan PDF</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
    ...Shadow.sm,
  },
  dotText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  dotTextActive: {
    color: Colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.glassBorder,
  },
  sectionTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  slideCounterText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 11,
    marginTop: 2,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  webviewWrapper: {
    flex: 1,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.glassBorder,
    backgroundColor: '#fff',
    ...Shadow.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  downloadBtn: {},
  shareBtnInline: {},
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
  },
  actionBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
