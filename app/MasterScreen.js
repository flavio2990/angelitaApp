import React from 'react';

import { StatusBar, StyleSheet, View, Image, Dimensions, TouchableOpacity } from 'react-native';


import CustomModal from '@/components/CustomModal';
import CustomList from '@/components/CustomList';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/CustomButton';
import EditPersonForm from '@/components/EditPersonForm';
import PersonDetails from '@/components/PersonDetails';
import RegisterAdminForm from '../components/RegisterAdminForm';


import { Provider as PaperProvider, DefaultTheme, Card, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CARD_TITLES, AREA_OPTIONS, TIPE_OPTIONS, MODAL_TITLES, TOP_BAR_HEADER_TITLES } from '../constants/Strings';

const { height } = Dimensions.get('window');

export default function MasterScreen() {
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
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [originalDni, setOriginalDni] = React.useState(null);
  const [showRoleModal, setShowRoleModal] = React.useState(true);
  const [isAdminSelected, setIsAdminSelected] = React.useState(false);
  const [emailTouched, setEmailTouched] = React.useState(false);
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);


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
    setOriginalDni(selectedPerson.dni);
  };

  const handleSaveNewPerson = async () => {
    try {
      const stored = await AsyncStorage.getItem('peopleData');
      let peopleList = stored ? JSON.parse(stored) : [];

      const updatedList = [...peopleList, newPerson];
      await AsyncStorage.setItem('peopleData', JSON.stringify([...asyncPeopleData, newPerson, updatedList]));

      console.log("Guardado en AsyncStorage:", newPerson);
      setNoDataModalVisible(false);
      setNewPerson({});
      setShowEmployeeList(true);
      setAsyncPeopleData(stored ? JSON.parse(stored) : []);
      setAddMode(false);
    } catch (error) {
      console.error("Error guardando persona:", error);
    }
  };

  function getTopBarTitle(type, TOP_BAR_HEADER_TITLES) {
    if (!type) return TOP_BAR_HEADER_TITLES.topBarTitleEmploy;
    const t = type.toLowerCase();
    if (t.includes('paciente')) return TOP_BAR_HEADER_TITLES.topBarTitlePatient;
    if (t.includes('enfermero')) return TOP_BAR_HEADER_TITLES.topBarTitleEmploy;
    return TOP_BAR_HEADER_TITLES.topBarTitleEmploy;
  }

  function getModalTitle(type, MODAL_TITLES) {
    if (!type) return MODAL_TITLES.modalTitleEmploy;
    const t = type.toLowerCase();
    if (t.includes('paciente')) return MODAL_TITLES.modalTitlePatient;
    if (t.includes('enfermero')) return MODAL_TITLES.modalTitleEmploy;
    return MODAL_TITLES.modalTitleEmploy;
  }

  const handleSaveEditPerson = async () => {
    try {
      const stored = await AsyncStorage.getItem('peopleData');
      let peopleList = stored ? JSON.parse(stored) : [];
      const index = peopleList.findIndex(p => p.dni === originalDni);
      if (index !== -1) {
        peopleList[index] = editablePerson;
        await AsyncStorage.setItem('peopleData', JSON.stringify(peopleList));

        setShowEmployeeList(false);
        setTimeout(() => setShowEmployeeList(true), 0);
      }
    } catch (error) {
      console.error("Error actualizando persona:", error);
    }
  };

  const [asyncPeopleData, setAsyncPeopleData] = React.useState([]);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
  }

  // function handleSendCode() {
  //   const code = generateRandomCode();
  //   setSentCode(code);
  //   setCodeStep(true);
  //   // Aquí deberías enviar el código por mail usando tu backend o Firebase en el futuro
  //   alert(`Código de validación enviado a ${registerEmail} (simulado): ${code}`);
  // }

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

      {/* modal inicial para el roll */}
      <CustomModal
        visible={showRoleModal}
        onDismiss={() => { }}
        title="Seleccione:"
        centerCard={true}
        actions={[]}
      >
        <CustomButton
          label="Soy Administrador"
          onPress={() => {
            setIsAdminSelected(true);
            setShowRoleModal(false);
          }}
        />
        <View style={{ height: 16 }} />
        <CustomButton
          label="Soy Empleado"
          onPress={() => {
            setIsAdminSelected(false);
            setShowRoleModal(false);
          }}
          style={{ marginTop: 16 }}
        />
      </CustomModal>

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
            topBarTitleEmploy={getTopBarTitle(userType, TOP_BAR_HEADER_TITLES)}
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
                  onChangeText={text => {
                    setUsername(text);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  label="Usuario"
                  style={styles.textInput}
                  theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={() => setEmailTouched(true)}
                />
                {emailTouched && !isValidEmail(username) && (
                  <Text style={{ color: 'red', marginTop: 4, marginBottom: 4, fontSize: 18 }}>
                    Ingrese un mail válido
                  </Text>
                )}
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
                  disabled={!isValidEmail(username)}
                />
                {isAdminSelected && (
                  <TouchableOpacity
                    onPress={() => setShowRegisterModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      color: '#5124A5',
                      fontWeight: 'bold',
                      marginTop: 16,
                      fontSize: 18,
                    }}
                    >
                      Crea Tu Usuario
                    </Text>
                  </TouchableOpacity>
                )}

                {/* modal registro de usuario */}
                <CustomModal
                  visible={showRegisterModal}
                  onDismiss={() => setShowRegisterModal(false)}
                  title="Crear Usuario Administrador"
                  centerCard={true}
                >
                  <RegisterAdminForm
                    onRegister={(email, password) => {
                      setShowRegisterModal(false);
                    }}
                    onSendCode={(email, code) => {
                    }}
                  />
                </CustomModal>

                {/* modal eleccion de area */}
                <CustomModal
                  cardMarginTop={height * 0.3}
                  visible={modalAreaVisible}
                  onDismiss={() => setModalAreaVisible(false)}
                  title={CARD_TITLES.selectArea}
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
          topbarTitle={addMode ? TOP_BAR_HEADER_TITLES.topBarNewData : TOP_BAR_HEADER_TITLES.topBarNoData}
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
          topbarTitle={getTopBarTitle(userType, TOP_BAR_HEADER_TITLES)}
          title={getModalTitle(userType, MODAL_TITLES)}
          isDetailModal={true}
          onGoToPlanPress={() => console.log('Ir a planilla presionado')}
          onModifyPress={handleModifyPress}
        >
          <View >
            <PersonDetails person={selectedPerson} userType={userType} />
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
          onSavePress={() => {
            setEditModalVisible(false);
            setTimeout(() => setShowConfirmModal(true), 300);
          }}
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

        {/* modal de confirmación */}
        <CustomModal
          visible={showConfirmModal}
          onDismiss={() => {
            setShowConfirmModal(false);
            setSaveSuccess(false);
          }}
          title={saveSuccess ? "¡GUARDADO!" : "¿Guardar todo?"}
          centerCard={true}
          actions={
            saveSuccess
              ? [
                {
                  label: "OK",
                  mode: "contained",
                  buttonColor: "white",
                  textColor: "#5124A5",
                  onPress: () => {
                    setShowConfirmModal(false);
                    setSaveSuccess(false);
                    setEditModalVisible(false);
                    setDetailModalVisible(false);
                    setSelectedPerson(null);
                    setOriginalDni(null);
                  }
                }
              ]
              : [
                {
                  label: "Sí",
                  mode: "contained",
                  buttonColor: "white",
                  textColor: "#5124A5",
                  onPress: async () => {
                    await handleSaveEditPerson();
                    setSaveSuccess(true);
                  }
                },
                {
                  label: "No",
                  mode: "outlined",
                  buttonColor: "white",
                  textColor: "#5124A5",
                  onPress: () => setShowConfirmModal(false)
                }
              ]
          }
        />
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
});
