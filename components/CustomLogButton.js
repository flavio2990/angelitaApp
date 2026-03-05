import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/Theme';

const BUTTONS_PER_ROW = 2;

export default function CustomLogButton({ icon, label, color, onPress, scale = 1 }) {
  const { width } = useWindowDimensions();
  const buttonSize = Math.floor((Math.floor(width / BUTTONS_PER_ROW) - spacing.lg * 2) * scale);
  const iconSize = Math.round(buttonSize * 0.45);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color, width: buttonSize, height: buttonSize }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Image source={icon} style={[styles.icon, { width: iconSize, height: iconSize }]} resizeMode="contain" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
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
