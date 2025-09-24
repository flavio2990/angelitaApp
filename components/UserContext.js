
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { app } from '../env/firebase';
import { database } from '../env/firebase';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Objeto custom para la app
  const [firebaseUser, setFirebaseUser] = useState(null); // Usuario real de Firebase
  const [loading, setLoading] = useState(true);
  const [globalUserRole, setGlobalUserRole] = useState(null); // Rol global de la app
  const [shouldLoadPersistedRole, setShouldLoadPersistedRole] = useState(true); // Controla si se debe cargar rol persistido
  const auth = getAuth(app);

  useEffect(() => {
    const initializeApp = async () => {
      // Cargar rol persistido SOLO si no se ha hecho logout
      if (shouldLoadPersistedRole) {
        await loadPersistedRole();
      }
      
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setFirebaseUser(fbUser); // Guarda el usuario real
        if (fbUser) {
          const newUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            emailVerified: fbUser.emailVerified,
            role: 'admin', // Puedes obtenerlo de la DB si lo necesitas
          };
          setUser(newUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    };
    
    initializeApp();
  }, []);

  // Registro de usuario
  const register = async (email, password, role = 'admin') => {
    try {
      // Validar email antes de intentar crear usuario
      if (!email || !email.includes('@')) {
        throw new Error('Email invÃ¡lido');
      }
      
      // Validar contraseÃ±a
      if (!password || password.length < 6) {
        throw new Error('La contraseÃ±a debe tener al menos 6 caracteres');
      }
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Verificar que la base de datos estÃ© disponible
      if (!database) {
        throw new Error('Base de datos no disponible');
      }

      // Crear estructura base del usuario
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString(),
        // Agregar campos adicionales segÃºn el rol
        ...(role === 'admin' && {
          adminSettings: {
            nombreHospital: 'Hogar de Ancianos',
            version: '1.0.0',
            fechaCreacion: new Date().toISOString()
          },
          permissions: ['create', 'read', 'update', 'delete'],
          // El admin principal contiene todo el sistema
          empleados: {},
          pacientes: {},
          areas: {
            UTI: {
              nombre: 'Unidad de Terapia Intensiva',
              personas: {}
            },
            UCG: {
              nombre: 'Unidad de Cuidados Generales',
              personas: {}
            }
          }
        }),
        ...(role === 'empleado' && {
          employeeInfo: {
            nombre: '',
            apellido: '',
            dni: '',
            telefono: '',
            especialidad: ''
          },
          permissions: ['read', 'update'],
          areaAsignada: '',
          turno: '',
          adminAsignado: '' // ID del admin que lo gestiona
        })
      };
      
              // Guardar en la estructura principal segÃºn el rol
        let userRef;
        if (role === 'admin') {
          // El admin principal se guarda en la raÃ­z de admins
          userRef = ref(database, `admins/${firebaseUser.uid}`);
        } else if (role === 'empleado') {
          // Los empleados se guardan dentro del admin principal
          // Por ahora los guardamos en empleados, pero podrÃ­an estar dentro de un admin especÃ­fico
          userRef = ref(database, `empleados/${firebaseUser.uid}`);
        }
      
      try {
        await set(userRef, userData);
      } catch (dbError) {
        throw new Error(`Error al guardar en base de datos: ${dbError.message}`);
      }

      await sendEmailVerification(firebaseUser);
      
      // Solo mostrar alerta de Ã©xito si todo saliÃ³ bien
      Alert.alert('Usuario creado exitosamente', 'Te enviamos un email de verificaciÃ³n.');
      
    } catch (e) {
      console.error('Error completo en registro:', e);
      console.error('Mensaje de error:', e.message);
      console.error('CÃ³digo de error:', e.code);
      
      // Mostrar alerta de error especÃ­fica
      let errorMessage = 'Error al crear usuario';
      
      if (e.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email no es vÃ¡lido';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'La contraseÃ±a es muy dÃ©bil';
      } else if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya estÃ¡ registrado';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Error en el registro', errorMessage);
      throw e; // Re-lanzar el error para que se maneje en el componente
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      console.log('Intentando login con:', email);
      
      // Verificar que se proporcionen credenciales
      if (!email || !password) {
        throw new Error('Debe ingresar email y contraseÃ±a');
      }
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('Usuario autenticado:', user.uid);
      
      // Verificar que el email estÃ© verificado
      if (!user.emailVerified) {
        Alert.alert('Verifica tu correo', 'Debes verificar tu email antes de continuar.');
        await signOut(auth);
        return false; // No permitir acceso
      }
      
      // Si el email estÃ¡ verificado, permitir acceso
      return true; // Permitir acceso
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
      return false; // No permitir acceso
    }
  };

  // ===== LOGOUT COMPLETO =====
  // Este logout garantiza que:
  // 1. No quedan roles cacheados en el contexto
  // 2. Se limpia AsyncStorage COMPLETAMENTE (todos los datos del usuario)
  // 3. Se resetea el AuthContext completamente
  // 4. Se muestra el modal de selecciÃ³n solo cuando corresponde
  // 5. Se evita que un usuario use data de otro por error
  // 6. Limpia datos de personas, configuraciones y cualquier otro dato local
  const logout = async () => {
    try {
      // 1. Deshabilitar carga automÃ¡tica de rol persistido
      setShouldLoadPersistedRole(false);
      
      // 2. SignOut de Firebase
      await signOut(auth);
      
      // 3. Limpiar estado local del contexto INMEDIATAMENTE
      setUser(null);
      setFirebaseUser(null);
      setGlobalUserRole(null);
      setLoading(false);
      
      // 4. Limpiar TODO AsyncStorage - TODOS los datos del usuario
      await AsyncStorage.clear();
      
    } catch (error) {
      // AÃºn asÃ­, intentar limpiar el estado local
      setUser(null);
      setFirebaseUser(null);
      setGlobalUserRole(null);
      setLoading(false);
      setShouldLoadPersistedRole(false);
    }
  };

  // Limpiar solo la sesiÃ³n sin tocar el rol (para verificaciÃ³n de email)
  const clearSessionOnly = async () => {
    await signOut(auth);
    // NO limpiar globalUserRole aquÃ­
  };



  // Establecer rol global
  const setUserRole = async (role) => {
    // Validar que el rol no sea null o undefined
    if (!role) {
      return;
    }
    
    // Re-habilitar carga automÃ¡tica de rol persistido
    setShouldLoadPersistedRole(true);
    
    // Persistir en estado local
    setGlobalUserRole(role);
    
    // Persistir en AsyncStorage para mantener el rol entre sesiones
    try {
      await AsyncStorage.setItem('globalUserRole', role);
    } catch (error) {
      // Error silencioso
    }
  };

  // Recuperar rol desde AsyncStorage al iniciar la app
  const loadPersistedRole = async () => {
    try {
      const persistedRole = await AsyncStorage.getItem('globalUserRole');
      
      if (persistedRole) {
        setGlobalUserRole(persistedRole);
        return persistedRole;
      }
    } catch (error) {
      // Error silencioso
    }
    return null;
  };

  // Obtener rol global
  const getUserRole = () => {
    return globalUserRole;
  };

  // Limpiar rol global de manera segura
  const clearUserRole = async () => {
    try {
      // Limpiar estado local
      setGlobalUserRole(null);
      
      // Remover de AsyncStorage
      await AsyncStorage.removeItem('globalUserRole');
      
      // Deshabilitar carga automÃ¡tica
      setShouldLoadPersistedRole(false);
      
    } catch (error) {
      // Error silencioso
    }
  };



  // Reenviar verificaciÃ³n
  const resendVerification = async () => {
    try {
      if (!firebaseUser) {
        throw new Error('No hay usuario autenticado. Debes estar logueado para reenviar la verificaciÃ³n.');
      }
      
      if (firebaseUser.emailVerified) {
        throw new Error('Tu email ya estÃ¡ verificado. No es necesario reenviar la verificaciÃ³n.');
      }
      
      await sendEmailVerification(firebaseUser);
      return true;
    } catch (e) {
      let errorMessage = 'Error al reenviar el email de verificaciÃ³n';
      
      if (e.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
      } else if (e.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado. Debes estar logueado.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        // Recargar el usuario de Firebase para obtener el estado mÃ¡s reciente
        await firebaseUser.reload();
        
        // Intentar obtener el rol desde la base de datos
        let userRole = 'admin'; // default
        try {
          // Primero buscar en admins
          const adminRef = ref(database, `admins/${firebaseUser.uid}`);
          const adminSnapshot = await get(adminRef);
          if (adminSnapshot.exists()) {
            userRole = adminSnapshot.val().role || 'admin';
          } else {
            // Si no estÃ¡ en admins, buscar en empleados
            const employeeRef = ref(database, `empleados/${firebaseUser.uid}`);
            const employeeSnapshot = await get(employeeRef);
            if (employeeSnapshot.exists()) {
              userRole = employeeSnapshot.val().role || 'empleado';
            }
          }
        } catch (dbError) {
          // Error silencioso, usar rol por defecto
        }
        
        // Actualizar el estado del usuario con la informaciÃ³n mÃ¡s reciente
        const updatedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: userRole,
        };
        
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      // Fallback al rol por defecto
      if (firebaseUser) {
        const fallbackUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: 'admin',
        };
        setUser(fallbackUser);
        return fallbackUser;
      }
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Correo enviado',
        'Se ha enviado un enlace de recuperaciÃ³n a tu correo electrÃ³nico. Revisa tu bandeja de entrada y sigue las instrucciones.',
        [{ text: 'OK' }]
      );
      return true;
    } catch (error) {
      let errorMessage = 'Error al enviar el correo de recuperaciÃ³n.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrÃ³nico.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrÃ³nico no es vÃ¡lido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta nuevamente en unos minutos.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      firebaseUser,
      register,
      login,
      logout,
      clearSessionOnly,
      resendVerification,
      refreshUser,
      sendPasswordResetEmail: handlePasswordReset,
      globalUserRole,
      setUserRole,
      clearUserRole,
      getUserRole,
      loadPersistedRole,
      shouldLoadPersistedRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};