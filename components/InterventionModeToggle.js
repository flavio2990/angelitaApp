import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/Theme';
import { INTERVENTION_MODE_TEXTS } from '../constants/Strings';

export default function InterventionModeToggle({ mode = 'admin', onModeChange }) {
  const isAdmin = mode === 'admin';

  return (
    <View style={styles.wrapper}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.segment, isAdmin && styles.segmentAdminActive]}
          onPress={() => onModeChange('admin')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, isAdmin && styles.segmentTextActive]}>
            {INTERVENTION_MODE_TEXTS.admin}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segment, !isAdmin && styles.segmentAssistantActive]}
          onPress={() => onModeChange('assistant')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, !isAdmin && styles.segmentTextActive]}>
            {INTERVENTION_MODE_TEXTS.assistant}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.xxl,
    borderWidth: 1.5,
    borderColor: colors.separator,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  segmentAdminActive: {
    backgroundColor: colors.primary,
  },
  segmentAssistantActive: {
    backgroundColor: colors.secondary,
  },
  segmentText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  segmentTextActive: {
    color: colors.white,
  },
});
