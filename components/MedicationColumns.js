import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ref, get } from 'firebase/database';
import { database } from '../env/firebase';
import { createPlanillaRecord } from '../components/services/helpers';
import { MEDICATION_TEXTS } from '../constants/Strings.js';
import Icon from 'react-native-vector-icons/MaterialIcons';

const INITIAL_MEDICATION = {
  id: Date.now().toString(),
  droga: '',
  hora: '',
  dosis: '1',
};

const formatHora = (value) => {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  const hours = cleaned.slice(0, 2);
  const minutes = cleaned.slice(2, 4);
  return hours + ':' + minutes;
};

export default function MedicationColumns({ 
  adminUid,
  area,
  personId,
  patientName,
  visible,
  onModify,
  onSave,
  onDataExistsChange = null,
  onMedicationCountChange = null,
  vitalsView = 'nuevo',
}) {
  const [medications, setMedications] = useState([
    { ...INITIAL_MEDICATION, id: Date.now().toString() },
    { ...INITIAL_MEDICATION, id: (Date.now() + 1).toString() },
    { ...INITIAL_MEDICATION, id: (Date.now() + 2).toString() },
    { ...INITIAL_MEDICATION, id: (Date.now() + 3).toString() },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataExists, setDataExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createdBy, setCreatedBy] = useState(null);
  
  const medicationsRef = useRef(medications);
  const dataExistsRef = useRef(dataExists);
  const createdByRef = useRef(null);

  const validateSubjectType = useCallback(async () => {
    if (!adminUid || !area || !personId) return false;
    
    try {
      const subjectRef = ref(database, `admins/${adminUid}/areas/${area}/subjects/${personId}`);
      const snapshot = await get(subjectRef);
      
      if (snapshot.exists()) {
        const subject = snapshot.val();
        return subject?.tipo === 'Paciente';
      }
      return false;
    } catch (error) {
      console.error('Error validating subject type:', error);
      return false;
    }
  }, [adminUid, area, personId]);

  const handleMedicationChange = useCallback(async (id, field, value) => {
    let processedValue = value;
    if (field === 'hora') {
      processedValue = formatHora(value);
      if (processedValue.length === 5) {
        const [hours, minutes] = processedValue.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (h > 23 || m > 59) {
          return;
        }
      }
    }
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, [field]: processedValue } : med
      )
    );
  }, []);

  const addMedicationLine = useCallback(() => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMedication = { ...INITIAL_MEDICATION, id: newId };
    setMedications((prev) => [...prev, newMedication]);
  }, []);

  const removeMedicationLine = useCallback((id) => {
    setMedications((prev) => {
      const filtered = prev.filter((med) => med.id !== id);
      return filtered.length > 0 ? filtered : [
        { ...INITIAL_MEDICATION, id: Date.now().toString() },
        { ...INITIAL_MEDICATION, id: (Date.now() + 1).toString() },
        { ...INITIAL_MEDICATION, id: (Date.now() + 2).toString() },
        { ...INITIAL_MEDICATION, id: (Date.now() + 3).toString() },
      ];
    });
  }, []);

  const resetForm = useCallback(() => {
    setMedications([
      { ...INITIAL_MEDICATION, id: Date.now().toString() },
      { ...INITIAL_MEDICATION, id: (Date.now() + 1).toString() },
      { ...INITIAL_MEDICATION, id: (Date.now() + 2).toString() },
      { ...INITIAL_MEDICATION, id: (Date.now() + 3).toString() },
    ]);
    setDataExists(false);
    setCreatedBy(null);
    createdByRef.current = null;
    setIsEditing(true);
  }, []);

  const loadMedication = useCallback(async () => {
    if (!adminUid || !area || !personId) return;
    
    const isValidSubject = await validateSubjectType();
    if (!isValidSubject) {
      console.warn('MedicationColumns: Subject is not a Paciente. Medication cannot be loaded.');
      resetForm();
      if (onDataExistsChange) {
        onDataExistsChange(false);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      const medicationRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/medicacion`
      );
      const snapshot = await get(medicationRef);
      
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
          const planillaCreatedBy = latestRecord?.createdBy || null;
          
          setCreatedBy(planillaCreatedBy);
          createdByRef.current = planillaCreatedBy;
          
          const medicationsArray = [];
          recordKeys.forEach((key) => {
            const record = records[key];
            if (record?.medications) {
              medicationsArray.push({
                id: key,
                droga: record.medications.droga || '',
                hora: record.medications.hora || '',
                dosis: record.medications.dosis || '1',
              });
            }
          });
          
          if (medicationsArray.length > 0) {
            setMedications(medicationsArray);
          } else {
            setMedications([
              { ...INITIAL_MEDICATION, id: Date.now().toString() },
              { ...INITIAL_MEDICATION, id: (Date.now() + 1).toString() },
              { ...INITIAL_MEDICATION, id: (Date.now() + 2).toString() },
              { ...INITIAL_MEDICATION, id: (Date.now() + 3).toString() },
            ]);
          }
          setDataExists(true);
          setIsEditing(false);
          if (onDataExistsChange) {
            onDataExistsChange(true);
          }
        } else {
          resetForm();
          if (onDataExistsChange) {
            onDataExistsChange(false);
          }
        }
      } else {
        resetForm();
        if (onDataExistsChange) {
          onDataExistsChange(false);
        }
      }
    } catch (error) {
      console.error('Error loading medication:', error);
      if (onDataExistsChange) {
        onDataExistsChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminUid, area, personId, resetForm, onDataExistsChange, validateSubjectType]);

  useEffect(() => {
    medicationsRef.current = medications;
  }, [medications]);

  useEffect(() => {
    dataExistsRef.current = dataExists;
  }, [dataExists]);

  useEffect(() => {
    createdByRef.current = createdBy;
  }, [createdBy]);

  const saveMedication = useCallback(async () => {
    if (!adminUid || !area || !personId) {
      console.log({
        location: 'MedicationColumns.saveMedication - MISSING PARAMS',
        adminUid: !!adminUid,
        area: !!area,
        personId: !!personId,
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
      console.log({
        location: 'MedicationColumns.saveMedication - ERROR LOADING SUBJECT',
        error: error.message,
      });
    }
    
    const isValidSubject = await validateSubjectType();
    if (!isValidSubject) {
      console.log({
        location: 'MedicationColumns.saveMedication - INVALID SUBJECT TYPE',
        subjectTipo: subject?.tipo,
        expectedTipo: 'Paciente',
      });
      console.warn('MedicationColumns: Subject is not a Paciente. Medication cannot be saved.');
      return false;
    }
    
    setIsSaving(true);
    try {
      const currentMedications = medicationsRef.current;
      const validMedications = currentMedications.filter(
        (med) => med.droga && med.droga.trim() !== ''
      );
      
      if (validMedications.length === 0) {
        console.log({
          location: 'MedicationColumns.saveMedication - NO VALID MEDICATIONS',
        });
        return false;
      }

      const firebasePath = `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/medicacion`;

      for (const med of validMedications) {
        console.log({
          location: 'MedicationColumns.saveMedication - BEFORE createPlanillaRecord',
          ownerUid: adminUid,
          authUid: adminUid,
          area,
          subjectId: personId,
          personId,
          subjectTipo: subject?.tipo,
          subjectArea: subject?.area,
          planillaType: 'medicacion',
          firebasePath,
        });

        await createPlanillaRecord(
          adminUid,
          adminUid,
          area,
          personId,
          'medicacion',
          {
            droga: med.droga || '',
            hora: med.hora || '',
            dosis: med.dosis || '1',
          }
        );
      }

      setDataExists(true);
      setCreatedBy(adminUid);
      dataExistsRef.current = true;
      createdByRef.current = adminUid;
      if (onDataExistsChange) {
        onDataExistsChange(true);
      }

      setIsEditing(false);
      Keyboard.dismiss();
      return true;
    } catch (error) {
        console.log({
        location: 'MedicationColumns.saveMedication - CATCH ERROR',
        error: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      console.error('Error saving medication:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [adminUid, area, personId, onDataExistsChange, validateSubjectType]);

  useEffect(() => {
    if (adminUid && area && personId && vitalsView === 'anterior') {
      loadMedication();
    } else if (adminUid && area && personId && vitalsView === 'nuevo') {
      resetForm();
      if (onDataExistsChange) {
        onDataExistsChange(false);
      }
    } else {
      resetForm();
    }
  }, [adminUid, area, personId, vitalsView, loadMedication, resetForm, onDataExistsChange]);

  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [visible]);

  useEffect(() => {
    if (onMedicationCountChange) {
      onMedicationCountChange(medications.length);
    }
  }, [medications.length, onMedicationCountChange]);

  useEffect(() => {
    if (onModify) {
      onModify.current = () => {
        setIsEditing(true);
      };
    }
    if (onSave) {
      onSave.current = async () => {
        return await saveMedication();
      };
    }
  }, [onModify, onSave, saveMedication]);

  if (!adminUid || !area || !personId) {
    return null;
  }

  const inputEditable = isEditing && !isLoading && !isSaving;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        style={styles.scrollView}
      >
        {medications.map((medication, index) => {
          const isFirstLine = index === 0;
          const placeholderDroga = isFirstLine ? MEDICATION_TEXTS.placeholders.droga : MEDICATION_TEXTS.addMore;
          const placeholderDosis = isFirstLine ? MEDICATION_TEXTS.placeholders.dosis : MEDICATION_TEXTS.addMore;
          
          return (
            <View key={medication.id} style={styles.tableRow}>
              <View style={styles.drogaColumn}>
                <TextInput
                  mode="outlined"
                  placeholder={placeholderDroga}
                  value={medication.droga}
                  onChangeText={(value) => handleMedicationChange(medication.id, 'droga', value)}
                  style={styles.input}
                  editable={inputEditable}
                  contentStyle={[
                    styles.inputContentDroga,
                    isFirstLine && { fontWeight: 'bold' },
                    !isFirstLine && { fontWeight: 'normal' },
                  ]}
                />
                {inputEditable && (
                  <Icon name="keyboard-arrow-up" size={16} color="#666" style={styles.arrowIcon} />
                )}
              </View>
              <View style={styles.horaColumn}>
                <TextInput
                  mode="outlined"
                  placeholder="HH:MM"
                  value={medication.hora}
                  onChangeText={(value) => handleMedicationChange(medication.id, 'hora', value)}
                  keyboardType="numeric"
                  maxLength={5}
                  style={styles.input}
                  editable={inputEditable}
                  contentStyle={[
                    styles.inputContent,
                    isFirstLine && { fontWeight: 'bold' },
                    !isFirstLine && { fontWeight: 'normal' },
                  ]}
                />
              </View>
              <View style={styles.dosisColumn}>
                <TextInput
                  mode="outlined"
                  placeholder={placeholderDosis}
                  value={medication.dosis}
                  onChangeText={(value) => handleMedicationChange(medication.id, 'dosis', value.replace(/[^0-9/ ]/g, ''))}
                  keyboardType="default"
                  style={styles.input}
                  editable={inputEditable}
                  contentStyle={[
                    styles.inputContent,
                    isFirstLine && { fontWeight: 'bold' },
                    !isFirstLine && { fontWeight: 'normal' },
                  ]}
                />
                {inputEditable && medications.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeMedicationLine(medication.id)}
                    style={styles.removeButton}
                  >
                    <Icon name="close" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      {inputEditable && (
        <View style={styles.addLineButtonContainer}>
          <TouchableOpacity
            onPress={addMedicationLine}
            style={styles.addLineButton}
          >
            <Icon name="add" size={20} color="#4a9cbb" />
            <Text style={styles.addLineText}>{MEDICATION_TEXTS.addLineItem}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  tableRow: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  drogaColumn: {
    flex: 1.5,
    marginRight: 8,
    position: 'relative',
  },
  horaColumn: {
    flex: 1,
    marginRight: 8,
    position: 'relative',
  },
  dosisColumn: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    width: '100%',
  },
  inputContent: {
    paddingVertical: 8,
  },
  inputContentDroga: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  removeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
  },
  addLineButtonContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addLineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  addLineText: {
    color: '#4a9cbb',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
});

