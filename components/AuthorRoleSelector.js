import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-paper-dropdown';
import { MEDICATION_TEXTS } from '../constants/Strings';

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
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Opciones del dropdown: label para mostrar, value para filtrar
  const roles = [
    { label: 'Empleados', value: 'employee' },
    { label: 'Administrador', value: 'admin' },
  ];

  // El Dropdown usa el value directamente, no el label
  // selectedRole debe ser 'employee' | 'admin'
  const currentValue = selectedRole || 'employee';

  return (
    <View style={[styles.container, style]}>
      <Dropdown
        label={MEDICATION_TEXTS.authorRoleLabel}
        placeholder="Seleccionar"
        mode="outlined"
        visible={showDropdown}
        showDropDown={() => setShowDropdown(true)}
        onDismiss={() => setShowDropdown(false)}
        value={currentValue}
        onSelect={(value) => {
          // onSelect recibe directamente el option.value ('employee' | 'admin')
          if (value === 'employee' || value === 'admin') {
            onRoleChange(value);
          }
          setShowDropdown(false);
        }}
        options={roles}
        theme={{
          colors: {
            text: '#000',
            primary: '#5124A5',
            placeholder: '#A9A9A9',
          },
        }}
        style={styles.dropdown}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#ffffff',
  },
});
