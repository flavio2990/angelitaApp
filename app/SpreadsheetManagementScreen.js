import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import { useRouter, useLocalSearchParams } from 'expo-router';

import TopBarHeader from '../components/TopBarHeader';
import CustomLogButton from '../components/CustomLogButton';
import CustomModal from '../components/CustomModal';
import HamburgerMenu from '../components/HamburgerMenu';
import { useAuth } from '../components/UserContext';

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
          onPress={() => {}}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/ALIM.png')}
          label="Alimentación"
          color="#f1a137"
          onPress={() => {}}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/DEPO.png')}
          label="Deposiciones"
          color="#549f82"
          onPress={() => {}}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/OBS.png')}
          label="Observaciones"
          color="#7d76b3"
          onPress={() => {}}
        />
          </View>
        </>
      )}

      {/* Modal de Signos Vitales */}
      <CustomModal
        visible={showSignosVitalesModal}
        onDismiss={() => setShowSignosVitalesModal(false)}
        topbarTitle="Signos Vitales"
        centerCard={true}
        showTopbar={true}
        onBack={() => setShowSignosVitalesModal(false)}
        showHamburgerMenu={true}
        topbarMarginTop={80}
        offsetWithTopbar={true}
        vitalsInfoExtraMargin={8}
        scrollable={true}
        isVitalsModal={true}
        vitalsData={{
          adminUid: user?.uid,
          area: area,
          personId: personId,
          patientName: patientName
        }}
        onVitalsModify={modifyRef}
        onVitalsSave={saveRef}
        onGoHome={() => {
          router.push('/');
        }}
        actions={[
          {
            label: "Modificar",
            onPress: () => {
              if (modifyRef.current) {
                modifyRef.current();
              }
            },
            mode: "outlined",
            style: { borderColor: '#5124A5', borderWidth: 2 },
            textColor: '#5124A5'
          },
          {
            label: "Guardar",
            onPress: () => {
              if (saveRef.current) {
                saveRef.current();
              }
            },
            mode: "contained",
            buttonColor: '#5124A5',
            textColor: 'white'
          }
        ]}
      />
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
