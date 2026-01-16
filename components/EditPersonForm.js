import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';
import { FORM_TEXTS, PERSON_TYPE_TEXTS, VITALS_TEXTS } from '../constants/Strings';
import { ref, set, update, get, push } from 'firebase/database';
import { database } from '../env/firebase';

const VITALS_INITIAL_VALUES = {
  taSystolic: '',
  taDiastolic: '',
  heartRate: '',
  respiratoryRate: '',
  spo2: '',
  temperature: '',
};

const formatNumericInput = (text) => {
  return text.replace(/[^\d]/g, '');
};

const formatDecimalInput = (text) => {
  const sanitized = text.replace(/[^0-9.]/g, '');
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return sanitized;
};

export default function EditPersonForm({ 
  person, 
  onChange, 
  isAdding, 
  selectedArea, 
  userType,
  isVitalsMode = false,
  adminUid = null,
  area = null,
  personId = null,
  visible = true,
  onModify = null,
  onSave = null,
  onVitalsDataExistsChange = null,
}) {
  const [showUserTypeDropDown, setShowUserTypeDropDown] = React.useState(false);
  const [showAreaDropDown, setShowAreaDropDown] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedBirthDate, setSelectedBirthDate] = React.useState(new Date());
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef(null);
  
  const [vitalsFormValues, setVitalsFormValues] = React.useState(VITALS_INITIAL_VALUES);
  const [vitalsDataExists, setVitalsDataExists] = React.useState(false);
  const [isVitalsEditing, setIsVitalsEditing] = React.useState(false);

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


  const formatDateForDisplay = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDatePickerChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) { 
        setSelectedDate(date);
        onChange({ ...person, ingreso: formatDateForDisplay(date) });
      }
    } else {
      setSelectedDate(date || new Date());
    }
  };

  const handleConfirmDate = () => {
    setShowDatePicker(false);
    onChange({ ...person, ingreso: formatDateForDisplay(selectedDate) });
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
  };

    const handleBirthDatePickerChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowBirthDatePicker(false); 
      if (event.type === 'set' && date) { 
        setSelectedBirthDate(date);
        onChange({ ...person, nacimiento: formatDateForDisplay(date) });
      }
    } else {
      setSelectedBirthDate(date || new Date());
    }
  };

  const handleConfirmBirthDate = () => {
    setShowBirthDatePicker(false);
    onChange({ ...person, nacimiento: formatDateForDisplay(selectedBirthDate) });
  };

  const handleCancelBirthDate = () => {
    setShowBirthDatePicker(false);
  };

  const showArea =
    person?.tipo &&
    person.tipo !== 'Administrador';

  const isEmployee = person?.tipo && 
    (person.tipo.toLowerCase() === 'enfermería' || person.tipo.toLowerCase() === 'administrador');

  const getTypeOptions = () => {
    if (userType && userType.toLowerCase() === 'enfermería') {
      return [
        { label: PERSON_TYPE_TEXTS.nursing, value: PERSON_TYPE_TEXTS.nursing },
        { label: PERSON_TYPE_TEXTS.administrator, value: PERSON_TYPE_TEXTS.administrator },
      ];
    } else if (userType && userType.toLowerCase() === 'paciente') {
      return [];
    } else {
      return [
        { label: PERSON_TYPE_TEXTS.patient, value: PERSON_TYPE_TEXTS.patient },
        { label: PERSON_TYPE_TEXTS.nursing, value: PERSON_TYPE_TEXTS.nursing },
        { label: PERSON_TYPE_TEXTS.administrator, value: PERSON_TYPE_TEXTS.administrator },
      ];
    }
  };

  const handleVitalsChange = React.useCallback((field, allowDecimal = false) => (text) => {
    const sanitized = allowDecimal ? formatDecimalInput(text) : formatNumericInput(text);
    setVitalsFormValues((prev) => ({
      ...prev,
      [field]: sanitized,
    }));
  }, []);

  const resetVitalsForm = React.useCallback(() => {
    setVitalsFormValues(VITALS_INITIAL_VALUES);
    setVitalsDataExists(false);
    setIsVitalsEditing(true);
  }, []);

  const loadSignosVitales = React.useCallback(async () => {
    if (!isVitalsMode || !adminUid || !area || !personId) return;

    try {
      const signosRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/signosVitales`
      );
      const snapshot = await get(signosRef);

      if (snapshot.exists()) {
        setVitalsDataExists(true);
      } else {
        setVitalsDataExists(false);
      }
      
      setVitalsFormValues(VITALS_INITIAL_VALUES);
      setIsVitalsEditing(true);
    } catch (error) {
      console.error('Error loading vital signs:', error);
      setVitalsFormValues(VITALS_INITIAL_VALUES);
      setIsVitalsEditing(true);
    }
  }, [isVitalsMode, adminUid, area, personId, resetVitalsForm]);

  const saveSignosVitales = React.useCallback(async () => {
    if (!isVitalsMode || !adminUid || !area || !personId) {
      return false;
    }

    const hasData = (vitalsFormValues.taSystolic && vitalsFormValues.taSystolic.trim() !== '') || 
                    (vitalsFormValues.taDiastolic && vitalsFormValues.taDiastolic.trim() !== '') || 
                    (vitalsFormValues.heartRate && vitalsFormValues.heartRate.trim() !== '') || 
                    (vitalsFormValues.respiratoryRate && vitalsFormValues.respiratoryRate.trim() !== '') || 
                    (vitalsFormValues.spo2 && vitalsFormValues.spo2.trim() !== '') || 
                    (vitalsFormValues.temperature && vitalsFormValues.temperature.trim() !== '');
    
    if (!hasData) {
      return false;
    }

    try {
      const signosRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/signosVitales`
      );

      const newRecord = {
        taSystolic: vitalsFormValues.taSystolic || '',
        taDiastolic: vitalsFormValues.taDiastolic || '',
        heartRate: vitalsFormValues.heartRate || '',
        respiratoryRate: vitalsFormValues.respiratoryRate || '',
        spo2: vitalsFormValues.spo2 || '',
        temperature: vitalsFormValues.temperature || '',
        createdAt: new Date().toISOString(),
        createdBy: adminUid,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
        personId: personId, 
      };

      await push(signosRef, newRecord);

      setVitalsDataExists(true); 
      setIsVitalsEditing(false);
      Keyboard.dismiss();
      
      return true;
    } catch (error) {
      console.error('Error saving vital signs:', error);
      return false;
    }
  }, [isVitalsMode, adminUid, area, personId, vitalsFormValues]);

  React.useEffect(() => {
    if (isAdding && selectedArea && !person?.area) {
      onChange({ ...person, area: selectedArea });
    }
  }, [isAdding, selectedArea, person, onChange]);

  React.useEffect(() => {
    if (isAdding && userType && !person?.tipo) {
      if (userType.toLowerCase() === 'enfermería') {
        onChange({ ...person, tipo: PERSON_TYPE_TEXTS.nursing });
      } else if (userType.toLowerCase() === 'paciente') {
        onChange({ ...person, tipo: PERSON_TYPE_TEXTS.patient });
      }
    }
  }, [isAdding, userType, person, onChange]);

  React.useEffect(() => {
    if (isVitalsMode && adminUid && area && personId) {
      loadSignosVitales();
    } else if (isVitalsMode) {
      resetVitalsForm();
    }
  }, [isVitalsMode, adminUid, area, personId, loadSignosVitales, resetVitalsForm]);

  React.useEffect(() => {
    if (isVitalsMode && onVitalsDataExistsChange) {
      onVitalsDataExistsChange(false);
    }
  }, [isVitalsMode, onVitalsDataExistsChange]);

  React.useEffect(() => {
    if (isVitalsMode) {
      if (!visible) {
        setIsVitalsEditing(false);
        const resetTimer = setTimeout(() => {
          setVitalsFormValues(VITALS_INITIAL_VALUES);
        }, 500);
        return () => clearTimeout(resetTimer);
      } else {
        setIsVitalsEditing(true);
      }
    }
  }, [isVitalsMode, visible]);

  React.useEffect(() => {
    if (isVitalsMode) {
      if (onModify) {
        onModify.current = () => setIsVitalsEditing(true);
      }
      if (onSave) {
        onSave.current = async () => {
          return await saveSignosVitales();
        };
      }
    }
  }, [isVitalsMode, onModify, onSave, saveSignosVitales]);

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

  if (isVitalsMode) {
    if (!adminUid || !area || !personId) {
      return null;
    }

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
            <TextInput
              mode="outlined"
              label={VITALS_TEXTS.fields.taSystolic}
              value={vitalsFormValues.taSystolic}
              onChangeText={handleVitalsChange('taSystolic')}
              keyboardType="numeric"
              style={styles.styleInput}
              dense={false}
              editable={isVitalsEditing}
            />
            <TextInput
              mode="outlined"
              label={VITALS_TEXTS.fields.taDiastolic}
              value={vitalsFormValues.taDiastolic}
              onChangeText={handleVitalsChange('taDiastolic')}
              keyboardType="numeric"
              style={styles.styleInput}
              dense={false}
              editable={isVitalsEditing}
            />
            <TextInput
              mode="outlined"
              label={VITALS_TEXTS.fields.heartRate}
              value={vitalsFormValues.heartRate}
              onChangeText={handleVitalsChange('heartRate')}
              keyboardType="numeric"
              style={styles.styleInput}
              dense={false}
              editable={isVitalsEditing}
            />
            <TextInput
              mode="outlined"
              label={VITALS_TEXTS.fields.respiratoryRate}
              value={vitalsFormValues.respiratoryRate}
              onChangeText={handleVitalsChange('respiratoryRate')}
              keyboardType="numeric"
              style={styles.styleInput}
              dense={false}
              editable={isVitalsEditing}
            />
            <TextInput
              mode="outlined"
              label={VITALS_TEXTS.fields.spo2}
              value={vitalsFormValues.spo2}
              onChangeText={handleVitalsChange('spo2')}
              keyboardType="numeric"
              style={styles.styleInput}
              dense={false}
              editable={isVitalsEditing}
            />
            <TextInput
              mode="outlined"
              label={VITALS_TEXTS.fields.temperature}
              value={vitalsFormValues.temperature}
              onChangeText={handleVitalsChange('temperature', true)}
              keyboardType="decimal-pad"
              style={styles.styleInput}
              dense={false}
              editable={isVitalsEditing}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 46 }}
            style={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
          >
            {isAdding && userType && userType.toLowerCase() !== 'paciente' && (
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
                  options={getTypeOptions()}
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
                      primary: '#5124A5',
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
              onPressIn={() => setShowBirthDatePicker(true)}
              style={styles.styleInput}
              mode="outlined"
              dense={false}
              placeholder="DD/MM/AAAA"
              editable={false}
              right={
                <TextInput.Icon 
                  icon="calendar" 
                  onPress={() => setShowBirthDatePicker(true)}
                />
              }
            />
            <TextInput
              label={FORM_TEXTS.admissionLabel}
              value={person?.ingreso || ''}
              onPressIn={() => setShowDatePicker(true)}
              style={styles.styleInput}
              mode="outlined"
              dense={false}
              placeholder="DD/MM/AAAA"
              editable={false}
              right={
                <TextInput.Icon 
                  icon="calendar" 
                  onPress={() => setShowDatePicker(true)}
                />
              }
            />
            {!isEmployee && (
              <>
                <TextInput
                  label={FORM_TEXTS.socialCoverageLabel}
                  value={person?.coberturaSocial || ''}
                  onChangeText={(text) => onChange({ ...person, coberturaSocial: text })}
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
              </>
            )}
            <TextInput
              label={FORM_TEXTS.nationalityLabel}
              value={person?.nacionalidad || ''}
              onChangeText={(text) => onChange({ ...person, nacionalidad: text })}
              style={styles.styleInput}
              mode="outlined"
              dense={false}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default" 
          onChange={handleDatePickerChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Button onPress={handleCancelDate} mode="text">
                  Cancelar
                </Button>
                <Button onPress={handleConfirmDate} mode="contained">
                  Confirmar
                </Button>
              </View>
              <View style={styles.datePickerContainer}>
                <DatePicker
                  date={selectedDate}
                  mode="date"
                  onDateChange={setSelectedDate}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={styles.customDatePicker}
                  textColor="#FFFFFF"
                  theme="dark"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showBirthDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedBirthDate}
          mode="date"
          display="spinner" 
          onChange={handleBirthDatePickerChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {showBirthDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showBirthDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBirthDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Button onPress={handleCancelBirthDate} mode="text">
                  Cancelar
                </Button>
                <Button onPress={handleConfirmBirthDate} mode="contained">
                  Confirmar
                </Button>
              </View>
              <View style={styles.datePickerContainer}>
                <DatePicker
                  date={selectedBirthDate}
                  mode="date"
                  onDateChange={setSelectedBirthDate}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={styles.customDatePicker}
                  textColor="#FFFFFF"
                  theme="dark"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerContainer: {
    backgroundColor: '#5124A5',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  customDatePicker: {
    height: 200,
    backgroundColor: 'transparent',
  },
});
