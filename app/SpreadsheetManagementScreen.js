import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import { useRouter, useLocalSearchParams } from 'expo-router';

import TopBarHeader from '../components/TopBarHeader';
import CustomLogButton from '../components/CustomLogButton';
import CustomModal from '../components/CustomModal';
import CustomButton from '../components/CustomButton';
import EditPersonForm from '../components/EditPersonForm';
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
  const [vitalsHistoryByDate, setVitalsHistoryByDate] = useState({});
  
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
        const allVitals = snapshot.val();
        
        // Con push(), siempre será un objeto con múltiples keys (cada key es un ID único de Firebase)
        // Convertir a array de registros
        const records = Object.keys(allVitals).map(key => {
          const record = allVitals[key];
          return {
            ...record,
            personId: record.personId || personId, // Asegurar personId
            firebaseKey: key // Guardar la key de Firebase
          };
        });
        
        // Filtrar solo registros válidos que tengan createdAt
        const validRecords = records.filter(r => {
          const hasCreatedAt = r.createdAt && r.createdAt.trim() !== '';
          const hasPersonId = r.personId === personId;
          return hasCreatedAt && hasPersonId;
        });
        
        if (validRecords.length > 0) {
          // Construir mapa vitalsHistoryByDate: clave YYYY-MM-DD -> registro más reciente de ese día
          const historyMap = {};
          validRecords.forEach(record => {
            const dateKey = record.createdAt.split('T')[0]; // YYYY-MM-DD
            // Si ya existe un registro para esta fecha, mantener el más reciente
            if (!historyMap[dateKey] || new Date(record.createdAt) > new Date(historyMap[dateKey].createdAt)) {
              historyMap[dateKey] = record;
            }
          });
          
          // Encontrar el registro más reciente para previousVitalsData
          const sortedRecords = [...validRecords].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime(); // Más reciente primero
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

  // Función para cambiar la vista
  const handleViewChange = async (view) => {
    setVitalsView(view);
    if (view === 'anterior') {
      // Siempre recargar datos al cambiar a vista "Anterior" para asegurar datos actualizados
      await loadPreviousVitals();
    }
  };

  // Función para guardar signos vitales
  const handleSaveVitals = async () => {
    if (saveRef.current) {
      const success = await saveRef.current();
      if (success) {
        setSaveSuccess(true);
        // Siempre recargar los datos después de guardar para actualizar el histórico
        // Pequeño delay para asegurar que Firebase haya guardado
        setTimeout(async () => {
          await loadPreviousVitals();
        }, 300);
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
          showMenu={true}
          menuPosition="top-right"
          onGoHome={() => {
            router.push('/');
          }}
          showGoHomeOption={true}
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
                onPress={async () => {
                  setShowConfirmModal(false);
                  setSaveSuccess(false);
                  setShowSignosVitalesModal(false);
                  // Recargar datos después de cerrar el modal para asegurar que estén actualizados
                  setTimeout(async () => {
                    await loadPreviousVitals();
                  }, 500);
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
