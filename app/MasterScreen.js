
import React, { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';

import { StatusBar, StyleSheet, View, Image, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Provider as PaperProvider, DefaultTheme, Card, Text, TextInput } from 'react-native-paper';

import CustomModal from '@/components/CustomModal';
import CustomList from '@/components/CustomList';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/CustomButton';
import EditPersonForm from '@/components/EditPersonForm';
import PersonDetails from '@/components/PersonDetails';
import RegisterAdminForm from '../components/RegisterAdminForm';
import { useAuth } from '../components/UserContext';
import HamburgerMenu from '../components/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CARD_TITLES,
  AREA_OPTIONS,
  TIPE_OPTIONS,
  MODAL_TITLES,
  TOP_BAR_HEADER_TITLES,
  AUTH_TEXTS,
  FORM_TEXTS,
  ROLE_TEXTS,
  STATUS_MESSAGES,
  NAVIGATION_TEXTS,
  VALIDATION_TEXTS
} from '../constants/Strings';
import { colors, typography, spacing, borderRadius, shadows, sizes, paperTheme } from '../constants/Theme';

import { ref, onValue, set, update } from 'firebase/database';
import { database } from '../env/firebase';

const { height } = Dimensions.get('window');

export default function MasterScreen() {
  const { user, loading, login, register, firebaseUser, resendVerification, refreshUser, logout, clearSessionOnly, sendPasswordResetEmail, globalUserRole, setUserRole, clearUserRole } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [modalUserTypeVisible, setModalUserTypeVisible] = useState(false);
  const [isInitialFlow, setIsInitialFlow] = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [userType, setUserType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editablePerson, setEditablePerson] = useState(null);
  const [noDataModalVisible, setNoDataModalVisible] = useState(false);
  const [newPerson, setNewPerson] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [originalDni, setOriginalDni] = useState(null);
  const [isCreatingNewPerson, setIsCreatingNewPerson] = useState(false);

  const [isAdminSelected, setIsAdminSelected] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [empleados, setEmpleados] = useState({});
  const [loginError, setLoginError] = useState(null);
  const [asyncPeopleData, setAsyncPeopleData] = useState([]);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showVerificationModalAfterRegister, setShowVerificationModalAfterRegister] = useState(false);
  const [resendVerificationLoading, setResendVerificationLoading] = useState(false);

  const [authStep, setAuthStep] = useState('login'); 

  const router = useRouter();

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      ...paperTheme.colors,
    },
  };

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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
        p.tipo?.toLowerCase() === type?.toLowerCase() &&
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

  const handleLogout = async () => {
    try {
      setAsyncPeopleData([]);
      setShowEmployeeList(false);
      setModalAreaVisible(false);
      setModalUserTypeVisible(false);
      setSelectedArea(null);
      setSelectedOption(null);
      setUserType(null);
      setSelectedPerson(null);
      setDetailModalVisible(false);
      setEditModalVisible(false);
      setEditablePerson(null);
      setNoDataModalVisible(false);
      setIsInitialFlow(true);
      setNewPerson({});
      setAddMode(false);
      setShowConfirmModal(false);
      setSaveSuccess(false);
      setOriginalDni(null);
      setIsCreatingNewPerson(false);

      await logout();

    } catch (error) {
      setAsyncPeopleData([]);
      setShowEmployeeList(false);
    }
  };

  const handleGoHome = () => {
    const isEditing = editModalVisible || noDataModalVisible;

    if (isEditing) {
      Alert.alert(
        "¿Estás seguro?",
        "¿Estás seguro de salir sin antes guardar?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Salir sin guardar",
            style: "destructive",
            onPress: () => goHomeConfirmed()
          }
        ]
      );
    } else {
      goHomeConfirmed();
    }
  };

  const goHomeConfirmed = () => {
    setShowEmployeeList(false);
    setDetailModalVisible(false);
    setEditModalVisible(false);
    setModalUserTypeVisible(false);
    setNoDataModalVisible(false);
    setShowConfirmModal(false);

    setSelectedPerson(null);
    setEditablePerson(null);
    setSelectedArea(null);
    setSelectedOption(null);
    setUserType(null);
    setNewPerson({});
    setAddMode(false);
    setSaveSuccess(false);
    setIsCreatingNewPerson(false);

    setModalAreaVisible(true);
    setIsInitialFlow(false);
  };

  const handleModifyPress = () => {
    setDetailModalVisible(false);
    setEditablePerson({ ...selectedPerson });
    setEditModalVisible(true);
    setOriginalDni(selectedPerson.dni);
  };

  const validateRequiredFields = (person) => {
    const isEmployee = person?.tipo &&
      (person.tipo.toLowerCase() === 'enfermería' || person.tipo.toLowerCase() === 'administrador');

    const baseRequiredFields = [
      { key: 'tipo', label: 'Tipo' },
      { key: 'area', label: 'area' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'edad', label: 'Edad' },
      { key: 'dni', label: 'DNI' },
      { key: 'nacimiento', label: 'Nacimiento' },
      { key: 'ingreso', label: 'Ingreso' },
      { key: 'nacionalidad', label: 'Nacionalidad' },
    ];

    const patientOnlyFields = [
      { key: 'coberturaSocial', label: 'Cobertura Social' },
      { key: 'estadoCivil', label: 'Estado Civil' },
      { key: 'peso', label: 'Peso' },
    ];

    const requiredFields = isEmployee ? baseRequiredFields : [...baseRequiredFields, ...patientOnlyFields];

    const missingFields = requiredFields.filter(field =>
      !person[field.key] || person[field.key].toString().trim() === ''
    );

    return missingFields;
  };

  const handleSaveNewPerson = async () => {
    if (!user || !user.uid) {
      Alert.alert("Debes iniciar sesión como administrador para guardar datos.");
      return false;
    }

    try {
      const personId = Date.now().toString();
      const personWithId = {
        ...newPerson,
        id: personId,
        createdAt: new Date().toISOString()
      };

      const personRef = ref(database, `admins/${user.uid}/areas/${newPerson.area}/subjects/${personId}`);
      await set(personRef, personWithId);
      setNoDataModalVisible(false);
      setNewPerson({});
      setShowEmployeeList(true);
      setAddMode(false);
      return true;
    } catch (error) {
      console.error("Error al guardar nueva persona:", error);
      Alert.alert("Error al guardar: " + error.message);
      return false;
    }
  };

  function getTopBarTitle(type, TOP_BAR_HEADER_TITLES) {
    if (!type) return TOP_BAR_HEADER_TITLES.topBarModalTitleEmploy;
    const t = type.toLowerCase();
    if (t === 'paciente') return TOP_BAR_HEADER_TITLES.topBarModalTitlePatient;
    if (t === 'enfermería') return TOP_BAR_HEADER_TITLES.topBarModalTitleEmploy;
    return TOP_BAR_HEADER_TITLES.topBarModalTitleEmploy;
  }

  function getModalTitle(type, MODAL_TITLES) {
    if (!type) return MODAL_TITLES.modalTitleEmploy;
    const t = type.toLowerCase();
    if (t === 'paciente') return MODAL_TITLES.modalTitlePatient;
    if (t === 'enfermería') return MODAL_TITLES.modalTitleEmploy;
    return MODAL_TITLES.modalTitleEmploy;
  }

  const handleSaveEditPerson = async () => {
    try {
      if (!user || !user.uid) {
        Alert.alert("Error", "Debes iniciar sesión como administrador para guardar datos.");
        return false;
      }

      const originalArea = selectedPerson?.area;
      const newArea = editablePerson.area;

      if (originalArea !== newArea) {
        const oldPersonRef = ref(database, `admins/${user.uid}/areas/${originalArea}/subjects/${editablePerson.id}`);
        await set(oldPersonRef, null);
        const newPersonRef = ref(database, `admins/${user.uid}/areas/${newArea}/subjects/${editablePerson.id}`);
        await set(newPersonRef, {
          ...editablePerson,
          updatedAt: new Date().toISOString()
        });
      } else {
        const personRef = ref(database, `admins/${user.uid}/areas/${editablePerson.area}/subjects/${editablePerson.id}`);
        await update(personRef, {
          ...editablePerson,
          updatedAt: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudieron guardar los datos. Intenta nuevamente.");
      return false;
    }
  };

  const handleRegister = async () => {
    try {
      setLoginError(null);
      await register(email, password, userRole);
      Alert.alert('Éxito', 'Usuario creado. Revisa tu correo para verificar.');
      setIsRegisterMode(false);
    } catch (e) {
      setLoginError(e.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Por favor ingresa tu email y contraseña');
      return;
    }

    if (!isValidEmail(email)) {
      setLoginError('Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      setLoginError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoginError(null);
      const success = await login(email, password);

      if (success) {
        setEmail('');
        setPassword('');
        setLoginError(null);
      } else {
        setPassword('');
        setLoginError('Credenciales inválidas o email no verificado');
      }
    } catch (error) {
      setLoginError(error.message);
      setPassword('');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !isValidEmail(forgotPasswordEmail)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const success = await sendPasswordResetEmail(forgotPasswordEmail);
      if (success) {
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el enlace de recuperación.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendVerificationLoading(true);
      await resendVerification();
      Alert.alert(
        'Éxito',
        'Enlace de verificación reenviado. Revisa tu correo electrónico y haz clic en el enlace para verificar tu cuenta.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert(
        'Error al reenviar verificación',
        e.message || 'No se pudo reenviar el enlace de verificación. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setResendVerificationLoading(false);
    }
  };

  const handleReloadUser = async () => {
    try {
      if (user) {
        const updatedUser = await refreshUser();

        if (updatedUser && updatedUser.emailVerified) {
          await clearSessionOnly();

          setShowVerificationModalAfterRegister(false);

          Alert.alert('¡Verificado exitosamente!', 'Ahora logeate con tu usuario y contraseña.');

          setEmail('');
          setPassword('');
          setLoginError(null);
        } else {
          Alert.alert('Verificación', 'El email aún no está verificado. Revisa tu correo y vuelve a intentar.');
        }
      }
    } catch (e) {
      Alert.alert('Error al actualizar el estado: ' + (e?.message || String(e)));
    }
  };

  useEffect(() => {
    if (globalUserRole && user && user.emailVerified && !showEmployeeList && !modalAreaVisible && !modalUserTypeVisible && !noDataModalVisible && !detailModalVisible && !editModalVisible && isInitialFlow) {
      setTimeout(() => {
        setModalAreaVisible(true);
        setIsInitialFlow(false);
      }, 500);
    }
  }, [globalUserRole, user, showEmployeeList, modalAreaVisible, modalUserTypeVisible, noDataModalVisible, detailModalVisible, editModalVisible, isInitialFlow]);


  useEffect(() => {
    if (!user?.uid) return;
    const empleadosRef = ref(database, `admins/${user.uid}/empleados`);
    const unsubscribe = onValue(empleadosRef, (snapshot) => {
      setEmpleados(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const areasRef = ref(database, `admins/${user.uid}/areas`);
    const unsubscribe = onValue(areasRef, async (snapshot) => {
      if (snapshot.exists()) {
        const areasObj = snapshot.val();
        let allPeople = [];

        Object.keys(areasObj).forEach(areaKey => {
          const area = areasObj[areaKey];
          if (area.subjects) {
            const areaPeople = Object.values(area.subjects);
            allPeople = [...allPeople, ...areaPeople];
          }
        });

        await AsyncStorage.setItem('peopleData', JSON.stringify(allPeople));
        setAsyncPeopleData(allPeople);
      } else {
        await AsyncStorage.setItem('peopleData', JSON.stringify([]));
        setAsyncPeopleData([]);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: typography.fontSizes.lg, color: colors.primary }}>Cargando...</Text>
        </View>
      </PaperProvider>
    );
  }

  if (!globalUserRole) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar />
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/grandma.png')}
              style={styles.homeLogo}
            />
            <ThemedText type="title" style={styles.titleText}>
              Bienvenido a tu Hogar!
            </ThemedText>
          </View>

          {/* Modal inicial para el rol */}
          <CustomModal
            visible={true}
            onDismiss={() => { }}
            title={AUTH_TEXTS.selectRole}
            centerCard={true}
            actions={[]}
            showHamburgerMenu={false}
          >
            <View style={{ padding: 20 }}>
              <Text style={{
                fontSize: typography.fontSizes.lg,
                textAlign: 'center',
                marginBottom: spacing.xxxl,
                color: colors.primary,
                fontWeight: typography.fontWeights.medium,
              }}>
                ¿Qué tipo de usuario eres?
              </Text>

              <CustomButton
                label={AUTH_TEXTS.adminRole}
                onPress={() => {
                  setUserRole('admin');
                  setIsAdminSelected(true);
                }}
              />
              <View style={{ height: 16 }} />
              <CustomButton
                label={AUTH_TEXTS.employeeRole}
                onPress={() => {
                  setUserRole('empleado');
                  setIsAdminSelected(false);
                }}
              />
            </View>
          </CustomModal>
        </View>
      </PaperProvider>
    );
  }

  if (!user || (user && !user.emailVerified)) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar />

        {showRegisterModal && (
          <CustomModal
            visible={showRegisterModal}
            onDismiss={() => setShowRegisterModal(false)}
            title={AUTH_TEXTS.registerTitle}
            centerCard={true}
            showHamburgerMenu={false}
            scrollable={false}
            outsideActions={[
              {
                label: AUTH_TEXTS.cancelButton,
                onPress: () => {
                  setShowRegisterModal(false);
                  setEmail('');
                  setPassword('');
                },
                mode: "text",
                textColor: '#333',
                labelStyle: {
                  fontWeight: 'normal'
                }
              }
            ]}
          >
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{
                marginBottom: spacing.sm,
                fontSize: typography.fontSizes.md,
                textAlign: 'center',
                color: colors.textLight,
              }}>
                Ingresa estos datos para crear una cuenta
              </Text>

              {!globalUserRole && (
                <Text style={{
                  marginBottom: spacing.md,
                  fontSize: typography.fontSizes.sm,
                  textAlign: 'center',
                  color: colors.errorLight,
                  fontWeight: typography.fontWeights.semiBold,
                }}>
                  {AUTH_TEXTS.selectRoleFirst}
                </Text>
              )}

              <TextInput
                label={AUTH_TEXTS.emailLabel}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: spacing.lg, width: sizes.buttonWidth }}
                theme={{ colors: { text: colors.black, primary: colors.secondary } }}
              />

              <TextInput
                label={AUTH_TEXTS.passwordLabel}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ marginBottom: spacing.lg, width: sizes.buttonWidth }}
                theme={{ colors: { text: colors.black, primary: colors.secondary } }}
              />

              <View style={{ flexDirection: 'column', alignItems: 'center', width: 260 }}>
                <CustomButton
                  label={AUTH_TEXTS.createUserButton}
                  onPress={async () => {
                    try {
                      await register(email, password, globalUserRole);
                      setShowRegisterModal(false);
                      setEmail('');
                      setPassword('');
                      setShowVerificationModalAfterRegister(true);
                    } catch (error) {
                      setEmail('');
                      setPassword('');
                    }
                  }}
                  disabled={!isValidEmail(email) || !password || password.length < 6 || !globalUserRole}
                  style={{ marginBottom: 16, width: 260 }}
                />
              </View>
            </View>
          </CustomModal>
        )}

        {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA */}
        {showForgotPasswordModal && (
          <CustomModal
            visible={showForgotPasswordModal}
            onDismiss={() => setShowForgotPasswordModal(false)}
            title={AUTH_TEXTS.forgotPasswordTitle}
            centerCard={true}
            showHamburgerMenu={false}
            scrollable={false}
            outsideActions={[
              {
                label: "Cancelar",
                onPress: () => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordEmail('');
                },
                mode: "text",
                textColor: '#333',
                labelStyle: {
                  fontWeight: 'normal'
                }
              }
            ]}
          >
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{
                marginBottom: spacing.xl,
                fontSize: typography.fontSizes.md,
                textAlign: 'center',
                color: colors.textLight,
              }}>
                {AUTH_TEXTS.forgotPasswordMessage}
              </Text>

              <TextInput
                label={AUTH_TEXTS.emailLabel}
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: spacing.xl, width: sizes.buttonWidth }}
                theme={{ colors: { text: colors.black, primary: colors.secondary } }}
              />

              <View style={{ flexDirection: 'column', alignItems: 'center', width: 260 }}>
                <CustomButton
                  label={AUTH_TEXTS.sendResetButton}
                  onPress={handleForgotPassword}
                  disabled={!isValidEmail(forgotPasswordEmail) || forgotPasswordLoading}
                  style={{ marginBottom: 16, width: 260 }}
                />
              </View>
            </View>
          </CustomModal>
        )}

        {/* MODAL DE VERIFICACIÓN DESPUÉS DEL REGISTRO EXITOSO */}
        {showVerificationModalAfterRegister && (
          <CustomModal
            visible={true}
            onDismiss={() => { }} 
            title={AUTH_TEXTS.verificationTitle}
            centerCard={true}
            showHamburgerMenu={false}
          >
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{
                marginBottom: spacing.xl,
                fontSize: typography.fontSizes.md,
                textAlign: 'center',
                color: colors.textLight,
              }}>
                {AUTH_TEXTS.verificationMessage}
              </Text>

              <View style={{ flexDirection: 'column', alignItems: 'center', width: 260 }}>
                <CustomButton
                  label={resendVerificationLoading ? STATUS_MESSAGES.saving : AUTH_TEXTS.verificationButton}
                  onPress={handleResendVerification}
                  disabled={resendVerificationLoading}
                  style={{ marginBottom: 8, width: 260 }}
                />
                <View style={{ height: 16 }} />
                <CustomButton
                  label={AUTH_TEXTS.backToLogin}
                  onPress={handleReloadUser}
                  style={{ marginBottom: 16, width: 260 }}
                />
              </View>
            </View>
          </CustomModal>
        )}

        {/* VISTA DE LOGIN PRINCIPAL */}
        {authStep === 'login' && (
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/grandma.png')}
              style={styles.homeLogo}
            />
            <ThemedText type="title" style={styles.titleText}>
              Bienvenido a tu Hogar!
            </ThemedText>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge" style={styles.bigWelcomeText}>
                {AUTH_TEXTS.loginTitle}
              </Text>
              <TextInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (!emailTouched) setEmailTouched(true);
                }}
                label={AUTH_TEXTS.emailLabel}
                style={styles.textInput}
                theme={{ colors: { text: colors.black, primary: colors.secondary, placeholder: colors.textMuted } }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={() => setEmailTouched(true)}
              />
              {emailTouched && !isValidEmail(email) && (
                <Text style={{ color: colors.error, marginTop: spacing.xs, marginBottom: spacing.xs, fontSize: typography.fontSizes.lg }}>
                  Ingrese un mail válido
                </Text>
              )}
              <View style={{ margin: 8 }} />
              <TextInput
                label={AUTH_TEXTS.passwordLabel}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.textInput}
                theme={{ colors: { text: colors.black, primary: colors.secondary, placeholder: colors.textMuted } }}
              />
              <View style={{ margin: 8 }} />
              <CustomButton
                onPress={handleLogin}
                label={AUTH_TEXTS.loginButton}
                disabled={!isValidEmail(email) || !password || password.length < 6 || loading}
              />
              {loginError && (
                <Text style={{ color: colors.error, marginTop: spacing.sm, fontSize: typography.fontSizes.md, textAlign: 'center' }}>
                  {loginError}
                </Text>
              )}

              {/* Botón Olvidé mi contraseña */}
              <TouchableOpacity
                onPress={() => setShowForgotPasswordModal(true)}
                style={{ marginTop: spacing.lg, paddingVertical: spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontSize: typography.fontSizes.md, textAlign: 'center' }}>
                  {AUTH_TEXTS.forgotPassword}
                </Text>
              </TouchableOpacity>

              {globalUserRole === 'admin' && (
                <TouchableOpacity onPress={() => setShowRegisterModal(true)} style={{ marginTop: spacing.lg }}>
                  <Text style={{ color: colors.primary, fontWeight: typography.fontWeights.bold, fontSize: typography.fontSizes.lg }}>
                    {AUTH_TEXTS.noAccount} {AUTH_TEXTS.createAccount}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón para cambiar de rol */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await clearUserRole();
                    setIsAdminSelected(false);
                    await logout();
                  } catch (error) {
                    await logout();
                  }
                }}
                style={{
                  marginTop: spacing.lg,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  backgroundColor: colors.errorLight,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: colors.white, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semiBold }}>
                  {AUTH_TEXTS.changeRole}
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      )}
      </PaperProvider>
    );
  }


  return (
    <PaperProvider theme={theme}>
      <StatusBar />

      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <HamburgerMenu position="top-right" onLogout={handleLogout} onGoHome={handleGoHome} showGoHomeOption={true} />


        {/* LISTA DE EMPLEADOS/PACIENTES */}
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
            canEdit={globalUserRole === 'admin'}
            onAddPress={() => {
              setNewPerson({});
              setNoDataModalVisible(true);
              setAddMode(true);
            }}
          />
        ) : null}

        {/* MODAL SELECCIÓN DE AREA */}
        <CustomModal
          visible={modalAreaVisible}
          onDismiss={() => setModalAreaVisible(false)}
          title={CARD_TITLES.selectArea}
          centerCard={true}
          showHamburgerMenu={true}
          showGoHomeOption={false}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          actions={AREA_OPTIONS.map(opt => ({
            label: opt.label,
            icon: opt.icon,
            onPress: () => handleAreaSelect(opt.value),
          }))}
        />

        {/* MODAL SELECCIÓN DE EMPLEADOS/PACIENTES */}
        <CustomModal
          visible={modalUserTypeVisible}
          onDismiss={() => setModalUserTypeVisible(false)}
          topbarTitle={MODAL_TITLES.modalTitleEmployPatients}
          title={`${CARD_TITLES.selectTipe}${selectedArea}:`}
          centerCard={true}
          showTopbar={true}
          showHamburgerMenu={true}
          topbarMarginTop={20}
          onBack={() => {
            setModalUserTypeVisible(false);
            setModalAreaVisible(true);
            setSelectedArea(null);
          }}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          showGoHomeOption={true}
          actions={TIPE_OPTIONS.map(opt => ({
            label: opt.label,
            icon: opt.icon,
            onPress: () => handleUserTypeSelect(opt.value),
          }))}
        />


        {/* MODAL AVISO SIN DATOS */}
        <CustomModal
          visible={noDataModalVisible}
          onRequestClose={() => setNoDataModalVisible(false)}
          showTopbar={true}
          topbarTitle={addMode ? TOP_BAR_HEADER_TITLES.topBarNewData : TOP_BAR_HEADER_TITLES.topBarNoData}
          title={MODAL_TITLES.modalNoData}
          isEditModal={true}
          canEdit={true}
          offsetWithTopbar={true}
          topbarMarginTop={80}
          onSavePress={() => {
            const missingFields = validateRequiredFields(newPerson);
            if (missingFields.length > 0) {
              const missingFieldsText = missingFields.map(field => `• ${field.label}`).join('\n');
              Alert.alert(
                VALIDATION_TEXTS.requiredFields,
                `${VALIDATION_TEXTS.fillAllFields}\n\n${VALIDATION_TEXTS.missingFields}\n${missingFieldsText}`,
                [{ text: VALIDATION_TEXTS.ok }]
              );
              return;
            }

            setNoDataModalVisible(false);
            setIsCreatingNewPerson(true);
            setTimeout(() => setShowConfirmModal(true), 300);
          }}
          onBack={() => {
            setNoDataModalVisible(false);
            setModalUserTypeVisible(true);
            setAddMode(false);
          }}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          cardMarginTop={height * 0.07}
        >
          <EditPersonForm
            person={newPerson}
            onChange={setNewPerson}
            isAdding={true}
            selectedArea={selectedArea}
            userType={userType}
          />
        </CustomModal>

        {/* MODAL DATOS DEL PACIENTE */}
        <CustomModal
          cardMarginTop={height * 0.07}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
          showTopbar={true}
          showHamburgerMenu={true}
          offsetWithTopbar={true}
          topbarMarginTop={80}
          onBack={() => setDetailModalVisible(false)}
          topbarTitle={getTopBarTitle(userType, TOP_BAR_HEADER_TITLES)}
          title={getModalTitle(userType, MODAL_TITLES)}
          isDetailModal={true}
          canEdit={globalUserRole === 'admin'}
          onGoToPlanPress={() => {
            setDetailModalVisible(false);
            if (selectedPerson?.nombre) {
              router.push({
                pathname: '/SpreadsheetManagementScreen',
                params: {
                  patientName: selectedPerson.nombre,
                  area: selectedPerson.area,
                  personId: selectedPerson.id
                }
              });
            }
          }}
          onModifyPress={handleModifyPress}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          showGoHomeOption={true}
        >
          <View >
            <PersonDetails person={selectedPerson} userType={userType} />
          </View>
        </CustomModal>

        {/* MODAL PARA MODIFICAR INFORMACION */}
        <CustomModal
          cardMarginTop={height * 0.07}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
          showTopbar={true}
          showHamburgerMenu={true}
          offsetWithTopbar={true}
          topbarMarginTop={80}
          topbarTitle={FORM_TEXTS.editButton}
          onBack={() => {
            setEditModalVisible(false);
            setDetailModalVisible(true);
          }}
          title={`${FORM_TEXTS.editButton} Información:`}
          isEditModal={true}
          canEdit={true}
          onSavePress={() => {
            setEditModalVisible(false);
            setIsCreatingNewPerson(false);
            setTimeout(() => setShowConfirmModal(true), 300);
          }}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          showGoHomeOption={true}
        >
          <View
            contentContainerStyle={{ padding: 20, backgroundColor: 'rgba(0, 255, 0, 0.2)' }}
            style={{ flexGrow: 1 }}
          >
            <EditPersonForm
              person={editablePerson}
              onChange={setEditablePerson}
              onSave={handleSaveEditPerson}
              selectedArea={selectedArea}
              userType={userType}
            />
          </View>
        </CustomModal>

        {/* MODAL DE CONFIRMACIÓN */}
        <CustomModal
          visible={showConfirmModal}
          onDismiss={() => {
            setShowConfirmModal(false);
            setSaveSuccess(false);
            setIsCreatingNewPerson(false);
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
                  setIsCreatingNewPerson(false);
                  setEditModalVisible(false);
                  setNewPerson({});
                  setAddMode(false);

                  if (editablePerson && !isCreatingNewPerson) {
                    setSelectedPerson(editablePerson);
                    setDetailModalVisible(true);
                  } else {
                    setShowEmployeeList(true);
                  }
                }}
              />
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <CustomButton
                  label="Sí"
                  onPress={async () => {
                    let success = false;
                    if (isCreatingNewPerson) {
                      success = await handleSaveNewPerson();
                    } else {
                      success = await handleSaveEditPerson();
                    }

                    if (success) {
                      setSaveSuccess(true);
                    }
                  }}
                  style={{ marginBottom: 16 }}
                />
                <CustomButton
                  label="No"
                  onPress={() => {
                    setShowConfirmModal(false);
                    setIsCreatingNewPerson(false);
                  }}
                  buttonColor={colors.errorLight}
                />
              </View>
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
    backgroundColor: colors.white,
  },
  content: {
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: 60,
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },
  homeLogo: {
    height: sizes.homeLogo,
    width: sizes.homeLogo,
    borderRadius: borderRadius.circle,
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: typography.fontSizes.title,
    color: colors.black,
  },
  card: {
    backgroundColor: colors.white,
    width: sizes.cardWidth,
    borderRadius: borderRadius.xxl,
    ...shadows.md,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  bigWelcomeText: {
    fontSize: typography.fontSizes.display,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  textInput: {
    width: sizes.buttonWidth,
  },
  button: {
    width: sizes.buttonWidth,
    height: sizes.buttonHeight,
    justifyContent: 'center',
    borderRadius: borderRadius.pill,
  },
  buttonLabel: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xl,
  },
});