import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

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
    width: 150,
    height: 150,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
