/**
 * StatusBadge Component
 * Colored badge for showing item/asset/inspection status
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { ItemStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  ok: { bg: Colors.statusOk, text: Colors.success, label: 'OK' },
  warning: {
    bg: Colors.statusWarning,
    text: Colors.warning,
    label: 'Perhatian',
  },
  critical: { bg: Colors.statusCritical, text: Colors.danger, label: 'Kritis' },
  na: { bg: Colors.statusNa, text: Colors.textSecondary, label: 'N/A' },
  active: { bg: Colors.statusOk, text: Colors.success, label: 'Aktif' },
  inactive: {
    bg: Colors.statusNa,
    text: Colors.textSecondary,
    label: 'Tidak Aktif',
  },
  maintenance: {
    bg: Colors.statusWarning,
    text: Colors.warning,
    label: 'Maintenance',
  },
  draft: { bg: Colors.statusNa, text: Colors.textSecondary, label: 'Draft' },
  in_progress: {
    bg: 'rgba(52, 152, 219, 0.15)',
    text: Colors.info,
    label: 'Berlangsung',
  },
  completed: { bg: Colors.statusOk, text: Colors.success, label: 'Selesai' },
  reviewed: {
    bg: 'rgba(155, 89, 182, 0.15)',
    text: '#9B59B6',
    label: 'Reviewed',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  style,
}) => {
  const config = statusConfig[status] || statusConfig.na;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text
        style={[
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: config.text },
        ]}
      >
        {label || config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  badgeMd: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  textSm: {
    ...Typography.overline,
    fontSize: 9,
  },
  textMd: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
});
