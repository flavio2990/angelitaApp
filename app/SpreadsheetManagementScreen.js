import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';

import TopBarHeader from '../components/TopBarHeader';
import CustomLogButton from '../components/CustomLogButton';

export default function SpreadsheetManagementScreen() {
  const router = useRouter();
  const { patientName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <TopBarHeader
        showTopBar={true}
        topBarTitle="Planilla"
        onBack={() => router.back()}
        centerTopbarTitle={true}
      />
      {/* Nombre del paciente */}
      <View style={styles.patientBox}>
        <Text style={styles.patientText}>_Paciente: {patientName}</Text>
      </View>
      {/* Botones */}
      <View style={styles.buttonsGrid}>
        <CustomLogButton
          icon={require('../assets/imageLogButtons/SV.png')}
          label="Signos Vitales"
          color="#e85158"
          onPress={() => {}}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/MED.png')}
          label="MedicaciÃ³n"
          color="#4a9cbb"
          onPress={() => {}}
        />
        <CustomLogButton
          icon={require('../assets/imageLogButtons/ALIM.png')}
          label="AlimentaciÃ³n"
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
    </View>
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
    marginTop: 16,
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
