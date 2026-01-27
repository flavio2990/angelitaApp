import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
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
import { ref, get } from 'firebase/database';
import { database } from '../env/firebase';

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
  };

  const loadPreviousMedication = async () => {
    if (!user?.uid || !area || !personId) return;

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
          
          // Group medications from the same day
          const latestDate = latestRecord?.createdAt ? latestRecord.createdAt.split('T')[0] : null;
          const sameDayRecords = latestDate 
            ? validRecords.filter(r => r.createdAt && r.createdAt.split('T')[0] === latestDate)
            : [];
          
          // Create a grouped record with all medications from the same day
          const groupedRecord = latestRecord ? {
            ...latestRecord,
            medicationsList: sameDayRecords.map(r => r.medications || {}).filter(m => m.droga)
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
    }
  };

  const handleMedicationViewChange = async (view) => {
    setMedicationView(view);
    if (view === 'anterior') {
      await loadPreviousMedication();
    }
  };

  const handleOpenMedication = () => {
    setShowMedicationModal(true);
    setHasMedicationData(false);
    setMedicationView('nuevo');
    setPreviousMedicationData(null);
  };

  const handleSaveMedication = async () => {
    if (medicationSaveRef.current) {
      const success = await medicationSaveRef.current();
      if (success) {
        setHasMedicationData(true);
        return true;
      }
    }
    return false;
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
            setSavingType('medication');
            setShowMedicationModal(false);
            setShowConfirmModal(true);
          }}
          onModifyPress={() => {
            if (medicationModifyRef.current) {
              medicationModifyRef.current();
            }
          }}
          onBack={() => setShowMedicationModal(false)}
          onGoHome={() => {
            router.push('/');
          }}
          showGoHomeOption={true}
          cardMarginTop={height * 0.07}
          hasVitalsData={hasMedicationData}
          vitalsView={medicationView}
          onVitalsViewChange={handleMedicationViewChange}
          previousVitalsData={previousMedicationData}
          vitalsData={{
            adminUid: user?.uid,
            area: area,
            personId: personId,
            patientName: patientName,
            personType: personType
          }}
          medicationCount={medicationCount}
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
            setShowConfirmModal(false);
            setSaveSuccess(false);
            setSavingType(null);
        }}
          title={saveSuccess ? STATUS_MESSAGES.success : FORM_TEXTS.confirmationModal}
          centerCard={true}
          showHamburgerMenu={false}
        >
          <View style={{ alignItems: 'center', padding: 20 }}>
            {saveSuccess ? (
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
                    }
                    if (success) {
                      setShowConfirmModal(false);
                      setSaveSuccess(false);
                      setTimeout(() => {
                        setSaveSuccess(true);
                        setShowConfirmModal(true);
                      }, 300);
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
