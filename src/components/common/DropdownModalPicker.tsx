import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';

export interface DropdownModalPickerProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

export const DropdownModalPicker: React.FC<DropdownModalPickerProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const handleSelect = (opt: string) => {
    onClose();
    if (
      selectedValue === opt ||
      (Boolean(selectedValue) &&
        selectedValue.trim().toLowerCase() === opt.trim().toLowerCase())
    ) {
      onSelect('');
    } else {
      onSelect(opt);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.divider} />

          <ScrollView
            style={styles.scrollList}
            showsVerticalScrollIndicator={false}
          >
            {options.map(opt => {
              const isSelected =
                selectedValue === opt ||
                (Boolean(selectedValue) &&
                  selectedValue.trim().toLowerCase() === opt.trim().toLowerCase());

              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.item, isSelected && styles.itemActive]}
                  onPress={() => handleSelect(opt)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.itemTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected && (
                    <Check size={18} color="#ffffff" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X
              size={17}
              color="#ffffff"
              strokeWidth={2.5}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.cancelBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Shadow.lg,
  },
  title: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  scrollList: {
    maxHeight: 280,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  itemActive: {
    backgroundColor: Colors.primary,
  },
  itemText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  itemTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cancelBtn: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.danger,
    ...Shadow.sm,
  },
  cancelBtnText: {
    ...Typography.body,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
