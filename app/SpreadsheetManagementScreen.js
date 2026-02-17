import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import { useRouter, useLocalSearchParams } from 'expo-router';

import TopBarHeader from '../components/TopBarHeader';
import CustomLogButton from '../components/CustomLogButton';
import CustomModal from '../components/CustomModal';
import CustomButton from '../components/CustomButton';
import EditPersonForm from '../components/EditPersonForm';
import HamburgerMenu from '../components/HamburgerMenu';
import MedicationColumns from '../components/MedicationColumns';
import { useAuth } from '../components/UserContext';
import { STATUS_MESSAGES, FORM_TEXTS, MEDICATION_TEXTS, PERSON_TYPE_TEXTS } from '../constants/Strings';
import { ref, get, set } from 'firebase/database';
import { database } from '../env/firebase';
import { filterMedicationByRole, filterHistoryByRole } from '../utils/medicationFilters';
import AuthorRoleSelector from '../components/AuthorRoleSelector';

const { height } = Dimensions.get('window');

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5124A5',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    placeholder: '#A9A9A9',
  },
};

export default function SpreadsheetManagementScreen() {
  const router = useRouter();
  const { patientName, area, personId } = useLocalSearchParams();
  const { user, globalUserRole } = useAuth();
  const [showSignosVitalesModal, setShowSignosVitalesModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingType, setSavingType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasVitalsData, setHasVitalsData] = useState(false);
  const [hasMedicationData, setHasMedicationData] = useState(false);
  const [medicationCount, setMedicationCount] = useState(1);
  const [vitalsView, setVitalsView] = useState('nuevo');
  const [previousVitalsData, setPreviousVitalsData] = useState(null);
  const [vitalsHistoryByDate, setVitalsHistoryByDate] = useState({});
  const [medicationView, setMedicationView] = useState('nuevo');
  const [previousMedicationData, setPreviousMedicationData] = useState(null);
  const [medicationHistoryByDate, setMedicationHistoryByDate] = useState({});
  const [personType, setPersonType] = useState(null);
  const [selectedAuthorRole, setSelectedAuthorRole] = useState('employee'); // Default: Empleados
  const [isLoadingMedication, setIsLoadingMedication] = useState(false);
  const [showMedicationAdmin, setShowMedicationAdmin] = useState(false);
  const [adminMedications, setAdminMedications] = useState([]);
  const [adminMedicationSheetId, setAdminMedicationSheetId] = useState(null);
  const [adminMedicationUpdates, setAdminMedicationUpdates] = useState({});
  
  const modifyRef = useRef();
  const saveRef = useRef();

  const medicationModifyRef = useRef();
  const medicationSaveRef = useRef();

  useEffect(() => {
    const loadPersonType = async () => {
      if (!user?.uid || !area || !personId) return;

      try {
        const subjectRef = ref(database, `admins/${user.uid}/areas/${area}/subjects/${personId}`);
        const snapshot = await get(subjectRef);
        
        if (snapshot.exists()) {
          const subject = snapshot.val();
          setPersonType(subject?.tipo || null);
        }
      } catch (error) {
        console.error('Error loading person type:', error);
      }
    };

    loadPersonType();
  }, [user?.uid, area, personId]);

  const getPersonLabelPrefix = () => {
    if (!personType) return `_${PERSON_TYPE_TEXTS.patient}:`;
    
    const tipoLower = personType.toLowerCase();
    if (tipoLower === PERSON_TYPE_TEXTS.patient.toLowerCase()) {
      return `_${PERSON_TYPE_TEXTS.patient}:`;
    } else if (tipoLower === PERSON_TYPE_TEXTS.nursing.toLowerCase()) {
      return `_${PERSON_TYPE_TEXTS.nursing}:`;
    } else if (tipoLower === PERSON_TYPE_TEXTS.administrator.toLowerCase()) {
      return `_${PERSON_TYPE_TEXTS.administrator}:`;
    }
    return `_${personType}:`;
  };

  const handleOpenSignosVitales = () => {
    setShowSignosVitalesModal(true);
    setHasVitalsData(false);
    setVitalsView('nuevo');
    setPreviousVitalsData(null);
  };

  const loadPreviousVitals = async () => {
    if (!user?.uid || !area || !personId) return;

    try {
      const signosRef = ref(
        database,
        `admins/${user.uid}/areas/${area}/subjects/${personId}/planillas/signosVitales`
      );
      const snapshot = await get(signosRef);

      if (snapshot.exists()) {
        const allVitals = snapshot.val();
        
        const records = Object.keys(allVitals).map(key => {
          const record = allVitals[key];
          return {
            ...record,
            personId: record.personId || personId, 
            firebaseKey: key
          };
        });
        
        const validRecords = records.filter(r => {
          const hasCreatedAt = r.createdAt && r.createdAt.trim() !== '';
          const hasPersonId = r.personId === personId;
          return hasCreatedAt && hasPersonId;
        });
        
        if (validRecords.length > 0) {
          const historyMap = {};
          validRecords.forEach(record => {
            const dateKey = record.createdAt.split('T')[0];
            if (!historyMap[dateKey] || new Date(record.createdAt) > new Date(historyMap[dateKey].createdAt)) {
              historyMap[dateKey] = record;
            }
          });
          
          const sortedRecords = [...validRecords].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime(); 
          });
          
          const latestRecord = sortedRecords[0];
          
          setVitalsHistoryByDate(historyMap);
          setPreviousVitalsData(latestRecord);
          setHasVitalsData(true);
        } else {
          setVitalsHistoryByDate({});
          setPreviousVitalsData(null);
          setHasVitalsData(false);
        }
      } else {
        setVitalsHistoryByDate({});
        setPreviousVitalsData(null);
        setHasVitalsData(false);
      }
    } catch (error) {
      console.error('Error loading previous vitals:', error);
      setVitalsHistoryByDate({});
      setPreviousVitalsData(null);
      setHasVitalsData(false);
    }
  };

  const handleViewChange = async (view) => {
    setVitalsView(view);
    if (view === 'anterior') {
      await loadPreviousVitals();
    }
  };

  const handleSaveVitals = async () => {
    setIsSaving(true);
    try {
      if (saveRef.current) {
        const success = await saveRef.current();
        if (success) {
          setTimeout(async () => {
            await loadPreviousVitals();
          }, 300);
          return true;
        }
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadPreviousMedication = async () => {
    if (!user?.uid || !area || !personId) {
      setIsLoadingMedication(false);
      return;
    }

    setIsLoadingMedication(true);
    try {
      const medicationRef = ref(
        database,
        `admins/${user.uid}/areas/${area}/subjects/${personId}/planillas/medicacion`
      );
      const snapshot = await get(medicationRef);

      if (snapshot.exists()) {
        const allMedications = snapshot.val();

        const records = Object.keys(allMedications).map(key => {
          const record = allMedications[key];
          return {
            ...record,
            personId: personId,
            firebaseKey: key
          };
        });

        const validRecords = records.filter(r => {
          const hasCreatedAt = r.createdAt && r.createdAt.trim() !== '';
          const hasMedications = r.medications && Object.keys(r.medications).length > 0;
          return hasCreatedAt && hasMedications;
        });

        const filteredRecords = await filterMedicationByRole(validRecords, selectedAuthorRole);

        if (filteredRecords.length > 0) {
          const sortedRecords = [...filteredRecords].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });

          const latestRecord = sortedRecords[0];
          const latestCreatedAt = latestRecord?.createdAt || '';
          const latestCreatedAtTime = new Date(latestCreatedAt).getTime();
          
            const BATCH_TIME_WINDOW_MS = 10000;
          const latestBatchRecords = filteredRecords.filter(record => {
            const createdAt = record.createdAt || '';
            const createdAtTime = new Date(createdAt).getTime();
            const timeDiff = latestCreatedAtTime - createdAtTime;
            return timeDiff >= 0 && timeDiff <= BATCH_TIME_WINDOW_MS;
          });
          
          const historyMap = {};
          const recordsByDate = {};
          
          filteredRecords.forEach(record => {
            const dateKey = record.createdAt.split('T')[0];
            if (!recordsByDate[dateKey]) {
              recordsByDate[dateKey] = [];
            }
            recordsByDate[dateKey].push(record);
          });
          
          Object.keys(recordsByDate).forEach(dateKey => {
            const dateRecords = recordsByDate[dateKey];
            
            const sortedByTime = [...dateRecords].sort((a, b) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            
            const latestRecordForDate = sortedByTime[0];
            const latestCreatedAtTime = new Date(latestRecordForDate.createdAt).getTime();
            
            const BATCH_TIME_WINDOW_MS = 10000;
            const batchRecords = dateRecords.filter(record => {
              const createdAtTime = new Date(record.createdAt).getTime();
              const timeDiff = latestCreatedAtTime - createdAtTime;
              return timeDiff >= 0 && timeDiff <= BATCH_TIME_WINDOW_MS;
            });
            
            const groupedRecordForDate = {
              ...latestRecordForDate,
              medicationsList: batchRecords.map(r => r.medications || {}).filter(m => m.droga),
              personId: latestRecordForDate.personId || personId,
            };
            
            historyMap[dateKey] = groupedRecordForDate;
          });
          
          const groupedRecord = latestRecord ? {
            ...latestRecord,
            medicationsList: latestBatchRecords.map(r => r.medications || {}).filter(m => m.droga)
          } : null;

          setMedicationHistoryByDate(historyMap);
          setPreviousMedicationData(groupedRecord);
          setHasMedicationData(true);
        } else {
          setMedicationHistoryByDate({});
          setPreviousMedicationData(null);
          setHasMedicationData(false);
        }
      } else {
        setMedicationHistoryByDate({});
        setPreviousMedicationData(null);
        setHasMedicationData(false);
      }
    } catch (error) {
      console.error('Error loading previous medication:', error);
      setMedicationHistoryByDate({});
      setPreviousMedicationData(null);
      setHasMedicationData(false);
    } finally {
      setIsLoadingMedication(false);
    }
  };

  const handleMedicationViewChange = async (view) => {
    setMedicationView(view);
    if (view === 'anterior') {
      await loadPreviousMedication();
    }
  };

  const getMedicationConfig = async () => {
    if (!personId) {
      return null;
    }

    try {
      const configRef = ref(
        database,
        `subjects/${personId}/medications`
      );
      const snapshot = await get(configRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
    } catch (error) {
      const message = error?.message || '';
      if (!message.includes('Permission denied')) {
        console.error('Error loading medication config:', error);
      }
    }

    return null;
  };

  const getCurrentMedications = async () => {
    const configMedications = await getMedicationConfig();
    if (configMedications) {
      setAdminMedicationSheetId(null);
      return configMedications;
    }

    if (medicationView === 'anterior' && previousMedicationData) {
      if (previousMedicationData.medicationsList && Array.isArray(previousMedicationData.medicationsList)) {
        const filtered = previousMedicationData.medicationsList.filter(med => med && med.droga && med.droga.trim() !== '');
        if (filtered.length > 0) {
          setAdminMedicationSheetId(previousMedicationData.firebaseKey || null);
          return filtered;
        }
      }
      if (previousMedicationData.medications && previousMedicationData.medications.droga) {
        setAdminMedicationSheetId(previousMedicationData.firebaseKey || null);
        return [previousMedicationData.medications];
      }
    }
    
    if (user?.uid && area && personId) {
      try {
        const medicationRef = ref(
          database,
          `admins/${user.uid}/areas/${area}/subjects/${personId}/planillas/medicacion`
        );
        const snapshot = await get(medicationRef);
        
        if (snapshot.exists()) {
          const allMedications = snapshot.val();
          const records = Object.keys(allMedications).map(key => ({
            ...allMedications[key],
            firebaseKey: key
          }));
          
          const validRecords = records.filter(r => {
            const hasCreatedAt = r.createdAt && r.createdAt.trim() !== '';
            const hasMedications = r.medications && Object.keys(r.medications).length > 0;
            return hasCreatedAt && hasMedications;
          });
          
          if (validRecords.length > 0) {
            const filteredRecords = validRecords;
            if (filteredRecords.length > 0) {
              const sortedRecords = [...filteredRecords].sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
              });
              
              const latestRecord = sortedRecords[0];
              setAdminMedicationSheetId(latestRecord?.firebaseKey || null);
              const latestCreatedAtTime = new Date(latestRecord.createdAt).getTime();
              const BATCH_TIME_WINDOW_MS = 10000;
              
              const latestBatchRecords = filteredRecords.filter(record => {
                const createdAtTime = new Date(record.createdAt).getTime();
                const timeDiff = latestCreatedAtTime - createdAtTime;
                return timeDiff >= 0 && timeDiff <= BATCH_TIME_WINDOW_MS;
              });
              
              const medicationsList = latestBatchRecords
                .map(r => r.medications || {})
                .filter(m => m.droga && m.droga.trim() !== '');

              if (medicationsList.length > 0) {
                return medicationsList;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading medications for admin modal:', error);
      }
    }

    return [];
  };

  const handleAdminPress = async () => {
    const medications = await getCurrentMedications();

    setAdminMedications(medications || []);
    setShowMedicationAdmin(true);
    setAdminMedicationUpdates({});
    
    if (!showMedicationModal) {
      setShowMedicationModal(true);
    }
  };

  const handleAdminCheckChange = (itemId, checked) => {
    if (!itemId) {
      return;
    }
    setAdminMedicationUpdates(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSaveMedicationAdmin = async () => {
    setIsSaving(true);
    try {
      if (!user?.uid || !area || !personId || !adminMedicationSheetId) {
        return false;
      }

      const pendingEntries = Object.entries(adminMedicationUpdates || {});
      if (pendingEntries.length === 0) {
        return true;
      }

      const uid = user.uid;
      const administeredAt = new Date().toISOString();

      for (const [itemId, checked] of pendingEntries) {
        if (checked === true) {
          const adminRef = ref(
            database,
            `admins/${uid}/areas/${area}/subjects/${personId}/planillas/medicacion/${adminMedicationSheetId}/medications/administration/${itemId}`
          );
          await set(adminRef, {
            administered: true,
            administeredAt,
            administeredBy: uid,
          });
        }
      }

      const appliedIds = new Set(
        pendingEntries.filter(([, checked]) => checked === true).map(([itemId]) => itemId)
      );

      if (appliedIds.size > 0) {
        setAdminMedications(prev => {
          if (!prev) return prev;
          if (Array.isArray(prev)) {
            return prev.map((med, index) => {
              const id = med.id || med.medicationId || med.firebaseKey || `med-${index}-${med.droga}-${med.dosis}`;
              if (appliedIds.has(id)) {
                return { ...med, administrado: true };
              }
              return med;
            });
          }
          if (typeof prev === 'object') {
            return Object.fromEntries(
              Object.entries(prev).map(([id, med]) => [
                id,
                appliedIds.has(id) ? { ...med, administrado: true } : med,
              ])
            );
          }
          return prev;
        });
      }

      setAdminMedicationUpdates({});
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (medicationView === 'anterior' && showMedicationModal) {
      loadPreviousMedication();
    }
  }, [selectedAuthorRole]);

  const handleOpenMedication = () => {
    setShowMedicationModal(true);
    setHasMedicationData(false);
    setMedicationView('nuevo');
    setPreviousMedicationData(null);
  };

  const handleSaveMedication = async () => {
    setIsSaving(true);
    try {
      if (medicationSaveRef.current) {
        const success = await medicationSaveRef.current();
        if (success) {
          setHasMedicationData(true);
          return true;
        }
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        {!showSignosVitalesModal && !showMedicationModal && (
        <TopBarHeader
          showTopBar={true}
          topBarTitle="Planilla"
          onBack={() => router.back()}
          centerTopbarTitle={true}
        />
      )}
      
        {!showSignosVitalesModal && !showMedicationModal && (
        <HamburgerMenu 
          position="top-right" 
          hasTopBar={true}
          onGoHome={() => {
            router.push('/');
          }}
          showGoHomeOption={true}
          showInModal={false}
        />
      )}
      
        {!showSignosVitalesModal && !showMedicationModal && (
        <View style={styles.patientBox}>
            <Text style={styles.patientText}>{getPersonLabelPrefix()} {patientName}</Text>
        </View>
      )}
      
        {!showSignosVitalesModal && !showMedicationModal && (
        <>
          <View style={styles.buttonsGrid}>
        <CustomLogButton
          icon={require('../assets/imageLogButtons/SV.png')}
          label="Signos Vitales"
          color="#e85158"
          onPress={handleOpenSignosVitales}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/MED.png')}
          label="Medicación"
          color="#4a9cbb"
                onPress={handleOpenMedication}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/ALIM.png')}
          label="Alimentación"
          color="#f1a137"
                onPress={() => { }}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/DEPO.png')}
          label="Deposiciones"
          color="#549f82"
                onPress={() => { }}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/OBS.png')}
          label="Observaciones"
          color="#7d76b3"
                onPress={() => { }}
        />
          </View>
        </>
      )}

      <CustomModal
        visible={showSignosVitalesModal}
          onRequestClose={() => setShowSignosVitalesModal(false)}
          showTopbar={true}
        topbarTitle="Signos Vitales"
        centerCard={true}
          scrollable={true}
          title="Ingresar Aquí:"
          isEditModal={true}
          canEdit={true}
          offsetWithTopbar={true}
          topbarMarginTop={80}
          vitalsInfoExtraMargin={20}
          onSavePress={() => {
            setSavingType('vitals');
            setShowSignosVitalesModal(false);
            setShowConfirmModal(true);
          }}
          onModifyPress={() => {
            if (modifyRef.current) {
              modifyRef.current();
            }
          }}
        onBack={() => setShowSignosVitalesModal(false)}
          onGoHome={() => {
            router.push('/');
          }}
          showGoHomeOption={true}
          cardMarginTop={height * 0.07}
        isVitalsModal={true}
          hasVitalsData={hasVitalsData}
          vitalsView={vitalsView}
          onVitalsViewChange={handleViewChange}
          previousVitalsData={previousVitalsData}
          vitalsHistoryByDate={vitalsHistoryByDate}
        vitalsData={{
          adminUid: user?.uid,
          area: area,
          personId: personId,
            patientName: patientName,
            personType: personType
        }}
        >
          <EditPersonForm
            isVitalsMode={true}
            adminUid={user?.uid}
            area={area}
            personId={personId}
            visible={showSignosVitalesModal}
            onModify={modifyRef}
            onSave={saveRef}
            onVitalsDataExistsChange={setHasVitalsData}
          />
        </CustomModal>

        <CustomModal
          visible={showMedicationModal}
          onDismiss={() => setShowMedicationModal(false)}
          showTopbar={true}
          topbarTitle="Medicación"
          centerCard={true}
          scrollable={true}
          title={medicationView === 'anterior' ? MEDICATION_TEXTS.headerTitle : MEDICATION_TEXTS.formTitle}
          isEditModal={true}
          canEdit={true}
          isMedicationModal={true}
          offsetWithTopbar={true}
          topbarMarginTop={80}
          vitalsInfoExtraMargin={20}
          onSavePress={() => {
            setSavingType(showMedicationAdmin ? 'medicationAdmin' : 'medication');
            setShowMedicationModal(false);
            setShowConfirmModal(true);
          }}
          onModifyPress={() => {
            if (medicationModifyRef.current) {
              medicationModifyRef.current();
            }
          }}
          onBack={() => {
            if (showMedicationAdmin) {
              setShowMedicationAdmin(false);
              setAdminMedications([]);
              setAdminMedicationUpdates({});
              return;
            }
            if (medicationView === 'anterior') {
              setMedicationView('nuevo');
              return;
            }
            setShowMedicationModal(false);
            setShowMedicationAdmin(false);
            setAdminMedications([]);
            setAdminMedicationUpdates({});
          }}
          onGoHome={() => {
            router.push('/');
          }}
          showGoHomeOption={true}
          cardMarginTop={height * 0.07}
          hasVitalsData={hasMedicationData}
          vitalsView={medicationView}
          onVitalsViewChange={handleMedicationViewChange}
          previousVitalsData={previousMedicationData}
          vitalsHistoryByDate={medicationHistoryByDate}
          vitalsData={{
            adminUid: user?.uid,
            area: area,
            personId: personId,
            patientName: patientName,
            personType: personType
          }}
          medicationCount={medicationCount}
          medicationHistoryByDate={medicationHistoryByDate}
          selectedAuthorRole={selectedAuthorRole}
          onAuthorRoleChange={setSelectedAuthorRole}
          isLoadingMedication={isLoadingMedication}
          onAdminPress={handleAdminPress}
          showMedicationAdmin={showMedicationAdmin}
          adminMedications={adminMedications}
          medicationSheetId={adminMedicationSheetId}
          onAdminCheckChange={handleAdminCheckChange}
        >
          <MedicationColumns
            adminUid={user?.uid}
            area={area}
            personId={personId}
            patientName={patientName}
            visible={showMedicationModal}
            onModify={medicationModifyRef}
            onSave={medicationSaveRef}
            onDataExistsChange={setHasMedicationData}
            onMedicationCountChange={setMedicationCount}
            vitalsView={medicationView}
          />
        </CustomModal>

        <CustomModal
          visible={showConfirmModal}
          onDismiss={() => {
            if (!isSaving) {
              setShowConfirmModal(false);
              setSaveSuccess(false);
              setSavingType(null);
              setIsSaving(false);
            }
        }}
          title={saveSuccess ? STATUS_MESSAGES.success : FORM_TEXTS.confirmationModal}
          centerCard={true}
          showHamburgerMenu={false}
        >
          <View style={{ alignItems: 'center', padding: 20 }}>
            {isSaving ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
                <ActivityIndicator size="large" color="#5124A5" />
                <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
                  Guardando...
                </Text>
              </View>
            ) : saveSuccess ? (
              <CustomButton
                label="OK"
                onPress={() => {
                  setShowConfirmModal(false);
                  setSaveSuccess(false);
                  const currentSavingType = savingType;
                  setSavingType(null);
                  if (currentSavingType === 'vitals') {
                  setTimeout(async () => {
                    await loadPreviousVitals();
                  }, 500);
                  }
                  if (currentSavingType === 'medicationAdmin') {
                    setShowMedicationModal(true);
                    setShowMedicationAdmin(true);
                  }
                }}
              />
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <CustomButton
                  label="Sí"
                  onPress={async () => {
                    let success = false;
                    if (savingType === 'vitals') {
                      success = await handleSaveVitals();
                    } else if (savingType === 'medication') {
                      success = await handleSaveMedication();
                    } else if (savingType === 'medicationAdmin') {
                      success = await handleSaveMedicationAdmin();
                    }
                    if (success) {
                      setSaveSuccess(true);
                    } else {
                      if (savingType === 'medication') {
                        Alert.alert(
                          'Error',
                          'No se puede guardar medicación. Solo se puede guardar medicación para sujetos de tipo Paciente.',
                          [{ text: 'OK' }]
                        );
                      }
                    }
                  }}
                  style={{ marginBottom: 16 }}
                />
                <CustomButton
                  label="No"
                  onPress={() => {
                    setShowConfirmModal(false);
                    setSavingType(null);
                  }}
                  buttonColor="#FF6B6B"
                />
              </View>
            )}
          </View>
        </CustomModal>

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  patientBox: {
    backgroundColor: '#EDE7F6',
    marginHorizontal: 16,
    marginTop: 60,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  patientText: {
    fontSize: 24,
    color: '#5124A5',
    fontWeight: 'bold',
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
  },
});
