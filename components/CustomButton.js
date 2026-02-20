import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { colors, typography, sizes, borderRadius } from '../constants/Theme';

export default function CustomButton({ onPress, label, disabled, style, ...props }) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      buttonColor={colors.primary}
      style={[styles.button, style]}
      labelStyle={styles.buttonLabel}
      disabled={disabled}
      {...props}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.buttonWidth,
    height: sizes.buttonHeight,
    justifyContent: 'center',
    borderRadius: borderRadius.pill,
  },
  buttonLabel: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xl,
  },
});