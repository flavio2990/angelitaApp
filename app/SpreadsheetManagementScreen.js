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
import InterventionModeToggle from '../components/InterventionModeToggle';
import { colors, typography, spacing, borderRadius, paperTheme } from '../constants/Theme';
import { INTERVENTION_MODE_TEXTS } from '../constants/Strings';

const { height } = Dimensions.get('window');

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...paperTheme.colors,
    primary: colors.primary,
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
  const [interventionMode, setInterventionMode] = useState('admin');

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

  const handleOpenSignosVitalesAdmin = async () => {
    setShowSignosVitalesModal(true);
    setVitalsView('anterior');
    await loadPreviousVitals();
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

  const normalizeMedicationEntries = (medicationsNode) => {
    if (!medicationsNode) return [];
    if (Array.isArray(medicationsNode)) {
      return medicationsNode.filter(med => med && med.droga);
    }
    if (medicationsNode.droga) {
      return [medicationsNode];
    }
    if (typeof medicationsNode === 'object') {
      return Object.entries(medicationsNode)
        .filter(([id, med]) => med && med.droga)
        .map(([id, med]) => ({ ...med, id }));
    }
    return [];
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
            
            const medicationsList = batchRecords.flatMap(record =>
              normalizeMedicationEntries(record.medications)
            );

            const groupedRecordForDate = {
              ...latestRecordForDate,
              createdAt: latestRecordForDate.createdAt || '',
              createdBy: latestRecordForDate.createdBy || '',
              medicationsList,
              personId: latestRecordForDate.personId || personId,
            };
            
            historyMap[dateKey] = groupedRecordForDate;
          });
          
          const groupedRecord = latestRecord ? {
            ...latestRecord,
            createdAt: latestRecord.createdAt || '',
            createdBy: latestRecord.createdBy || '',
            personId: latestRecord.personId || personId,
            medicationsList: latestBatchRecords.flatMap(record =>
              normalizeMedicationEntries(record.medications)
            )
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
        const normalizedList = previousMedicationData.medicationsList.flatMap(med =>
          normalizeMedicationEntries(med)
        );
        const filtered = normalizedList.filter(med => med && med.droga && med.droga.trim() !== '');
        if (filtered.length > 0) {
          setAdminMedicationSheetId(previousMedicationData.firebaseKey || null);
          return filtered;
        }
      }
      const previousEntries = normalizeMedicationEntries(previousMedicationData.medications);
      if (previousEntries.length > 0) {
        setAdminMedicationSheetId(previousMedicationData.firebaseKey || null);
        return previousEntries;
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
                .flatMap(record => normalizeMedicationEntries(record.medications))
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

  const parseMedicationTime = (hora, baseDate = new Date()) => {
    if (!hora || typeof hora !== 'string') return null;
    
    const match = hora.match(/(\d{1,2})[:\s]+(\d{2})/);
    if (!match) return null;
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    
    const medTime = new Date(baseDate);
    medTime.setHours(hours, minutes, 0, 0);
    
    return medTime;
  };

  const filterMedicationsNext4Hours = (medications) => {
    if (!medications || medications.length === 0) return [];
    
    const now = new Date();
    const fourHoursBefore = new Date(now.getTime() - (4 * 60 * 60 * 1000));
    const fourHoursAfter = new Date(now.getTime() + (4 * 60 * 60 * 1000));
    
    return medications.filter(med => {
      if (!med || !med.hora) return false;
      
      const today = new Date();
      const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
      const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
      
      // Calculate medication time for yesterday, today, and tomorrow
      const medTimeYesterday = parseMedicationTime(med.hora, yesterday);
      const medTimeToday = parseMedicationTime(med.hora, today);
      const medTimeTomorrow = parseMedicationTime(med.hora, tomorrow);
      
      if (!medTimeToday) return false;
      
      // Check if any of the three occurrences fall within the ±4h window
      const isWithinWindow = (medTime) => {
        return medTime && medTime >= fourHoursBefore && medTime <= fourHoursAfter;
      };
      
      return isWithinWindow(medTimeYesterday) || 
             isWithinWindow(medTimeToday) || 
             isWithinWindow(medTimeTomorrow);
    });
  };

  const getTodayAdministrations = async () => {
    if (!user?.uid || !area || !personId || !adminMedicationSheetId) {
      return {};
    }

    try {
      const dateKey = new Date().toISOString().split('T')[0];
      const administrationsRef = ref(
        database,
        `admins/${user.uid}/areas/${area}/subjects/${personId}/planillas/medicacion/${adminMedicationSheetId}/administrations/${dateKey}`
      );
      const snapshot = await get(administrationsRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return {};
    } catch (error) {
      console.error('Error loading today administrations:', error);
      return {};
    }
  };

  const handleAdminPress = async () => {
    const medications = await getCurrentMedications();
    const filteredByTime = filterMedicationsNext4Hours(medications || []);
    
    // Get today's administrations to exclude already administered medications
    const todayAdministrations = await getTodayAdministrations();
    
    // Filter out medications that were already administered today
    const filteredMedications = filteredByTime.filter(med => {
      const medId = med.id;
      return medId && !todayAdministrations[medId];
    });

    setAdminMedications(filteredMedications);
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
      const dateKey = new Date().toISOString().split('T')[0];

      for (const [itemId, checked] of pendingEntries) {
        if (checked === true) {
          const adminRef = ref(
            database,
            `admins/${uid}/areas/${area}/subjects/${personId}/planillas/medicacion/${adminMedicationSheetId}/administrations/${dateKey}/${itemId}`
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

      // Remove administered medications from the list (they shouldn't show today anymore)
      if (appliedIds.size > 0) {
        setAdminMedications(prev => {
          if (!prev) return prev;
          if (Array.isArray(prev)) {
            return prev.filter((med) => {
              const id = med.id || med.medicationId || med.firebaseKey || `med-${med.droga}-${med.dosis}`;
              return !appliedIds.has(id);
            });
          }
          if (typeof prev === 'object') {
            return Object.fromEntries(
              Object.entries(prev).filter(([id]) => !appliedIds.has(id))
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

  const handleOpenMedicationAdmin = async () => {
    setShowMedicationModal(true);
    setMedicationView('anterior');
    await loadPreviousMedication();
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

        {!showSignosVitalesModal && !showMedicationModal && interventionMode === 'assistant' && (
          <View style={styles.assistantBanner}>
            <Text style={styles.assistantBannerText}>{INTERVENTION_MODE_TEXTS.assistantBanner}</Text>
            <Text style={styles.assistantBannerSub}>{INTERVENTION_MODE_TEXTS.assistantBannerSub}</Text>
          </View>
        )}

        {!showSignosVitalesModal && !showMedicationModal && (
        <>
          <View style={styles.buttonsGrid}>
        <CustomLogButton
          icon={require('../assets/imageLogButtons/SV.png')}
          label="Signos Vitales"
          color="#e85158"
          onPress={interventionMode === 'admin' ? handleOpenSignosVitalesAdmin : handleOpenSignosVitales}
          scale={0.82}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/MED.png')}
          label="Medicación"
          color="#4a9cbb"
          onPress={interventionMode === 'assistant' ? handleAdminPress : handleOpenMedicationAdmin}
          scale={0.82}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/ALIM.png')}
          label="Alimentación"
          color="#f1a137"
          onPress={() => { }}
          scale={0.82}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/DEPO.png')}
          label="Deposiciones"
          color="#549f82"
          onPress={() => { }}
          scale={0.82}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/OBS.png')}
          label="Observaciones"
          color="#7d76b3"
          onPress={() => { }}
          scale={0.82}
        />
          </View>

          <InterventionModeToggle
            mode={interventionMode}
            onModeChange={setInterventionMode}
          />
        </>
      )}

      <CustomModal
        visible={showSignosVitalesModal}
          onRequestClose={() => setShowSignosVitalesModal(false)}
          showTopbar={true}
        topbarTitle="Signos Vitales"
        centerCard={vitalsView === 'anterior'}
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
          onAdminPress={interventionMode !== 'admin' ? handleAdminPress : null}
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
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: spacing.lg, fontSize: typography.fontSizes.md, color: colors.textLight }}>
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
                  buttonColor={colors.errorLight}
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
    flexDirection: 'column',
  },
  patientBox: {
    backgroundColor: colors.primaryAccent,
    marginHorizontal: spacing.lg,
    marginTop: 44,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    padding: 8,
    alignItems: 'center',
  },
  patientText: {
    fontSize: typography.fontSizes.xxxl,
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
    flex: 1,
    alignContent: 'flex-start',
  },
  assistantBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#E3F2FD',
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: 'center',
  },
  assistantBannerText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assistantBannerSub: {
    fontSize: typography.fontSizes.sm - 1,
    color: colors.secondary,
    marginTop: 2,
    opacity: 0.8,
  },
});
