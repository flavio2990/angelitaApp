import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import { useRouter, useLocalSearchParams } from 'expo-router';

import TopBarHeader from '../components/TopBarHeader';
import CustomLogButton from '../components/CustomLogButton';
import CustomModal from '../components/CustomModal';
import EditPersonForm from '../components/EditPersonForm';
import HamburgerMenu from '../components/HamburgerMenu';
import { useAuth } from '../components/UserContext';

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

  // Refs para conectar con VitalSignsColumns
  const modifyRef = useRef();
  const saveRef = useRef();

  // Función para abrir modal de signos vitales
  const handleOpenSignosVitales = () => {
    setShowSignosVitalesModal(true);
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
            if (saveRef.current) {
              saveRef.current();
            }
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
          />
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
