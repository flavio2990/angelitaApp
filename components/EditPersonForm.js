import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FORM_TEXTS, PERSON_TYPE_TEXTS, AREA_TEXTS } from '../constants/Strings';

export default function EditPersonForm({ person, onChange, isAdding, selectedArea, userType }) {
  const [showUserTypeDropDown, setShowUserTypeDropDown] = React.useState(false);
  const [showAreaDropDown, setShowAreaDropDown] = React.useState(false);
const insets = useSafeAreaInsets();

  const showArea =
    isAdding &&
    person?.tipo &&
    person.tipo !== 'Administrador';

  // Si estamos agregando y hay un selectedArea, establecerlo automáticamente
  React.useEffect(() => {
    if (isAdding && selectedArea && !person?.area) {
      onChange({ ...person, area: selectedArea });
    }
  }, [isAdding, selectedArea, person, onChange]);

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
              label={`${FORM_TEXTS.typeLabel}:`}
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
                { label: PERSON_TYPE_TEXTS.patient, value: PERSON_TYPE_TEXTS.patient },
                { label: PERSON_TYPE_TEXTS.nursing, value: PERSON_TYPE_TEXTS.nursing },
                { label: PERSON_TYPE_TEXTS.administrator, value: PERSON_TYPE_TEXTS.administrator },
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
              label={FORM_TEXTS.areaLabel}
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
          label={FORM_TEXTS.nameLabel}
          value={person?.nombre || ''}
          onChangeText={(text) => onChange({ ...person, nombre: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.ageLabel}
          value={person?.edad || ''}
          onChangeText={(text) => onChange({ ...person, edad: text })}
          style={styles.styleInput}
          keyboardType="numeric"
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.dniLabel}
          value={person?.dni || ''}
          onChangeText={(text) => onChange({ ...person, dni: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.birthLabel}
          value={person?.nacimiento || ''}
          onChangeText={(text) => onChange({ ...person, nacimiento: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.admissionLabel}
          value={person?.ingreso || ''}
          onChangeText={(text) => onChange({ ...person, ingreso: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.socialCoverageLabel}
          value={person?.coberturaSocial || ''}
          onChangeText={(text) => onChange({ ...person, coberturaSocial: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.nationalityLabel}
          value={person?.nacionalidad || ''}
          onChangeText={(text) => onChange({ ...person, nacionalidad: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.maritalStatusLabel}
          value={person?.estadoCivil || ''}
          onChangeText={(text) => onChange({ ...person, estadoCivil: text })}
          style={styles.styleInput}
            mode="outlined"
            dense={false}
        />
        <TextInput
          label={FORM_TEXTS.weightLabel}
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
