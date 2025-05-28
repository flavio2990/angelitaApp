import React from 'react';

import { StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';


import CustomModal from '@/components/CustomModal';
import CustomList from '@/components/CustomList';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/CustomButton';
import EditPersonForm from '@/components/EditPersonForm';

import { Provider as PaperProvider, DefaultTheme, Card, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TITLES, AREA_OPTIONS, TIPE_OPTIONS, MODAL_TITLES, TOP_BAR } from './../../constants/Strings';

const { height } = Dimensions.get('window');

export default function LogScreen() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [modalAreaVisible, setModalAreaVisible] = React.useState(false);
  const [modalUserTypeVisible, setModalUserTypeVisible] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState(null);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [showEmployeeList, setShowEmployeeList] = React.useState(false);
  const [userType, setUserType] = React.useState(null);
  const [selectedPerson, setSelectedPerson] = React.useState(null);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editablePerson, setEditablePerson] = React.useState(null);
  const [noDataModalVisible, setNoDataModalVisible] = React.useState(false);
  const [newPerson, setNewPerson] = React.useState({});
  const [addMode, setAddMode] = React.useState(false);


  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#007AFF',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#000000',
      placeholder: '#A9A9A9',
    },
  };

  const handleItemPress = (person) => {
    setSelectedPerson(person);
    setDetailModalVisible(true);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setModalAreaVisible(false);
    setModalUserTypeVisible(true);
  };

  const handleUserTypeSelect = async (type) => {
    setSelectedOption(type);
    setUserType(type);
    setModalUserTypeVisible(false);

    let stored = await AsyncStorage.getItem('peopleData');
    let peopleList = stored ? JSON.parse(stored) : [];

    const filteredData = peopleList.filter(
      (p) =>
        p.tipo?.toLowerCase() === type.toLowerCase() &&
        p.area?.toLowerCase() === selectedArea?.toLowerCase()
    );

    if (filteredData.length === 0) {
      setTimeout(() => {
        setNoDataModalVisible(true);
      }, 300);
    } else {
      setShowEmployeeList(true);
    }
  };

  const handleBackPress = () => {
    if (showEmployeeList) {
      setShowEmployeeList(false);
      setModalUserTypeVisible(true);
    } else if (modalUserTypeVisible) {
      setModalUserTypeVisible(false);
      setModalAreaVisible(true);
    } else if (modalAreaVisible) {
      setModalAreaVisible(false);
    }
  };

  const handleModifyPress = () => {
    setDetailModalVisible(false);
    setEditablePerson({ ...selectedPerson });
    setEditModalVisible(true);
  };

  const handleSaveNewPerson = async () => {
    try {
      const stored = await AsyncStorage.getItem('peopleData');
      let peopleList = stored ? JSON.parse(stored) : [];

      const updatedList = [...peopleList, newPerson];
      await AsyncStorage.setItem('peopleData', JSON.stringify(updatedList));
      console.log("Guardado en AsyncStorage:", newPerson);
      setNoDataModalVisible(false);
      setNewPerson({});
      setShowEmployeeList(true);
    } catch (error) {
      console.error("Error guardando persona:", error);
    }
  };

  const handleSaveEditPerson = async () => {
    try {
      const stored = await AsyncStorage.getItem('peopleData');
      let peopleList = stored ? JSON.parse(stored) : [];

      const index = peopleList.findIndex(p => p.dni === editablePerson.dni);

      if (index !== -1) {
        peopleList[index] = editablePerson;
        await AsyncStorage.setItem('peopleData', JSON.stringify(peopleList));
        setEditModalVisible(false);
        setDetailModalVisible(false);
        setSelectedPerson(null);
        setShowEmployeeList(false);
        setTimeout(() => setShowEmployeeList(true), 0);
      }
    } catch (error) {
      console.error("Error actualizando persona:", error);
    }
  };

  function getTopBarTitle(type, TOP_BAR) {
    if (!type) return TOP_BAR.topBarTitleEmploy;
    const t = type.toLowerCase();
    if (t.includes('paciente')) return TOP_BAR.topBarTitlePatient;
    if (t.includes('enfermero')) return TOP_BAR.topBarTitleEmploy;
    return TOP_BAR.topBarTitleEmploy;
  }

  function getModalTitle(type, MODAL_TITLES) {
    if (!type) return MODAL_TITLES.modalTitleEmploy;
    const t = type.toLowerCase();
    if (t.includes('paciente')) return MODAL_TITLES.modalTitlePatient;
    if (t.includes('enfermero')) return MODAL_TITLES.modalTitleEmploy;
    return MODAL_TITLES.modalTitleEmploy;
  }

  const [asyncPeopleData, setAsyncPeopleData] = React.useState([]);
  React.useEffect(() => {
    const loadPeople = async () => {
      const stored = await AsyncStorage.getItem('peopleData');
      setAsyncPeopleData(stored ? JSON.parse(stored) : []);
    };
    if (showEmployeeList) loadPeople();
  }, [showEmployeeList, noDataModalVisible]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {showEmployeeList ? (
          <CustomList
            data={asyncPeopleData.filter(
              (p) =>
                p.tipo?.toLowerCase() === userType?.toLowerCase() &&
                p.area?.toLowerCase() === selectedArea?.toLowerCase()
            )}
            onPress={handleBackPress}
            onItemPress={handleItemPress}
            topBarTitleEmploy={getTopBarTitle(userType, TOP_BAR)}
            onAddPress={() => {
              setNewPerson({});
              setNoDataModalVisible(true);
              setAddMode(true);
            }}
          />
        ) : (
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/images/grandma.png')}
                style={styles.homeLogo}
              />
              <ThemedText type="title" style={styles.titleText}>
                Hogar Angelita!
              </ThemedText>
            </View>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleLarge" style={styles.bigWelcomeText}>Bienvenido</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  label="Usuario"
                  style={styles.textInput}
                  theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                />
                <View style={{ margin: 8 }} />
                <TextInput
                  label="Contraseña"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.textInput}
                  theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                />
                <View style={{ margin: 8 }} />
                <CustomButton
                  onPress={() => setModalAreaVisible(true)}
                  label="INGRESAR"
                />

                {/* modal eleccion de area */}
                <CustomModal
                  cardMarginTop={height * 0.3}
                  visible={modalAreaVisible}
                  onDismiss={() => setModalAreaVisible(false)}
                  title={TITLES.selectArea}
                  actions={AREA_OPTIONS.map(opt => ({
                    label: opt.label,
                    icon: opt.icon,
                    onPress: () => handleAreaSelect(opt.value),
                  }))}
                />

                {/* modal eleccion de empleados/pacientes */}
                <CustomModal
                  cardMarginTop={height * 0.2}
                  visible={modalUserTypeVisible}
                  onDismiss={() => setModalUserTypeVisible(false)}
                  topbarTitle={MODAL_TITLES.modalTitleEmployPatients}
                  title={`Seleccionar de ${selectedArea}:`}
                  showTopbar={true}
                  onBack={() => {
                    setModalUserTypeVisible(false);
                    setModalAreaVisible(true);
                    setSelectedArea(null);
                  }}
                  actions={TIPE_OPTIONS.map(opt => ({
                    label: opt.label,
                    icon: opt.icon,
                    onPress: () => handleUserTypeSelect(opt.value),
                  }))}
                />
              </Card.Content>
            </Card>
          </View>
        )}

        {/* modal aviso sin datos */}
        <CustomModal
          visible={noDataModalVisible}
          onRequestClose={() => setNoDataModalVisible(false)}
          showTopbar={true}
          topbarTitle={addMode ? TOP_BAR.topBarNewData : TOP_BAR.topBarNoData}
          title={MODAL_TITLES.modalNoData}
          isEditModal={true}
          onSavePress={handleSaveNewPerson}
          onBack={() => {
            setNoDataModalVisible(false);
            setModalUserTypeVisible(true);
            setAddMode(false);
          }}
          cardMarginTop={height * 0.07}
        >
          <EditPersonForm
            person={newPerson}
            onChange={setNewPerson}
            isAdding={true}
          />
        </CustomModal>

        {/* modal con detalles */}
        <CustomModal
          cardMarginTop={height * 0.07}
          visible={detailModalVisible}
          onRequestClose={() => {
            setNoDataModalVisible(false);
            setAddMode(false);
          }}
          showTopbar={true}
          onBack={() => setDetailModalVisible(false)}
          topbarTitle={getTopBarTitle(userType, TOP_BAR)}
          title={getModalTitle(userType, MODAL_TITLES)}
          isDetailModal={true}
          onGoToPlanPress={() => console.log('Ir a planilla presionado')}
          onModifyPress={handleModifyPress}
        >
          <View style={{ padding: 20 }}>
            <Text>
              <Text style={styles.detailsModal}>Nombre: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.nombre}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Edad: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.edad}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>DNI: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.dni}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Nacimiento: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.nacimiento}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Ingresó: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.ingreso}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Obra Social: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.coberturaSocial}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Nacionalidad: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.nacionalidad}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Estado Civil: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.estadoCivil}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Area: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.area}</Text>
            </Text>
            <Text>
              <Text style={styles.detailsModal}>Tipo: </Text>
              <Text style={styles.dynamicText}>{selectedPerson?.tipo}</Text>
            </Text>
            {userType === 'pacientes' && (
              <Text>
                <Text style={styles.detailsModal}>Peso: </Text>
                <Text style={styles.dynamicText}>{selectedPerson?.peso}</Text>
              </Text>
            )}
          </View>
        </CustomModal>

        {/* Modal para editar datos */}
        <CustomModal
          cardMarginTop={height * 0.07}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
          showTopbar={true}
          topbarTitle="Editar Datos"
          onBack={() => {
            setEditModalVisible(false);
            setDetailModalVisible(true);
          }}
          title="Modificar Información:"
          isEditModal={true}
          onSavePress={handleSaveEditPerson}
        >
          <View
            contentContainerStyle={{ padding: 20, backgroundColor: 'rgba(0, 255, 0, 0.2)' }}
            style={{ flexGrow: 1 }}
          >
            <EditPersonForm
              person={editablePerson}
              onChange={setEditablePerson}
              onSave={handleSaveEditPerson}
            />
          </View>
        </CustomModal>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  homeLogo: {
    height: 150,
    width: 150,
    borderRadius: 100,
    marginBottom: 12,
  },
  titleText: {
    fontSize: 30,
    color: '#000',
  },
  card: {
    backgroundColor: '#ffffff',
    width: 320,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  bigWelcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  textInput: {
    width: 260,
  },
  button: {
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  detailsModal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dynamicText: {
    fontSize: 16,
    color: '#0a0a1e',
    fontWeight: 'regular',
  },
});
