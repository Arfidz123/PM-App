/**
 * Category Form Screen
 * Displays items for a specific category
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {useInspectionStore} from '../../store/inspectionStore';
import {Card, Button, Header} from '../../components/common';
import type {RootStackParamList} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CategoryFormScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp>();
  const {categoryId, categoryLabel} = route.params;

  const {checklistEntries, updateChecklistEntry} = useInspectionStore();
  
  // Find entries for this category
  const categoryEntries = checklistEntries.filter(
    (entry) => entry.category === categoryId,
  );

  const handleUpdateValue = (item: any, value: string) => {
    // Find absolute index in the store
    const globalIndex = checklistEntries.findIndex(
      (e) => e.templateItemId === item.templateItemId,
    );
    if (globalIndex !== -1) {
      updateChecklistEntry(globalIndex, {
        value,
        status: 'ok', // simplify
      });
    }
  };

  const renderItem = (item: any) => {
    return (
      <Card key={item.templateItemId} style={styles.itemCard}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        
        {item.type === 'pass_fail' && (
          <View style={styles.segmentedControl}>
            <TouchableOpacity 
              style={[styles.segmentBtn, item.value === 'OK' && styles.segmentBtnActiveOk]}
              onPress={() => handleUpdateValue(item, 'OK')}
            >
              <Text style={item.value === 'OK' ? styles.segmentTextActive : styles.segmentText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, item.value === 'NOK' && styles.segmentBtnActiveNok]}
              onPress={() => handleUpdateValue(item, 'NOK')}
            >
              <Text style={item.value === 'NOK' ? styles.segmentTextActive : styles.segmentText}>NOK</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.type === 'numeric' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={item.value}
              onChangeText={(val) => handleUpdateValue(item, val)}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
            {item.unit ? <Text style={styles.unitText}>{item.unit}</Text> : null}
          </View>
        )}

        {item.type === 'select' && (
          <View style={styles.segmentedControl}>
             {(item.options || []).map((opt: string) => (
                <TouchableOpacity 
                  key={opt}
                  style={[styles.segmentBtn, item.value === opt && styles.segmentBtnActiveOk]}
                  onPress={() => handleUpdateValue(item, opt)}
                >
                  <Text style={item.value === opt ? styles.segmentTextActive : styles.segmentText}>{opt}</Text>
                </TouchableOpacity>
             ))}
          </View>
        )}
        
        {item.type === 'text' && (
          <TextInput
            style={[styles.textInput, {marginTop: Spacing.sm}]}
            value={item.value}
            onChangeText={(val) => handleUpdateValue(item, val)}
            placeholder="Keterangan..."
            placeholderTextColor={Colors.textMuted}
          />
        )}
        
        {item.type === 'photo' && (
          <TouchableOpacity 
            style={styles.photoButton}
            onPress={() => {
              // Open camera logic here
              handleUpdateValue(item, 'photo_taken.jpg');
            }}
          >
            <Text style={styles.photoButtonText}>
              {item.value ? '📸 Foto Tersimpan' : '📸 Ambil Foto'}
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={categoryLabel}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categoryEntries.length === 0 ? (
          <Text style={styles.emptyText}>Tidak ada item di kategori ini.</Text>
        ) : (
          categoryEntries.map(renderItem)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backText: {
    color: Colors.primary,
    ...Typography.body,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  itemCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  itemLabel: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentBtnActiveOk: {
    backgroundColor: Colors.primary,
  },
  segmentBtnActiveNok: {
    backgroundColor: Colors.danger,
  },
  segmentText: {
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  segmentTextActive: {
    color: Colors.white,
    ...Typography.caption,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    color: Colors.text,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitText: {
    marginLeft: Spacing.sm,
    color: Colors.textSecondary,
  },
  photoButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    color: Colors.primary,
    ...Typography.label,
  },
});
