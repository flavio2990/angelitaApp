import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ref, set, update, get } from 'firebase/database';
import { database } from '../env/firebase';
import { MEDICATION_TEXTS } from '../constants/Strings';
import Icon from 'react-native-vector-icons/MaterialIcons';

const INITIAL_MEDICATION = {
  id: Date.now(),
  droga: '',
  dosis: '1',
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
}) {
  const [medications, setMedications] = useState([
    { ...INITIAL_MEDICATION, id: Date.now() },
    { ...INITIAL_MEDICATION, id: Date.now() + 1 },
    { ...INITIAL_MEDICATION, id: Date.now() + 2 },
    { ...INITIAL_MEDICATION, id: Date.now() + 3 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataExists, setDataExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleMedicationChange = useCallback((id, field, value) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  }, []);

  const addMedicationLine = useCallback(() => {
    setMedications((prev) => [
      ...prev,
      { ...INITIAL_MEDICATION, id: Date.now() + Math.random() },
    ]);
  }, []);

  const removeMedicationLine = useCallback((id) => {
    setMedications((prev) => {
      const filtered = prev.filter((med) => med.id !== id);
      return filtered.length > 0 ? filtered : [
        { ...INITIAL_MEDICATION, id: Date.now() },
        { ...INITIAL_MEDICATION, id: Date.now() + 1 },
        { ...INITIAL_MEDICATION, id: Date.now() + 2 },
        { ...INITIAL_MEDICATION, id: Date.now() + 3 },
      ];
    });
  }, []);

  const resetForm = useCallback(() => {
    setMedications([
      { ...INITIAL_MEDICATION, id: Date.now() },
      { ...INITIAL_MEDICATION, id: Date.now() + 1 },
      { ...INITIAL_MEDICATION, id: Date.now() + 2 },
      { ...INITIAL_MEDICATION, id: Date.now() + 3 },
    ]);
    setDataExists(false);
    setIsEditing(true);
  }, []);

  const loadMedication = useCallback(async () => {
    if (!adminUid || !area || !personId) return;
    
    setIsLoading(true);
    try {
      const medicationRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/medicacion`
      );
      const snapshot = await get(medicationRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const medicationsList = data.medications || [];
        if (medicationsList.length > 0) {
          setMedications(medicationsList.map((med, index) => ({
            id: med.id || Date.now() + index,
            droga: med.droga || '',
            dosis: med.dosis || '1',
          })));
        } else {
          setMedications([
            { ...INITIAL_MEDICATION, id: Date.now() },
            { ...INITIAL_MEDICATION, id: Date.now() + 1 },
            { ...INITIAL_MEDICATION, id: Date.now() + 2 },
            { ...INITIAL_MEDICATION, id: Date.now() + 3 },
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
    } catch (error) {
      console.error('Error loading medication:', error);
      if (onDataExistsChange) {
        onDataExistsChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminUid, area, personId, resetForm, onDataExistsChange]);

  const saveMedication = useCallback(async () => {
    if (!adminUid || !area || !personId) return;
    
    setIsSaving(true);
    try {
      const medicationRef = ref(
        database,
        `admins/${adminUid}/areas/${area}/subjects/${personId}/planillas/medicacion`
      );
      
      // Filtrar medicamentos vacíos antes de guardar
      const validMedications = medications.filter(
        (med) => med.droga && med.droga.trim() !== ''
      );
      
      const dataToSave = {
        medications: validMedications.length > 0 
          ? validMedications 
          : [{ ...INITIAL_MEDICATION, id: Date.now() }],
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
      };

      if (!dataExists) {
        await set(medicationRef, {
          ...dataToSave,
          createdAt: new Date().toISOString(),
          createdBy: adminUid,
        });
        setDataExists(true);
        if (onDataExistsChange) {
          onDataExistsChange(true);
        }
      } else {
        await update(medicationRef, dataToSave);
      }

      setIsEditing(false);
      Keyboard.dismiss();
      return true;
    } catch (error) {
      console.error('Error saving medication:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [adminUid, area, personId, medications, dataExists, onDataExistsChange]);

  useEffect(() => {
    if (adminUid && area && personId) {
      loadMedication();
    } else {
      resetForm();
    }
  }, [adminUid, area, personId, loadMedication, resetForm]);

  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
    } else if (!dataExists) {
      setIsEditing(true);
    }
  }, [visible, dataExists]);

  // Notificar al padre sobre el número de medicamentos
  useEffect(() => {
    if (onMedicationCountChange) {
      onMedicationCountChange(medications.length);
    }
  }, [medications.length, onMedicationCountChange]);

  useEffect(() => {
    if (onModify) {
      onModify.current = () => setIsEditing(true);
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
      {/* Scroll solo para las filas */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        style={styles.scrollView}
      >
        {/* Filas de medicamentos */}
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
                    styles.inputContent,
                    isFirstLine && { fontWeight: 'bold' },
                    !isFirstLine && { fontWeight: 'normal' },
                  ]}
                />
                {inputEditable && (
                  <Icon name="keyboard-arrow-up" size={16} color="#666" style={styles.arrowIcon} />
                )}
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
      
      {/* Botón para agregar línea - fijo fuera del scroll */}
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
    flex: 2,
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

