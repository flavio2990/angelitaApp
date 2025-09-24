import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FORM_TEXTS, PERSON_TYPE_TEXTS } from '../constants/Strings';

export default function EditPersonForm({ person, onChange, isAdding, selectedArea}) {
  const [showUserTypeDropDown, setShowUserTypeDropDown] = React.useState(false);
  const [showAreaDropDown, setShowAreaDropDown] = React.useState(false);
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef(null);

  const formatDateInput = (text) => {
    let cleaned = text.replace(/[^\d]/g, '');
    
    if (cleaned.length >= 1 && cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length >= 3 && cleaned.length <= 4) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    } else if (cleaned.length >= 5) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4, 8);
    }
    
    return cleaned;
  };

  const formatNumericInput = (text) => {
    return text.replace(/[^\d]/g, '');
  };

  const showArea =
    person?.tipo &&
    person.tipo !== 'Administrador';

  React.useEffect(() => {
    if (isAdding && selectedArea && !person?.area) {
      onChange({ ...person, area: selectedArea });
    }
  }, [isAdding, selectedArea, person, onChange]);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 46 }}
          style={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
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
                placeholder={person?.area || 'Seleccionar Ã¡rea'}
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
            onChangeText={(text) => onChange({ ...person, edad: formatNumericInput(text) })}
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
            onChangeText={(text) => {
              const formatted = formatDateInput(text);
              onChange({ ...person, nacimiento: formatted });
            }}
            style={styles.styleInput}
            keyboardType="numeric"
            mode="outlined"
            dense={false}
            placeholder="DD/MM/AAAA"
            maxLength={10}
          />
          <TextInput
            label={FORM_TEXTS.admissionLabel}
            value={person?.ingreso || ''}
            onChangeText={(text) => {
              const formatted = formatDateInput(text);
              onChange({ ...person, ingreso: formatted });
            }}
            style={styles.styleInput}
            keyboardType="numeric"
            mode="outlined"
            dense={false}
            placeholder="DD/MM/AAAA"
            maxLength={10}
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
            onChangeText={(text) => onChange({ ...person, peso: formatNumericInput(text) })}
            style={styles.styleInput}
            keyboardType="numeric"
            mode="outlined"
            dense={false}
          />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  styleInput: {
    width: 340,
    marginBottom: 8,
  },
  dropDownContainer: {
    marginBottom: 12,
    width: '100%',
  },
});
