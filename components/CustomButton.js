import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function CustomButton({ onPress, label, disabled, style, ...props }) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      buttonColor="#5124A5"
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
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});