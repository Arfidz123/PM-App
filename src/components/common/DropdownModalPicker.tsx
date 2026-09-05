import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
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
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      overlayAnim.setValue(0);
      scaleAnim.setValue(0.85);

      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 130,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      if (callback) {
        callback();
      }
    });
  };

  const handleSelect = (opt: string) => {
    if (selectedValue === opt) {
      onSelect('');
    } else {
      onSelect(opt);
    }
    handleClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => handleClose()}
    >
      <Animated.View style={[styles.backdrop, { opacity: overlayAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => handleClose()}
        />
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: overlayAnim,
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <View style={styles.divider} />

          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const isSelected = selectedValue === opt;

              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.item, isSelected && styles.itemActive]}
                  onPress={() => handleSelect(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.itemTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected && <Check size={18} color="#ffffff" strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleClose()}
            activeOpacity={0.8}
          >
            <X size={17} color="#ffffff" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.cancelBtnText}>Tutup</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
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
