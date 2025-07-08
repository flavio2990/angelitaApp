import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditPersonForm({ person, onChange, isAdding, selectedArea, userType }) {
  const [showUserTypeDropDown, setShowUserTypeDropDown] = React.useState(false);
  const [showAreaDropDown, setShowAreaDropDown] = React.useState(false);
  const insets = useSafeAreaInsets();

  const showArea =
    isAdding &&
    person?.tipo &&
    person.tipo !== 'Administrador';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 80}
    >
      <View style={styles.container}>
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          style={{ flexGrow: 1 }}
        >
          {isAdding && (
            <View style={styles.dropDownContainer}>
              <Dropdown
                label="Designar como:"
                placeholder={person?.tipo || 'Seleccionado'}
                mode="outlined"
                visible={showUserTypeDropDown}
                showDropDown={() => setShowUserTypeDropDown(true)}
                onDismiss={() => setShowUserTypeDropDown(false)}
                value={person?.tipo || ''}
                onSelect={(value) => {
                  if (value === 'Administrador') {
                    onChange({ ...person, tipo: value, area: '' });
                  } else {
                    onChange({ ...person, tipo: value });
                  }
                  setShowUserTypeDropDown(false);
                }}
                options={[
                  { label: 'Paciente', value: 'Paciente' },
                  { label: 'Enfermero', value: 'Enfermería' },
                  { label: 'Administrador', value: 'Administrador' },
                ]}
                theme={{
                  colors: {
                    text: '#000',
                    primary: '#007AFF',
                    placeholder: '#A9A9A9',
                  },
                }}
                style={styles.dropdown}
              />
            </View>
          )}
          {showArea && (
            <View style={styles.dropDownContainer}>
              <Dropdown
                label="Área"
                placeholder={person?.area || 'Seleccionar área'}
                mode="outlined"
                visible={showAreaDropDown}
                showDropDown={() => setShowAreaDropDown(true)}
                onDismiss={() => setShowAreaDropDown(false)}
                value={person?.area || ''}
                onSelect={(value) => {
                  onChange({ ...person, area: value });
                  setShowAreaDropDown(false);
                }}
                options={[
                  { label: 'UTI', value: 'UTI' },
                  { label: 'UCG', value: 'UCG' },
                ]}
                theme={{
                  colors: {
                    text: '#000',
                    primary: '#007AFF',
                    placeholder: '#A9A9A9',
                  },
                }}
                style={styles.dropdown}
              />
            </View>
          )}
          <TextInput
            label="Nombre"
            value={person?.nombre || ''}
            onChangeText={(text) => onChange({ ...person, nombre: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Edad"
            value={person?.edad || ''}
            onChangeText={(text) => onChange({ ...person, edad: text })}
            style={styles.styleInput}
            keyboardType="numeric"
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="DNI"
            value={person?.dni || ''}
            onChangeText={(text) => onChange({ ...person, dni: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Nacimiento"
            value={person?.nacimiento || ''}
            onChangeText={(text) => onChange({ ...person, nacimiento: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Ingresó"
            value={person?.ingreso || ''}
            onChangeText={(text) => onChange({ ...person, ingreso: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Obra Social"
            value={person?.coberturaSocial || ''}
            onChangeText={(text) => onChange({ ...person, coberturaSocial: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Nacionalidad"
            value={person?.nacionalidad || ''}
            onChangeText={(text) => onChange({ ...person, nacionalidad: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Estado Civil"
            value={person?.estadoCivil || ''}
            onChangeText={(text) => onChange({ ...person, estadoCivil: text })}
            style={styles.styleInput}
            mode="outlined"
            dense={false}
          />
          <TextInput
            label="Peso"
            value={person?.peso || ''}
            onChangeText={(text) => onChange({ ...person, peso: text })}
            style={styles.styleInput}
            keyboardType="numeric"
            mode="outlined"
            dense={false}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  styleInput: {
    width: 350,
    marginBottom: 12,
  },
  dropDownContainer: {
    marginBottom: 16,
    width: '100%',
  },
});
