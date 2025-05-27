import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';


export default function EditPersonForm({ person, onChange, isAdding, selectedArea, userType }) {
  const [showDropDown, setShowDropDown] = React.useState(false);

  const showArea =
    isAdding &&
    person?.tipo &&
    person.tipo !== 'Administrador';

  return (
    <View style={styles.container}>
      <ScrollView style={{ flexGrow: 1, width: '100%' }}>
        {isAdding && (
          <View style={styles.dropDownContainer}>
            <Dropdown
              label="Designar como:"
              placeholder={person?.tipo || 'Seleccionado'}
              mode="outlined"
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={person?.tipo || ''}
              onSelect={(value) => {
                if (value === 'Administrador') {
                  onChange({ ...person, tipo: value, area: '' });
                } else {
                  onChange({ ...person, tipo: value });
                }
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
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={person?.area || ''}
              onSelect={(value) => onChange({ ...person, area: value })}
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
        />
        <TextInput
          label="Edad"
          value={person?.edad || ''}
          onChangeText={(text) => onChange({ ...person, edad: text })}
          style={styles.styleInput}
          keyboardType="numeric"
        />
        <TextInput
          label="DNI"
          value={person?.dni || ''}
          onChangeText={(text) => onChange({ ...person, dni: text })}
          style={styles.styleInput}
        />
        <TextInput
          label="Nacimiento"
          value={person?.nacimiento || ''}
          onChangeText={(text) => onChange({ ...person, nacimiento: text })}
          style={styles.styleInput}
        />
        <TextInput
          label="Ingresó"
          value={person?.ingreso || ''}
          onChangeText={(text) => onChange({ ...person, ingreso: text })}
          style={styles.styleInput}
        />
        <TextInput
          label="Obra Social"
          value={person?.coberturaSocial || ''}
          onChangeText={(text) => onChange({ ...person, coberturaSocial: text })}
          style={styles.styleInput}
        />
        <TextInput
          label="Nacionalidad"
          value={person?.nacionalidad || ''}
          onChangeText={(text) => onChange({ ...person, nacionalidad: text })}
          style={styles.styleInput}
        />
        <TextInput
          label="Estado Civil"
          value={person?.estadoCivil || ''}
          onChangeText={(text) => onChange({ ...person, estadoCivil: text })}
          style={styles.styleInput}
        />
        <TextInput
          label="Peso"
          value={person?.peso || ''}
          onChangeText={(text) => onChange({ ...person, peso: text })}
          style={styles.styleInput}
          keyboardType="numeric"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  styleInput: {
    width: 250,
    marginBottom: 12,
  },
  dropDownContainer: {
    marginBottom: 16,
    width: '100%',
  },
});
