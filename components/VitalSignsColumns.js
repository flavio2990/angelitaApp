import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ref, set, update, get } from 'firebase/database';
import { database } from '../env/firebase';
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
        `admins/${adminUid}/areas/${area}/personas/${personId}/planillas/signosVitales`
      );
      const snapshot = await get(signosRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setFormValues({
          taSystolic: data.taSystolic || '',
          taDiastolic: data.taDiastolic || '',
          heartRate: data.heartRate || '',
          spo2: data.spo2 || '',
          temperature: data.temperature || '',
          glucose: data.glucose || '',
        });
        setDataExists(true);
        setIsEditing(false);
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
    if (!adminUid || !area || !personId) return;

    setIsSaving(true);
    try {
      const signosRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/personas/${personId}/planillas/signosVitales`
      );

      const dataToSave = {
        taSystolic: formValues.taSystolic,
        taDiastolic: formValues.taDiastolic,
        heartRate: formValues.heartRate,
        spo2: formValues.spo2,
        temperature: formValues.temperature,
        glucose: formValues.glucose,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
      };

      if (!dataExists) {
        await set(signosRef, {
          ...dataToSave,
          createdAt: new Date().toISOString(),
          createdBy: adminUid,
        });
        setDataExists(true);
      } else {
        await update(signosRef, dataToSave);
      }

      setIsEditing(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error saving vital signs:', error);
    } finally {
      setIsSaving(false);
    }
  }, [adminUid, area, personId, formValues, dataExists]);

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