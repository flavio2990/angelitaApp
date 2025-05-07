import React from 'react';


import { StatusBar, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomModal from '@/components/CustomModal';
import CustomList from '@/components/CustomList';
import { ThemedText } from '@/components/ThemedText';

import { Dropdown } from 'react-native-paper-dropdown';
import { Provider as PaperProvider, DefaultTheme, Card, Text, TextInput, Button } from 'react-native-paper';

import { TITLES, AREA_OPTIONS, TIPE_OPTIONS, MODAL_TITLES, TOP_BAR } from './../../constants/Strings';
import peopleData from '@/constants/peopleData.json'


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

  const handleUserTypeSelect = (type) => {
    setSelectedOption(type);
    setUserType(type);
    setModalUserTypeVisible(false);
    setShowEmployeeList(true);
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

  return (
    <PaperProvider theme={theme}>
      <StatusBar />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {showEmployeeList ? (
          <CustomList
            data={peopleData.filter(
              (p) =>
                p.tipo?.toLowerCase() === userType?.toLowerCase() &&
                p.area?.toLowerCase() === selectedArea?.toLowerCase()
            )}
            onPress={handleBackPress}
            onItemPress={handleItemPress} //
            topBarTitleEmploy={
              userType === 'pacientes'
                ? TOP_BAR.topBarTitlePatient
                : TOP_BAR.topBarTitleEmploy
            }
          />

        ) : (<View style={styles.content}>
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
              <View style={{ margin: 16, width: 260 }}>
                <Dropdown
                  label="Seleccione Sector"
                  placeholder="Seleccione Sector"
                  options={[
                    { label: 'Administrador', value: 'Administrador' },
                    { label: 'Enfermería', value: 'Enfermería' },
                  ]}
                  theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                />
              </View>
              <Button
                mode="contained"
                onPress={() => setModalAreaVisible(true)}
                buttonColor="#5124A5"
                style={styles.button}
                labelStyle={styles.buttonLabel}>
                INGRESAR
              </Button>

              {/* modal eleccion de area */}
              <CustomModal
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
                visible={modalUserTypeVisible}
                onDismiss={() => setModalUserTypeVisible(false)}
                title={`Seleccionar de ${selectedArea}:`}
                topbarTitle={MODAL_TITLES.modalTitleEmployPatients}
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

        {/* modal con detalles */}
        <CustomModal
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
          showTopbar={true}
          topbarTitle={
            userType === 'pacientes'
              ? TOP_BAR.topBarModalTitlePatient
              : TOP_BAR.topBarModalTitleEmploy
          }
          onBack={() => setDetailModalVisible(false)}
          title={
            userType === 'pacientes'
              ? MODAL_TITLES.modalTitlePatient
              : MODAL_TITLES.modalTitleEmploy
          }
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
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    top: 25,
  },
  content: {
    flex: 1,
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
    resizeMode: 'cover',
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
