import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MEDICATION_TEXTS } from '../constants/Strings';
import { colors, spacing } from '../constants/Theme';
import AppInput from './AppInput';

/**
 * Componente selector de autoría para filtrar medicación por rol
 * Se muestra ANTES del modal, en la vista de estado actual
 * 
 * UX: Explícito, siempre visible, no oculta información
 */
export default function AuthorRoleSelector({
  selectedRole,
  onRoleChange,
  style
}) {
  const roles = [
    { label: 'Empleados', value: 'employee' },
    { label: 'Administrador', value: 'admin' },
  ];

  const currentValue = selectedRole || 'employee';

  return (
    <View style={[styles.container, style]}>
      <AppInput
        type="dropdown"
        label={MEDICATION_TEXTS.authorRoleLabel}
        placeholder="Seleccionar"
        value={currentValue}
        onChange={(value) => {
          if (value === 'employee' || value === 'admin') {
            onRoleChange(value);
          }
        }}
        options={roles}
        style={styles.dropdown}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  dropdown: {
    backgroundColor: colors.white,
  },
});
