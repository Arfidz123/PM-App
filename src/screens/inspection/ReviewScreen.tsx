/**
 * Review Screen
 * Review inspection data before final submission
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header, Card, Button, StatusBadge } from '../../components/common';
import { useInspectionStore, ChecklistEntry } from '../../store/inspectionStore';
import database from '../../database';
import { Asset } from '../../database/models';
import { getCategoryIcon } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SectionDetail = ({ title, data }: { title: string, data: Record<string, string | number> }) => {
  const entries = Object.entries(data).filter(([_, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.resultRow}>
          <View style={styles.resultLeft}>
            <Text style={styles.resultLabel}>{key}</Text>
            <Text style={styles.resultValue}>{value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export const ReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { inspectionId } = route.params;
  const {
    currentAssetId,
    checklistEntries,
    photos,
    notes,
    formData,
  } = useInspectionStore();
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (currentAssetId) {
      database
        .get<Asset>('assets')
        .find(currentAssetId)
        .then(setAsset)
        .catch(console.error);
    }
  }, [currentAssetId]);

  const handleContinue = () => {
    navigation.navigate('Signature', { inspectionId });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Review"
        subtitle="Periksa kembali sebelum submit"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Asset Summary */}
        {asset && (
          <Card style={styles.assetSummary}>
            <View style={styles.assetRow}>
              <Text style={styles.assetIcon}>
                {getCategoryIcon(asset.category)}
              </Text>
              <View style={styles.assetInfo}>
                <Text style={styles.assetCode}>{asset.assetCode}</Text>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetLocation}>📍 {asset.location}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Power System Detailed Summary */}
        {formData.powerSystem && (() => {
          const ps = formData.powerSystem;
          return (
            <>
              {/* Catuan Utama & Eksternal */}
              <SectionDetail
                title="POWER SYSTEM: CATUAN UTAMA & EKSTERNAL"
                data={{
                  'PLN': ps.tipePln || 'Distribusi',
                  'ID Pelanggan': ps.idPelanggan,
                  'Daya Listrik (kVA)': ps.dayaListrik,
                  'Phasa': ps.phasaCatuan,
                  'Pengukuran KWH': ps.pengukuranKwh,
                  'Bulan Ini': ps.bulanIni,
                  'Genset': ps.gensetAda || 'Tidak Ada',
                  'Merk Genset': ps.gensetAda === 'Ada' ? ps.merkGenset : '',
                  'Serial Number': ps.gensetAda === 'Ada' ? ps.snGenset : '',
                  'Jenis Genset': ps.gensetAda === 'Ada' ? ps.jenisGenset : '',
                  'Tipe Genset': ps.gensetAda === 'Ada' ? ps.tipeGenset : '',
                  'Kapasitas Genset': ps.gensetAda === 'Ada' ? ps.kapasitasGenset : '',
                  'Phasa Genset': ps.gensetAda === 'Ada' ? ps.phasaGenset : '',
                }}
              />

              {/* Tegangan & Tegangan Acuan (Tolak Ukur) */}
              <SectionDetail
                title="POWER SYSTEM: TEGANGAN & ACUAN"
                data={{
                  'Tegangan R-N': ps.teganganR_N ? `${ps.teganganR_N} V (Acuan: ${ps.teganganR_N_TU || '220 ± 10%'})` : '',
                  'Tegangan S-N': ps.teganganS_N ? `${ps.teganganS_N} V (Acuan: ${ps.teganganS_N_TU || '220 ± 10%'})` : '',
                  'Tegangan T-N': ps.teganganT_N ? `${ps.teganganT_N} V (Acuan: ${ps.teganganT_N_TU || '220 ± 10%'})` : '',
                  'Tegangan R-T': ps.teganganR_T ? `${ps.teganganR_T} V (Acuan: ${ps.teganganR_T_TU || '400 ± 10%'})` : '',
                  'Tegangan S-T': ps.teganganS_T ? `${ps.teganganS_T} V (Acuan: ${ps.teganganS_T_TU || '400 ± 10%'})` : '',
                  'Tegangan R-S': ps.teganganR_S ? `${ps.teganganR_S} V (Acuan: ${ps.teganganR_S_TU || '400 ± 10%'})` : '',
                  'Tegangan G-N': ps.teganganG_N ? `${ps.teganganG_N} V ${ps.teganganG_N_TU ? `(Acuan: ${ps.teganganG_N_TU})` : ''}` : '',
                }}
              />

              {/* Total Arus Terpakai & Stabilizer */}
              <SectionDetail
                title="POWER SYSTEM: TOTAL ARUS TERPAKAI & STABILIZER"
                data={{
                  'Phasa (A)': ps.phasaArus || ps.phasaCatuan,
                  'Frekuensi': ps.frekuensi ? `${ps.frekuensi} Hz` : '',
                  'Arus Phasa R': ps.arusPhasaR || ps.arusR ? `${ps.arusPhasaR || ps.arusR} A` : '',
                  'Arus Phasa S': ps.arusPhasaS || ps.arusS ? `${ps.arusPhasaS || ps.arusS} A` : '',
                  'Arus Phasa T': ps.arusPhasaT || ps.arusT ? `${ps.arusPhasaT || ps.arusT} A` : '',
                  'Arus Netral (N)': ps.arusPhasaN || ps.arusN ? `${ps.arusPhasaN || ps.arusN} A` : '',
                  'Stabilizer Kapasitas': ps.stabilizerKapasitas ? `${ps.stabilizerKapasitas} kVA` : '',
                  'Stabilizer Jumlah': ps.stabilizerJumlah,
                }}
              />

              {/* Visual Check & Kabinet */}
              <SectionDetail
                title="POWER SYSTEM: VISUAL & CHECK KABINET"
                data={{
                  'Cek Kabel': ps.cekKabel ? `${ps.cekKabel} ${ps.cekKabelKet ? `(${ps.cekKabelKet})` : ''}` : '',
                  'Cek Baut Terminal': ps.cekBautTerminal ? `${ps.cekBautTerminal} ${ps.cekBautTerminalKet ? `(${ps.cekBautTerminalKet})` : ''}` : '',
                  'Cek Baut MCB/MCCB': ps.cekBautMCB ? `${ps.cekBautMCB} ${ps.cekBautMCBKet ? `(${ps.cekBautMCBKet})` : ''}` : '',
                  'Indikator Lamp': ps.indikatorLamp ? `${ps.indikatorLamp} ${ps.indikatorLampKet ? `(${ps.indikatorLampKet})` : ''}` : '',
                  'COS Genset': ps.cosGenset ? `${ps.cosGenset} ${ps.cosGensetKet ? `(${ps.cosGensetKet})` : ''}` : '',
                  'Rect 1 - Kebersihan Rack': ps.rect1KebersihanRack ? `${ps.rect1KebersihanRack} ${ps.rect1KebersihanRackKet ? `(${ps.rect1KebersihanRackKet})` : ''}` : '',
                  'Rect 1 - Cek Baut Kabinet': ps.rect1CekBautKabinet ? `${ps.rect1CekBautKabinet} ${ps.rect1CekBautKabinetKet ? `(${ps.rect1CekBautKabinetKet})` : ''}` : '',
                  'Rect 2 - Kebersihan Rack': ps.rect2KebersihanRack ? `${ps.rect2KebersihanRack} ${ps.rect2KebersihanRackKet ? `(${ps.rect2KebersihanRackKet})` : ''}` : '',
                  'Rect 2 - Cek Baut Kabinet': ps.rect2CekBautKabinet ? `${ps.rect2CekBautKabinet} ${ps.rect2CekBautKabinetKet ? `(${ps.rect2CekBautKabinetKet})` : ''}` : '',
                  'Rect 3 - Kebersihan Rack': ps.rect3KebersihanRack ? `${ps.rect3KebersihanRack} ${ps.rect3KebersihanRackKet ? `(${ps.rect3KebersihanRackKet})` : ''}` : '',
                  'Rect 3 - Cek Baut Kabinet': ps.rect3CekBautKabinet ? `${ps.rect3CekBautKabinet} ${ps.rect3CekBautKabinetKet ? `(${ps.rect3CekBautKabinetKet})` : ''}` : '',
                }}
              />

              {/* Description Rectifier 1, 2, 3 */}
              {[1, 2, 3].map((num) => {
                const key = `rect${num}`;
                if (!ps[`${key}Merk`] && !ps[`${key}Tipe`] && !ps[`${key}SN`]) return null;
                return (
                  <SectionDetail
                    key={num}
                    title={`DESCRIPTION RECTIFIER #${num}`}
                    data={{
                      'Input AC (Phasa)': ps[`${key}InputAC`],
                      'Merk': ps[`${key}Merk`],
                      'Tipe': ps[`${key}Tipe`],
                      'Kapasitas Slot': ps[`${key}KapasitasSlot`],
                      'Serial Number': ps[`${key}SN`],
                      'Tipe Modul': ps[`${key}TipeModul`],
                      'Modul Terpasang': ps[`${key}ModulJml`],
                      'Kap. Modul (A)': ps[`${key}KapasitasModul`],
                      'Arus Beban (A)': ps[`${key}ArusBeban`],
                      'Teg. Input (V)': ps[`${key}TegInput`],
                      'Teg. Floating (V)': ps[`${key}TegFloating`],
                      'Teg. Equalizing (V)': ps[`${key}TegEqualizing`],
                      'LVD Threshold (V)': ps[`${key}Lvd`],
                      'Boost Charge': ps[`${key}Boost`],
                      'Utilisasi (%)': ps[`${key}Utilisasi`],
                    }}
                  />
                );
              })}

              {/* Beban ACPDB */}
              {(() => {
                const list = ps.acpdbBeban || ps.bebanAcpdb;
                if (!list || list.length === 0) return null;
                return (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BEBAN ACPDB ({list.length} MCB)</Text>
                    {list.map((item: any, idx: number) => (
                      <Card key={idx} style={{ marginBottom: Spacing.sm }}>
                        <Text style={{ ...Typography.subtitle2, marginBottom: Spacing.xs, color: Colors.text }}>
                          MCB #{idx + 1} - Kapasitas: {item.kapasitas || '-'} | Label: {item.labelMcb || '-'}
                        </Text>
                        {item.peruntukan ? <Text style={styles.resultValue}>Peruntukan: {item.peruntukan}</Text> : null}
                        <Text style={{ ...Typography.caption, marginTop: 4, color: Colors.primary }}>
                          Phasa R: {item.phasaRBeban || item.rBeban || '-'} ({item.phasaRArus || item.rArus || '-'} A) | Phasa S: {item.phasaSBeban || item.sBeban || '-'} ({item.phasaSArus || item.sArus || '-'} A) | Phasa T: {item.phasaTBeban || item.tBeban || '-'} ({item.phasaTArus || item.tArus || '-'} A)
                        </Text>
                      </Card>
                    ))}
                  </View>
                );
              })()}

              {/* Beban DCPDB */}
              {(() => {
                const list = ps.dcpdbBeban || ps.bebanDcpdb;
                if (!list || list.length === 0) return null;
                return (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BEBAN DCPDB ({list.length} MCB)</Text>
                    {list.map((item: any, idx: number) => (
                      <Card key={idx} style={{ marginBottom: Spacing.sm }}>
                        <Text style={{ ...Typography.subtitle2, marginBottom: Spacing.xs, color: Colors.text }}>
                          MCB #{idx + 1} - Kapasitas: {item.kapasitas || '-'}
                        </Text>
                        {[1, 2, 3, 4, 5].map((n) => {
                          const beban = item[`dcpdb${n}Beban`] || item[`d${n}Beban`];
                          const arus = item[`dcpdb${n}Arus`] || item[`d${n}Arus`];
                          return beban ? (
                            <Text key={n} style={styles.resultValue}>
                              DCPDB #{n}: {beban} ({arus || '-'} A)
                            </Text>
                          ) : null;
                        })}
                      </Card>
                    ))}
                  </View>
                );
              })()}

              {/* Beban Rectifier */}
              {(() => {
                const list = ps.rectifierBeban || ps.bebanRectifier;
                if (!list || list.length === 0) return null;
                return (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BEBAN RECTIFIER ({list.length} MCB)</Text>
                    {list.map((item: any, idx: number) => {
                      const r1Kap = item.rect1KapMcb || item.r1Kap;
                      const r1Arus = item.rect1Arus || item.r1Arus;
                      const r1Nama = item.rect1NamaNe || item.r1Nama;

                      const r2Kap = item.rect2KapMcb || item.r2Kap;
                      const r2Arus = item.rect2Arus || item.r2Arus;
                      const r2Nama = item.rect2NamaNe || item.r2Nama;

                      const r3Kap = item.rect3KapMcb || item.r3Kap;
                      const r3Arus = item.rect3Arus || item.r3Arus;
                      const r3Nama = item.rect3NamaNe || item.r3Nama;

                      return (
                        <Card key={idx} style={{ marginBottom: Spacing.sm }}>
                          <Text style={{ ...Typography.subtitle2, marginBottom: Spacing.xs, color: Colors.text }}>
                            MCB #{idx + 1}
                          </Text>
                          {r1Kap ? <Text style={styles.resultValue}>Rect 1: Kap {r1Kap} | Arus {r1Arus || '-'}A | NE: {r1Nama || '-'}</Text> : null}
                          {r2Kap ? <Text style={styles.resultValue}>Rect 2: Kap {r2Kap} | Arus {r2Arus || '-'}A | NE: {r2Nama || '-'}</Text> : null}
                          {r3Kap ? <Text style={styles.resultValue}>Rect 3: Kap {r3Kap} | Arus {r3Arus || '-'}A | NE: {r3Nama || '-'}</Text> : null}
                        </Card>
                      );
                    })}
                  </View>
                );
              })()}

              {/* Grounding System */}
              <SectionDetail
                title="POWER SYSTEM: GROUNDING SYSTEM"
                data={{
                  'Outdoor (Bak Kontrol)': ps.grOutdoor,
                  'Indoor (Bak Kontrol)': ps.grIndoor,
                  'System Grounding': ps.systemGrounding,
                  'Catatan Grounding': ps.grCatatan,
                }}
              />

              {/* Pengecekan Arrester */}
              <SectionDetail
                title="POWER SYSTEM: PENGECEKAN ARRESTER"
                data={{
                  'Phasa R': `KWH: ${ps.kwhBoxR || ps.arresterKwhR || '-'} | ACPDB: ${ps.acpdbR || ps.arresterAcpdbR || '-'} | Rect: ${ps.rectifierR || ps.arresterRectifierR || '-'}${ps.arresterKetR ? ` (Ket: ${ps.arresterKetR})` : ''}`,
                  'Phasa S': `KWH: ${ps.kwhBoxS || ps.arresterKwhS || '-'} | ACPDB: ${ps.acpdbS || ps.arresterAcpdbS || '-'} | Rect: ${ps.rectifierS || ps.arresterRectifierS || '-'}${ps.arresterKetS ? ` (Ket: ${ps.arresterKetS})` : ''}`,
                  'Phasa T': `KWH: ${ps.kwhBoxT || ps.arresterKwhT || '-'} | ACPDB: ${ps.acpdbT || ps.arresterAcpdbT || '-'} | Rect: ${ps.rectifierT || ps.arresterRectifierT || '-'}${ps.arresterKetT ? ` (Ket: ${ps.arresterKetT})` : ''}`,
                  'Phasa N': `KWH: ${ps.kwhBoxN || ps.arresterKwhN || '-'} | ACPDB: ${ps.acpdbN || ps.arresterAcpdbN || '-'} | Rect: ${ps.rectifierN || ps.arresterRectifierN || '-'}${ps.arresterKetN ? ` (Ket: ${ps.arresterKetN})` : ''}`,
                }}
              />
            </>
          );
        })()}

        {/* Rectifier Summary */}
        {formData.rectifier && (
          <SectionDetail
            title="RECTIFIER"
            data={{
              'Merk Rectifier': formData.rectifier.merkRectifier,
              'Tipe': formData.rectifier.tipe,
              'Modul Terpasang': formData.rectifier.modulTerpasang,
            }}
          />
        )}

        {/* Battery Summary Detailed */}
        {formData.battery && formData.battery.banks && formData.battery.banks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BATTERY ({formData.battery.banks.length} Bank)</Text>
            {formData.battery.banks.map((bank: any, index: number) => (
              <Card key={bank.id || index} style={{ marginBottom: Spacing.sm }}>
                <Text style={{ ...Typography.subtitle2, marginBottom: Spacing.xs, color: Colors.text }}>
                  Bank #{index + 1} - {bank.kondisi || 'OK'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <View style={{ width: '50%', marginBottom: 4 }}><Text style={styles.resultLabel}>Merk</Text><Text style={styles.resultValue}>{bank.merk || '-'}</Text></View>
                  <View style={{ width: '50%', marginBottom: 4 }}><Text style={styles.resultLabel}>Tipe</Text><Text style={styles.resultValue}>{bank.tipe || '-'}</Text></View>
                  <View style={{ width: '50%', marginBottom: 4 }}><Text style={styles.resultLabel}>Kapasitas</Text><Text style={styles.resultValue}>{bank.kapasitas || '-'}</Text></View>
                  <View style={{ width: '50%', marginBottom: 4 }}><Text style={styles.resultLabel}>V Total</Text><Text style={styles.resultValue}>{bank.vTotal || '-'}</Text></View>
                  <View style={{ width: '100%', marginBottom: 4 }}><Text style={styles.resultLabel}>SN</Text><Text style={styles.resultValue}>{bank.sn || '-'}</Text></View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Checklist Summary */}
        {checklistEntries && checklistEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHECKLIST</Text>
            {checklistEntries.map((entry, index) => (
              <View key={index} style={styles.resultRow}>
                <View style={styles.resultLeft}>
                  <Text style={styles.resultLabel}>{entry.label}</Text>
                  <Text style={styles.resultValue}>{entry.value || '-'}</Text>
                </View>
                {entry.status && <StatusBadge status={entry.status} />}
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CATATAN</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultValue}>{notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDots}>
            <View style={[styles.dot, styles.dotCompleted]} />
            <View style={[styles.dot, styles.dotCompleted]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotInactive]} />
          </View>
          <Text style={styles.stepText}>Langkah 3 dari 4</Text>
        </View>

        <Button
          title="Lanjut ke Tanda Tangan →"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  assetSummary: {
    marginBottom: Spacing.lg,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    fontSize: 36,
    marginRight: Spacing.base,
  },
  assetInfo: {
    flex: 1,
  },
  assetCode: {
    ...Typography.overline,
    color: Colors.info,
  },
  assetName: {
    ...Typography.h4,
    color: Colors.text,
    marginTop: 2,
  },
  assetLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  resultLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  resultLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  resultValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepIndicator: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  stepDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
  dotInactive: {
    backgroundColor: Colors.border,
  },
  stepText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

