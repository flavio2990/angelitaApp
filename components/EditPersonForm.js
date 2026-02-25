import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FORM_TEXTS, PERSON_TYPE_TEXTS, VITALS_TEXTS } from '../constants/Strings';
import { ref, get } from 'firebase/database';
import { database } from '../env/firebase';
import { createPlanillaRecord } from '../components/services/helpers';
import { spacing } from '../constants/Theme';
import AppInput from './AppInput';

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
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef(null);
  
  const [vitalsFormValues, setVitalsFormValues] = React.useState(VITALS_INITIAL_VALUES);
  const [vitalsDataExists, setVitalsDataExists] = React.useState(false);
  const [isVitalsEditing, setIsVitalsEditing] = React.useState(false);

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
      console.log({
        location: 'EditPersonForm.saveSignosVitales - MISSING PARAMS',
        isVitalsMode: !!isVitalsMode,
        adminUid: !!adminUid,
        area: !!area,
        personId: !!personId,
      });
      return false;
    }

    const hasData = (vitalsFormValues.taSystolic && vitalsFormValues.taSystolic.trim() !== '') || 
                    (vitalsFormValues.taDiastolic && vitalsFormValues.taDiastolic.trim() !== '') || 
                    (vitalsFormValues.heartRate && vitalsFormValues.heartRate.trim() !== '') || 
                    (vitalsFormValues.respiratoryRate && vitalsFormValues.respiratoryRate.trim() !== '') || 
                    (vitalsFormValues.spo2 && vitalsFormValues.spo2.trim() !== '') || 
                    (vitalsFormValues.temperature && vitalsFormValues.temperature.trim() !== '');
    
    if (!hasData) {
      console.log( {
        location: 'EditPersonForm.saveSignosVitales - NO DATA',
      });
      return false;
    }

    let subject = null;
    try {
      const subjectRef = ref(database, `admins/${adminUid}/areas/${area}/subjects/${personId}`);
      const snapshot = await get(subjectRef);
      if (snapshot.exists()) {
        subject = snapshot.val();
      }
    } catch (error) {
      console.log( {
        location: 'EditPersonForm.saveSignosVitales - ERROR LOADING SUBJECT',
        error: error.message,
      });
    }

    if (!area) {
      console.log( {
        location: 'EditPersonForm.saveSignosVitales - MISSING AREA',
        area,
      });
    }

    try {
      const firebasePath = `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/signosVitales`;

      console.log({
        location: 'EditPersonForm.saveSignosVitales - BEFORE createPlanillaRecord',
        ownerUid: adminUid,
        authUid: adminUid,
        area,
        subjectId: personId,
        personId,
        subjectTipo: subject?.tipo,
        subjectArea: subject?.area,
        planillaType: 'signosVitales',
        firebasePath,
      });

      await createPlanillaRecord(
        adminUid,   // authUid
        adminUid,   // ownerUid
        area,
        personId,
        'signosVitales',
        {
          taSystolic: vitalsFormValues.taSystolic || '',
          taDiastolic: vitalsFormValues.taDiastolic || '',
          heartRate: vitalsFormValues.heartRate || '',
          respiratoryRate: vitalsFormValues.respiratoryRate || '',
          spo2: vitalsFormValues.spo2 || '',
          temperature: vitalsFormValues.temperature || '',
        }
      );

      setVitalsDataExists(true); 
      setIsVitalsEditing(false);
      Keyboard.dismiss();
      
      return true;
    } catch (error) {
      console.log({
        location: 'EditPersonForm.saveSignosVitales - CATCH ERROR',
        error: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
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
            style={{ flexGrow: 1, width: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            <AppInput
              type="numeric"
              label={VITALS_TEXTS.fields.taSystolic}
              value={vitalsFormValues.taSystolic}
              onChange={handleVitalsChange('taSystolic')}
              style={styles.styleInput}
              editable={isVitalsEditing}
            />
            <AppInput
              type="numeric"
              label={VITALS_TEXTS.fields.taDiastolic}
              value={vitalsFormValues.taDiastolic}
              onChange={handleVitalsChange('taDiastolic')}
              style={styles.styleInput}
              editable={isVitalsEditing}
            />
            <AppInput
              type="numeric"
              label={VITALS_TEXTS.fields.heartRate}
              value={vitalsFormValues.heartRate}
              onChange={handleVitalsChange('heartRate')}
              style={styles.styleInput}
              editable={isVitalsEditing}
            />
            <AppInput
              type="numeric"
              label={VITALS_TEXTS.fields.respiratoryRate}
              value={vitalsFormValues.respiratoryRate}
              onChange={handleVitalsChange('respiratoryRate')}
              style={styles.styleInput}
              editable={isVitalsEditing}
            />
            <AppInput
              type="numeric"
              label={VITALS_TEXTS.fields.spo2}
              value={vitalsFormValues.spo2}
              onChange={handleVitalsChange('spo2')}
              style={styles.styleInput}
              editable={isVitalsEditing}
            />
            <AppInput
              type="decimal"
              label={VITALS_TEXTS.fields.temperature}
              value={vitalsFormValues.temperature}
              onChange={handleVitalsChange('temperature', true)}
              style={styles.styleInput}
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
            style={{ flexGrow: 1, width: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            {isAdding && userType && userType.toLowerCase() !== 'paciente' && (
              <AppInput
                type="dropdown"
                label={`${FORM_TEXTS.typeLabel}:`}
                placeholder={person?.tipo || 'Seleccionado'}
                value={person?.tipo || ''}
                onChange={(value) => {
                  if (value === 'Administrador') {
                    onChange({ ...person, tipo: value, area: '' });
                  } else {
                    onChange({ ...person, tipo: value });
                  }
                }}
                options={getTypeOptions()}
                style={styles.dropDownContainer}
              />
            )}
            {showArea && (
              <AppInput
                type="dropdown"
                label={FORM_TEXTS.areaLabel}
                placeholder={person?.area || 'Seleccionar área'}
                value={person?.area || ''}
                onChange={(value) => onChange({ ...person, area: value })}
                options={[
                  { label: 'UTI', value: 'UTI' },
                  { label: 'UCG', value: 'UCG' },
                ]}
                style={styles.dropDownContainer}
              />
            )}
            <AppInput
              label={FORM_TEXTS.nameLabel}
              value={person?.nombre || ''}
              onChange={(text) => onChange({ ...person, nombre: text })}
              style={styles.styleInput}
            />
            <AppInput
              type="numeric"
              label={FORM_TEXTS.ageLabel}
              value={person?.edad || ''}
              onChange={(text) => onChange({ ...person, edad: formatNumericInput(text) })}
              style={styles.styleInput}
            />
            <AppInput
              label={FORM_TEXTS.dniLabel}
              value={person?.dni || ''}
              onChange={(text) => onChange({ ...person, dni: text })}
              style={styles.styleInput}
            />
            <AppInput
              type="date"
              label={FORM_TEXTS.birthLabel}
              value={person?.nacimiento || ''}
              onChange={(val) => onChange({ ...person, nacimiento: val })}
              style={styles.styleInput}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
            <AppInput
              type="date"
              label={FORM_TEXTS.admissionLabel}
              value={person?.ingreso || ''}
              onChange={(val) => onChange({ ...person, ingreso: val })}
              style={styles.styleInput}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
            {!isEmployee && (
              <>
                <AppInput
                  label={FORM_TEXTS.socialCoverageLabel}
                  value={person?.coberturaSocial || ''}
                  onChange={(text) => onChange({ ...person, coberturaSocial: text })}
                  style={styles.styleInput}
                />
                <AppInput
                  label={FORM_TEXTS.maritalStatusLabel}
                  value={person?.estadoCivil || ''}
                  onChange={(text) => onChange({ ...person, estadoCivil: text })}
                  style={styles.styleInput}
                />
                <AppInput
                  type="numeric"
                  label={FORM_TEXTS.weightLabel}
                  value={person?.peso || ''}
                  onChange={(text) => onChange({ ...person, peso: formatNumericInput(text) })}
                  style={styles.styleInput}
                />
              </>
            )}
            <AppInput
              label={FORM_TEXTS.nationalityLabel}
              value={person?.nacionalidad || ''}
              onChange={(text) => onChange({ ...person, nacionalidad: text })}
              style={styles.styleInput}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  styleInput: {
    marginBottom: spacing.sm,
  },
  dropDownContainer: {
    marginBottom: spacing.md,
  },
});
