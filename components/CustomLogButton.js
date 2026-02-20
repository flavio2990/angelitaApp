import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows, sizes } from '../constants/Theme';

export default function CustomLogButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.logButtonSize,
    height: sizes.logButtonSize,
    borderRadius: borderRadius.logButton,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.lg,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: sizes.logButtonIcon,
    height: sizes.logButtonIcon,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
