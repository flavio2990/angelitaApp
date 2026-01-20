import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ref, get } from 'firebase/database';
import { database } from '../env/firebase';
import { createPlanillaRecord } from './services/helpers';
import { VITALS_TEXTS } from '../constants/Strings';

const INITIAL_VALUES = {
  taSystolic: '',
  taDiastolic: '',
  heartRate: '',
  spo2: '',
  temperature: '',
  glucose: '',
};

const sanitizeValue = (value, allowDecimal = false) => {
  if (allowDecimal) {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return `${parts[0]}.${parts[1]}`;
  }
    return sanitized;
  }
  return value.replace(/[^0-9]/g, '');
};

export default function VitalSignsColumns({ 
  adminUid,
  area,
  personId,
  patientName,
  visible,
  onModify,
  onSave,
}) {
  const [formValues, setFormValues] = useState(INITIAL_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataExists, setDataExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = useCallback((field, allowDecimal = false) => (value) => {
    const sanitized = sanitizeValue(value, allowDecimal);
    setFormValues((prev) => ({
      ...prev,
      [field]: sanitized,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormValues(INITIAL_VALUES);
    setDataExists(false);
    setIsEditing(true);
  }, []);

  const loadSignosVitales = useCallback(async () => {
    if (!adminUid || !area || !personId) return;
    
    setIsLoading(true);
    try {
      const signosRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/signosVitales`
      );
      const snapshot = await get(signosRef);
      
      if (snapshot.exists()) {
        const records = snapshot.val();
        const recordKeys = Object.keys(records);
        
        if (recordKeys.length > 0) {
          const latestRecordKey = recordKeys.reduce((latest, key) => {
            const latestDate = records[latest]?.createdAt || '';
            const currentDate = records[key]?.createdAt || '';
            return currentDate > latestDate ? key : latest;
          }, recordKeys[0]);
          
          const latestRecord = records[latestRecordKey];
          setFormValues({
            taSystolic: latestRecord.taSystolic || '',
            taDiastolic: latestRecord.taDiastolic || '',
            heartRate: latestRecord.heartRate || '',
            respiratoryRate: latestRecord.respiratoryRate || '',
            spo2: latestRecord.spo2 || '',
            temperature: latestRecord.temperature || '',
            glucose: latestRecord.glucose || '',
          });
          setDataExists(true);
          setIsEditing(false);
        } else {
          resetForm();
        }
      } else {
        resetForm();
      }
    } catch (error) {
      console.error('Error loading vital signs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [adminUid, area, personId, resetForm]);

  const saveSignosVitales = useCallback(async () => {
    if (!adminUid || !area || !personId) {
      console.log({
        location: 'VitalSignsColumns.saveSignosVitales - MISSING PARAMS',
        adminUid: !!adminUid,
        area: !!area,
        personId: !!personId,
      });
      return;
    }
    
    let subject = null;
    try {
      const subjectRef = ref(database, `admins/${adminUid}/areas/${area}/subjects/${personId}`);
      const snapshot = await get(subjectRef);
      if (snapshot.exists()) {
        subject = snapshot.val();
      }
    } catch (error) {
      console.log({
        location: 'VitalSignsColumns.saveSignosVitales - ERROR LOADING SUBJECT',
        error: error.message,
      });
    }

    if (!area) {
      console.log({
        location: 'VitalSignsColumns.saveSignosVitales - MISSING AREA',
        area,
      });
    }
    
    setIsSaving(true);
    try {
      const firebasePath = `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/signosVitales`;

      console.log({
        location: 'VitalSignsColumns.saveSignosVitales - BEFORE createPlanillaRecord',
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
        adminUid,
        adminUid,
        area,
        personId,
        'signosVitales',
        {
          taSystolic: formValues.taSystolic || '',
          taDiastolic: formValues.taDiastolic || '',
          heartRate: formValues.heartRate || '',
          respiratoryRate: formValues.respiratoryRate || '',
          spo2: formValues.spo2 || '',
          temperature: formValues.temperature || '',
        }
      );

      setDataExists(true);
      setIsEditing(false);
      Keyboard.dismiss();
    } catch (error) {
        console.log({
        location: 'VitalSignsColumns.saveSignosVitales - CATCH ERROR',
        error: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      console.error('Error saving vital signs:', error);
    } finally {
      setIsSaving(false);
    }
  }, [adminUid, area, personId, formValues]);

  useEffect(() => {
    if (adminUid && area && personId) {
      loadSignosVitales();
    } else {
      resetForm();
    }
  }, [adminUid, area, personId, loadSignosVitales, resetForm]);

  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
    } else if (!dataExists) {
      setIsEditing(true);
    }
  }, [visible, dataExists]);

  useEffect(() => {
      if (onModify) {
      onModify.current = () => setIsEditing(true);
      }
      if (onSave) {
      onSave.current = async () => {
        await saveSignosVitales();
      };
    }
  }, [onModify, onSave, saveSignosVitales]);

  if (!adminUid || !area || !personId || !patientName) {
    return null;
  }

  const inputEditable = isEditing && !isLoading && !isSaving;

    return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <TextInput
          mode="outlined"
          label={VITALS_TEXTS.fields.taSystolic}
          value={formValues.taSystolic}
          onChangeText={handleChange('taSystolic')}
          keyboardType="number-pad"
          style={styles.input}
          editable={inputEditable}
        />
        <TextInput
          mode="outlined"
          label={VITALS_TEXTS.fields.taDiastolic}
          value={formValues.taDiastolic}
          onChangeText={handleChange('taDiastolic')}
          keyboardType="number-pad"
          style={styles.input}
          editable={inputEditable}
        />
            <TextInput
          mode="outlined"
          label={VITALS_TEXTS.fields.heartRate}
          value={formValues.heartRate}
          onChangeText={handleChange('heartRate')}
              keyboardType="number-pad"
          style={styles.input}
          editable={inputEditable}
        />
            <TextInput
          mode="outlined"
          label={VITALS_TEXTS.fields.spo2}
          value={formValues.spo2}
          onChangeText={handleChange('spo2')}
              keyboardType="number-pad"
          style={styles.input}
          editable={inputEditable}
        />
        <TextInput
          mode="outlined"
          label={VITALS_TEXTS.fields.temperature}
          value={formValues.temperature}
          onChangeText={handleChange('temperature', true)}
          keyboardType="decimal-pad"
          style={styles.input}
          editable={inputEditable}
        />
            <TextInput
          mode="outlined"
          label={VITALS_TEXTS.fields.glucose}
          value={formValues.glucose}
          onChangeText={handleChange('glucose')}
              keyboardType="number-pad"
          style={styles.input}
          editable={inputEditable}
        />
      </View>
        </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 440,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    marginHorizontal: 4,
  },
});