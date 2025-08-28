
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
// import GlobalUserDebugger from '../components/GlobalUserDebugger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARD_TITLES, AREA_OPTIONS, TIPE_OPTIONS, MODAL_TITLES, TOP_BAR_HEADER_TITLES } from '../constants/Strings';

import { ref, onValue, set } from 'firebase/database';
import { database } from '../env/firebase';

const { height } = Dimensions.get('window');

export default function MasterScreen() {
  const { user, loading, login, register, firebaseUser, resendVerification, refreshUser, logout, clearSessionOnly, sendPasswordResetEmail, globalUserRole, setUserRole, clearUserRole } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [modalUserTypeVisible, setModalUserTypeVisible] = useState(false);
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

  const [isAdminSelected, setIsAdminSelected] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [empleados, setEmpleados] = useState({});
  const [loginError, setLoginError] = useState(null);
  const [asyncPeopleData, setAsyncPeopleData] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showLoginAfterVerification, setShowLoginAfterVerification] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showVerificationModalAfterRegister, setShowVerificationModalAfterRegister] = useState(false);
  const [resendVerificationLoading, setResendVerificationLoading] = useState(false);

  const router = useRouter();

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

  // Función para limpiar datos locales cuando se hace logout
  const handleLogout = async () => {
    try {
      // Limpiar estado local de personas
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
      setNewPerson({});
      setAddMode(false);
      setShowConfirmModal(false);
      setSaveSuccess(false);
      setOriginalDni(null);
      
      // Ejecutar logout del contexto (que ya limpia AsyncStorage)
      await logout();
      
    } catch (error) {
      // Aún así, intentar limpiar el estado local
      setAsyncPeopleData([]);
      setShowEmployeeList(false);
    }
  };

  const handleModifyPress = () => {
    setDetailModalVisible(false);
    setEditablePerson({ ...selectedPerson });
    setEditModalVisible(true);
    setOriginalDni(selectedPerson.dni);
  };

  const handleSaveNewPerson = async () => {
    if (!user || !user.uid) {
      Alert.alert("Debes iniciar sesión como administrador para guardar datos.");
      return;
    }
    try {
      const personId = Date.now().toString();
      const personWithId = { ...newPerson, id: personId };

      const stored = await AsyncStorage.getItem('peopleData');
      let peopleList = stored ? JSON.parse(stored) : [];
      const updatedList = [...peopleList, personWithId];
      await AsyncStorage.setItem('peopleData', JSON.stringify(updatedList));

      await set(ref(database, `admins/${user.uid}/people/${personId}`), {
        ...personWithId,
        createdAt: new Date().toISOString()
      });

      setAsyncPeopleData(updatedList);
      setNoDataModalVisible(false);
      setNewPerson({});
      setShowEmployeeList(true);
      setAddMode(false);
          } catch (error) {
        Alert.alert("Error al guardar: " + error.message);
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
      const stored = await AsyncStorage.getItem('peopleData');
      let peopleList = stored ? JSON.parse(stored) : [];
      const index = peopleList.findIndex(p => p.dni === originalDni);
      if (index !== -1) {
        peopleList[index] = editablePerson;
        await AsyncStorage.setItem('peopleData', JSON.stringify(peopleList));
      }

      await set(ref(database, `admins/${user.uid}/people/${editablePerson.id}`), {
        ...editablePerson,
        updatedAt: new Date().toISOString()
      });

          } catch (error) {
        // Error silencioso
      }
  };

  //////////////////////////// Registro
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

  //////////////////////////// Login
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

  //////////////////////////// Verificación
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
        // Refrescar el usuario y obtener el resultado
        const updatedUser = await refreshUser();
        
        if (updatedUser && updatedUser.emailVerified) {
          // Email verificado, mantener el rol pero limpiar la sesión
          await clearSessionOnly(); // Solo limpia la sesión, mantiene el rol
          
          // Ocultar modal de verificación
          setShowVerificationModalAfterRegister(false);
          
          Alert.alert('¡Verificado exitosamente!', 'Ahora logeate con tu usuario y contraseña.');
          
          // Limpiar campos de login
          setEmail('');
          setPassword('');
          setLoginError(null);
        } else {
          // Email aún no verificado
          Alert.alert('Verificación', 'El email aún no está verificado. Revisa tu correo y vuelve a intentar.');
        }
      }
    } catch (e) {
      Alert.alert('Error al actualizar el estado: ' + (e?.message || String(e)));
    }
  };

  // useEffect para mostrar automáticamente el modal de área después del login exitoso
  useEffect(() => {
    if (globalUserRole && user && user.emailVerified && !showEmployeeList && !modalAreaVisible) {
      // Pequeño delay para asegurar que la UI esté lista
      setTimeout(() => {
        setModalAreaVisible(true);
      }, 500);
    }
  }, [globalUserRole, user, showEmployeeList, modalAreaVisible]);

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
    const peopleRef = ref(database, `admins/${user.uid}/people`);
    const unsubscribe = onValue(peopleRef, async (snapshot) => {
      if (snapshot.exists()) {
        const peopleObj = snapshot.val();
        const peopleList = Object.values(peopleObj);
        await AsyncStorage.setItem('peopleData', JSON.stringify(peopleList));
        setAsyncPeopleData(peopleList);
      } else {
        await AsyncStorage.setItem('peopleData', JSON.stringify([]));
        setAsyncPeopleData([]);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  /////////////////////////////////
  // FLUJO PRINCIPAL ORDENADO Y SIN DUPLICACIONES
  /////////////////////////////////

  // ---------- 1. LOADING ----------
  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 18, color: '#5124A5' }}>Cargando...</Text>
        </View>
      </PaperProvider>
    );
  }

  // ---------- 2. SELECCIÓN DE ROL ----------
  // NOTA: El modal de selección de rol aparece SOLO cuando no hay globalUserRole
  // Esto garantiza que:
  // - Al reiniciar la app, si no hay rol persistido, se muestra el modal
  // - Si hay rol persistido, se va directo al flujo de login/registro
  // - Después de un logout seguro, se vuelve a mostrar el modal
  

  
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
            title="Seleccione su rol:"
            centerCard={true}
            actions={[]}
          >
            <View style={{ padding: 20 }}>
              <Text style={{ 
                fontSize: 18, 
                textAlign: 'center', 
                marginBottom: 30, 
                color: '#5124A5',
                fontWeight: '500'
              }}>
                ¿Qué tipo de usuario eres?
              </Text>
              
              <CustomButton
                label="Soy Administrador"
                onPress={() => {
                  setUserRole('admin');
                  setIsAdminSelected(true);
                }}
              />
              <View style={{ height: 16 }} />
              <CustomButton
                label="Soy Empleado"
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

  // ---------- 3. LOGIN (usuario no logueado o sin verificar) ----------
  if (!user || (user && !user.emailVerified)) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar />
        
        {/* MODAL DE REGISTRO */}
        {showRegisterModal && (
          <CustomModal
            visible={true}
            onDismiss={() => setShowRegisterModal(false)}
            title="Crear Usuario Administrador"
            centerCard={true}
            showHamburgerMenu={false}
          >
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ 
                marginBottom: 20, 
                fontSize: 16, 
                textAlign: 'center',
                color: '#666'
              }}>
                Ingresa tu email y contraseña para crear tu cuenta
              </Text>
              
              {globalUserRole && (
                <Text style={{ 
                  marginBottom: 20, 
                  fontSize: 14, 
                  textAlign: 'center',
                  color: '#5124A5',
                  fontWeight: '600'
                }}>
                  Rol seleccionado: {globalUserRole === 'admin' ? '🛡️ ADMINISTRADOR' : '👤 EMPLEADO'}
                </Text>
              )}
              
              {!globalUserRole && (
                <Text style={{ 
                  marginBottom: 20, 
                  fontSize: 14, 
                  textAlign: 'center',
                  color: '#FF6B6B',
                  fontWeight: '600'
                }}>
                  ⚠️ Primero debes seleccionar un rol
                </Text>
              )}
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: 16, width: 260 }}
                theme={{ colors: { text: '#000', primary: '#007AFF' } }}
              />
              
              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ marginBottom: 20, width: 260 }}
                theme={{ colors: { text: '#000', primary: '#007AFF' } }}
              />
              
              <View style={{ flexDirection: 'column', alignItems: 'center', width: 260 }}>
                <CustomButton
                  label="CREAR USUARIO"
                  onPress={async () => {
                    try {
                      await register(email, password, globalUserRole);
                      setShowRegisterModal(false);
                      setEmail('');
                      setPassword('');
                      // Mostrar modal de verificación después del registro exitoso
                      setShowVerificationModalAfterRegister(true);
                    } catch (error) {
                      // Solo limpiar campos en caso de error
                      setEmail('');
                      setPassword('');
                    }
                  }}
                  disabled={!isValidEmail(email) || !password || password.length < 6 || !globalUserRole}
                  style={{ marginBottom: 16, width: 260 }}
                />
                
                <TouchableOpacity
                  onPress={() => {
                    setShowRegisterModal(false);
                    setEmail('');
                    setPassword('');
                  }}
                  style={{
                    paddingVertical: 8
                  }}
                >
                  <Text style={{ 
                    color: '#666', 
                    fontSize: 16,
                    textDecorationLine: 'underline'
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </CustomModal>
        )}

        {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA */}
        {showForgotPasswordModal && (
          <CustomModal
            visible={true}
            onDismiss={() => setShowForgotPasswordModal(false)}
            title="Recuperar Contraseña"
            centerCard={true}
            showHamburgerMenu={false}
          >
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ 
                marginBottom: 20, 
                fontSize: 16, 
                textAlign: 'center',
                color: '#666'
              }}>
                Ingresa tu email para recibir un enlace de recuperación
              </Text>
              
              <TextInput
                label="Email"
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: 20, width: 260 }}
                theme={{ colors: { text: '#000', primary: '#007AFF' } }}
              />
              
              <View style={{ flexDirection: 'column', alignItems: 'center', width: 260 }}>
                <CustomButton
                  label="ENVIAR ENLACE"
                  onPress={handleForgotPassword}
                  disabled={!isValidEmail(forgotPasswordEmail) || forgotPasswordLoading}
                  style={{ marginBottom: 16, width: 260 }}
                />
                
                <TouchableOpacity
                  onPress={() => {
                    setShowForgotPasswordModal(false);
                    setForgotPasswordEmail('');
                  }}
                  style={{
                    paddingVertical: 8
                  }}
                >
                  <Text style={{ 
                    color: '#666', 
                    fontSize: 16,
                    textDecorationLine: 'underline'
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </CustomModal>
        )}

        {/* MODAL DE VERIFICACIÓN DESPUÉS DEL REGISTRO EXITOSO */}
        {showVerificationModalAfterRegister && (
          <CustomModal
            visible={true}
            onDismiss={() => { }} // No permitir cerrar hasta verificar
            title="Verifica tu correo"
            centerCard={true}
            showHamburgerMenu={false}
          >
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ 
                marginBottom: 20, 
                fontSize: 16, 
                textAlign: 'center',
                color: '#666'
              }}>
                Usuario creado exitosamente. Debes verificar tu correo electrónico antes de continuar.
              </Text>
              
              <Text style={{ 
                marginBottom: 20, 
                fontSize: 14, 
                textAlign: 'center',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Revisa tu correo y haz clic en el enlace de verificación.
              </Text>
              
              {firebaseUser && (
                <Text style={{ 
                  marginBottom: 20, 
                  fontSize: 12, 
                  textAlign: 'center',
                  color: '#007AFF',
                  fontWeight: '500'
                }}>
                  Email: {firebaseUser.email}
                </Text>
              )}
              
              
              
              <View style={{ flexDirection: 'column', alignItems: 'center', width: 260 }}>
                <CustomButton
                  label={resendVerificationLoading ? "Enviando..." : "Reenviar enlace"}
                  onPress={handleResendVerification}
                  disabled={resendVerificationLoading}
                  style={{ marginBottom: 16, width: 260 }}
                />
                <View style={{ height: 16 }} />
                <CustomButton
                  label="Ya verifiqué mi correo"
                  onPress={handleReloadUser}
                  style={{ marginBottom: 16, width: 260 }}
                />
              </View>
            </View>
          </CustomModal>
        )}
        
        {/* PANTALLA DE LOGIN PRINCIPAL */}
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
                Iniciar Sesión
              </Text>
              <TextInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (!emailTouched) setEmailTouched(true);
                }}
                label="Email"
                style={styles.textInput}
                theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={() => setEmailTouched(true)}
              />
              {emailTouched && !isValidEmail(email) && (
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
                onPress={handleLogin}
                label="INGRESAR"
                disabled={!isValidEmail(email) || !password || password.length < 6 || loading}
              />
              {loginError && (
                <Text style={{ color: 'red', marginTop: 8, fontSize: 16, textAlign: 'center' }}>
                  {loginError}
                </Text>
              )}
              
              {/* Botón Olvidé mi contraseña */}
              <TouchableOpacity 
                onPress={() => setShowForgotPasswordModal(true)}
                style={{ 
                  marginTop: 16,
                  paddingVertical: 8
                }}
              >
                <Text style={{ 
                  color: '#5124A5', 
                  fontSize: 16,
                  textDecorationLine: 'underline',
                  textAlign: 'center'
                }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
              
                             {globalUserRole === 'admin' && (
                <TouchableOpacity onPress={() => setShowRegisterModal(true)} style={{ marginTop: 16 }}>
                  <Text style={{ color: '#5124A5', fontWeight: 'bold', fontSize: 18 }}>
                    ¿No tienes cuenta? Regístrate
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Botón para cambiar de rol */}
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    // Limpiar rol de manera segura
                    await clearUserRole();
                    setIsAdminSelected(false);
                    
                    // Luego hacer logout
                    await logout();
                    
                  } catch (error) {
                    // Aún así, intentar logout
                    await logout();
                  }
                }} 
                style={{ 
                  marginTop: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#FF6B6B',
                  borderRadius: 20
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Cambiar de rol
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      </PaperProvider>
    );
  }

  // ---------- 4. APP PRINCIPAL (usuario logueado y verificado) ----------
  
  return (
    <PaperProvider theme={theme}>
      <StatusBar />

      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                  {/* MENÚ HAMBURGUESA - SIEMPRE VISIBLE EN APP PRINCIPAL */}
          <HamburgerMenu position="top-right" onLogout={handleLogout} />
        
        {/* DEBUGGER TEMPORAL - PARA VERIFICAR ESTADO GLOBAL */}
        {/* <GlobalUserDebugger /> */}
        
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
            onAddPress={() => {
              setNewPerson({});
              setNoDataModalVisible(true);
              setAddMode(true);
            }}
          />
        ) : null}

        {/* MODAL ELECCIÓN DE ÁREA */}
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

        {/* MODAL ELECCIÓN DE EMPLEADOS/PACIENTES */}
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

        {/* MODAL DE REGISTRO DE USUARIO */}
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

        {/* MODAL AVISO SIN DATOS */}
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

        {/* MODAL CON DETALLES */}
        <CustomModal
          cardMarginTop={height * 0.07}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
          showTopbar={true}
          onBack={() => setDetailModalVisible(false)}
          topbarTitle={getTopBarTitle(userType, TOP_BAR_HEADER_TITLES)}
          title={getModalTitle(userType, MODAL_TITLES)}
          isDetailModal={true}
          onGoToPlanPress={() => {
            setDetailModalVisible(false);
            if (selectedPerson?.nombre) {
              router.push({
                pathname: '/SpreadsheetManagementScreen',
                params: { patientName: selectedPerson.nombre }
              });
            }
          }}
          onModifyPress={handleModifyPress}
        >
          <View >
            <PersonDetails person={selectedPerson} userType={userType} />
          </View>
        </CustomModal>

        {/* MODAL PARA EDITAR DATOS */}
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

        {/* MODAL DE CONFIRMACIÓN */}
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
    marginTop: 60,
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
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