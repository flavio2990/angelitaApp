import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
import { STATUS_MESSAGES, FORM_TEXTS, MEDICATION_TEXTS } from '../constants/Strings';
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
  const [hasVitalsData, setHasVitalsData] = useState(false);
  const [hasMedicationData, setHasMedicationData] = useState(false);
  const [medicationCount, setMedicationCount] = useState(1);
  const [vitalsView, setVitalsView] = useState('nuevo');
  const [previousVitalsData, setPreviousVitalsData] = useState(null);
  const [vitalsHistoryByDate, setVitalsHistoryByDate] = useState({});

  const modifyRef = useRef();
  const saveRef = useRef();

  const medicationModifyRef = useRef();
  const medicationSaveRef = useRef();

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
        setSaveSuccess(true);
        setTimeout(async () => {
          await loadPreviousVitals();
        }, 300);
      }
    }
  };

  const handleOpenMedication = () => {
    setShowMedicationModal(true);
    setHasMedicationData(false);
  };

  const handleSaveMedication = async () => {
    if (medicationSaveRef.current) {
      const success = await medicationSaveRef.current();
      if (success) {
        setSaveSuccess(true);
        setHasMedicationData(true);
      }
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
            <Text style={styles.patientText}>_Paciente: {patientName}</Text>
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
            patientName: patientName
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
          title={MEDICATION_TEXTS.formTitle}
          isEditModal={true}
          canEdit={true}
          isMedicationModal={true}
          offsetWithTopbar={true}
          topbarMarginTop={80}
          vitalsInfoExtraMargin={20}
          onSavePress={() => {
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
          vitalsData={{
            adminUid: user?.uid,
            area: area,
            personId: personId,
            patientName: patientName
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
          />
        </CustomModal>

        <CustomModal
          visible={showConfirmModal}
          onDismiss={() => {
            setShowConfirmModal(false);
            setSaveSuccess(false);
          }}
          title={saveSuccess ? STATUS_MESSAGES.success : `¿${FORM_TEXTS.saveButton} todo?`}
          centerCard={true}
          showHamburgerMenu={false}
        >
          <View style={{ alignItems: 'center', padding: 20 }}>
            {saveSuccess ? (
              <CustomButton
                label="OK"
                onPress={async () => {
                  setShowConfirmModal(false);
                  setSaveSuccess(false);
                  if (showSignosVitalesModal) {
                    setShowSignosVitalesModal(false);
                    setTimeout(async () => {
                      await loadPreviousVitals();
                    }, 500);
                  } else if (showMedicationModal) {
                    setShowMedicationModal(false);
                  }
                }}
              />
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <CustomButton
                  label="Sí"
                  onPress={async () => {
                    if (showSignosVitalesModal) {
                      await handleSaveVitals();
                    } else if (showMedicationModal) {
                      await handleSaveMedication();
                    }
                  }}
                  style={{ marginBottom: 16 }}
                />
                <CustomButton
                  label="No"
                  onPress={() => {
                    setShowConfirmModal(false);
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
