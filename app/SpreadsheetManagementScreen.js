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
import { useAuth } from '../components/UserContext';
import { STATUS_MESSAGES, FORM_TEXTS } from '../constants/Strings';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasVitalsData, setHasVitalsData] = useState(false);
  const [vitalsView, setVitalsView] = useState('nuevo'); // 'nuevo' o 'anterior'
  const [previousVitalsData, setPreviousVitalsData] = useState(null);

  // Refs para conectar con VitalSignsColumns
  const modifyRef = useRef();
  const saveRef = useRef();

  // Función para abrir modal de signos vitales
  const handleOpenSignosVitales = () => {
    setShowSignosVitalesModal(true);
    // Resetear el estado cuando se abre el modal para asegurar que el botón Modificar no aparezca
    setHasVitalsData(false);
    setVitalsView('nuevo');
    setPreviousVitalsData(null);
  };

  // Función para cargar datos anteriores de signos vitales
  const loadPreviousVitals = async () => {
    if (!user?.uid || !area || !personId) return;

    try {
      const signosRef = ref(
        database,
        `admins/${user.uid}/areas/${area}/subjects/${personId}/planillas/signosVitales`
      );
      const snapshot = await get(signosRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setPreviousVitalsData(data);
      } else {
        setPreviousVitalsData(null);
      }
    } catch (error) {
      console.error('Error loading previous vitals:', error);
      setPreviousVitalsData(null);
    }
  };

  // Función para cambiar la vista
  const handleViewChange = async (view) => {
    setVitalsView(view);
    if (view === 'anterior') {
      await loadPreviousVitals();
    }
  };

  // Función para guardar signos vitales
  const handleSaveVitals = async () => {
    if (saveRef.current) {
      const success = await saveRef.current();
      if (success) {
        setSaveSuccess(true);
      }
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        {!showSignosVitalesModal && (
          <TopBarHeader
            showTopBar={true}
            topBarTitle="Planilla"
            onBack={() => router.back()}
            centerTopbarTitle={true}
          />
        )}

        {/* HamburgerMenu para la pantalla principal */}
        {!showSignosVitalesModal && (
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

        {/* Nombre del paciente - solo cuando el modal está cerrado */}
        {!showSignosVitalesModal && (
          <View style={styles.patientBox}>
            <Text style={styles.patientText}>_Paciente: {patientName}</Text>
          </View>
        )}

        {!showSignosVitalesModal && (
          <>
            {/* Botones */}
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
                onPress={() => { }}
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

        {/* Modal de Signos Vitales */}
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

        {/* MODAL DE CONFIRMACIÓN */}
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
                onPress={() => {
                  setShowConfirmModal(false);
                  setSaveSuccess(false);
                  setShowSignosVitalesModal(false);
                }}
              />
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <CustomButton
                  label="Sí"
                  onPress={async () => {
                    await handleSaveVitals();
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
