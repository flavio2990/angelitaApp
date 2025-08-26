
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
  const auth = getAuth(app);

  useEffect(() => {
    const initializeApp = async () => {
      // Cargar rol persistido al iniciar la app
      await loadPersistedRole();
      
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        console.log('onAuthStateChanged triggered:', fbUser ? `User: ${fbUser.email}, Verified: ${fbUser.emailVerified}` : 'No user');
        setFirebaseUser(fbUser); // Guarda el usuario real
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            emailVerified: fbUser.emailVerified,
            role: 'admin', // Puedes obtenerlo de la DB si lo necesitas
          });
          console.log('Usuario establecido en estado:', {
            uid: fbUser.uid,
            email: fbUser.email,
            emailVerified: fbUser.emailVerified,
            role: 'admin'
          });
        } else {
          setUser(null);
          console.log('Usuario removido del estado');
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
      console.log('Iniciando registro de usuario:', email, 'con rol:', role);
      console.log('Database config:', database);
      
      // Validar email antes de intentar crear usuario
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }
      
      // Validar contraseña
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuario creado en Firebase Auth:', firebaseUser.uid);

      // Verificar que la base de datos esté disponible
      if (!database) {
        throw new Error('Base de datos no disponible');
      }

      // Persistir datos del usuario en la base de datos según el rol
      console.log('Intentando guardar en Realtime Database...');
      
      // Crear estructura base del usuario
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString(),
        // Agregar campos adicionales según el rol
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
              empleados: {},
              pacientes: {}
            },
            UCG: {
              nombre: 'Unidad de Cuidados Generales',
              empleados: {},
              pacientes: {}
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
      
      // Guardar en la estructura principal según el rol
      let userRef;
      if (role === 'admin') {
        // El admin principal se guarda en la raíz de admins
        userRef = ref(database, `admins/${firebaseUser.uid}`);
      } else if (role === 'empleado') {
        // Los empleados se guardan dentro del admin principal
        // Por ahora los guardamos en empleados, pero podrían estar dentro de un admin específico
        userRef = ref(database, `empleados/${firebaseUser.uid}`);
      }
      
      console.log('Referencia de la base de datos:', userRef.toString());
      console.log('Datos a guardar:', userData);
      
      try {
        await set(userRef, userData);
        console.log(`Usuario guardado exitosamente en Realtime Database como ${role}`);
      } catch (dbError) {
        console.error('Error específico de la base de datos:', dbError);
        console.error('Código de error DB:', dbError.code);
        console.error('Mensaje de error DB:', dbError.message);
        throw new Error(`Error al guardar en base de datos: ${dbError.message}`);
      }

      await sendEmailVerification(firebaseUser);
      console.log('Email de verificación enviado');
      
      // Solo mostrar alerta de éxito si todo salió bien
      Alert.alert('Usuario creado exitosamente', 'Te enviamos un email de verificación.');
      
    } catch (e) {
      console.error('Error completo en registro:', e);
      console.error('Mensaje de error:', e.message);
      console.error('Código de error:', e.code);
      
      // Mostrar alerta de error específica
      let errorMessage = 'Error al crear usuario';
      
      if (e.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email no es válido';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      } else if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
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
        throw new Error('Debe ingresar email y contraseña');
      }
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('Usuario autenticado:', user.uid);
      
      // Verificar que el email esté verificado
      if (!user.emailVerified) {
        console.log('Email no verificado, cerrando sesión');
        Alert.alert('Verifica tu correo', 'Debes verificar tu email antes de continuar.');
        await signOut(auth);
        return false; // No permitir acceso
      }
      
      console.log('Login exitoso, email verificado');
      // Si el email está verificado, permitir acceso
      return true; // Permitir acceso
    } catch (e) {
      console.error('Error en login:', e);
      Alert.alert('Error', e.message || String(e));
      return false; // No permitir acceso
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setGlobalUserRole(null); // Limpiar rol global al hacer logout
    
    // Limpiar rol persistido en AsyncStorage
    try {
      await AsyncStorage.removeItem('globalUserRole');
      console.log('Rol removido de AsyncStorage');
    } catch (error) {
      console.error('Error removiendo rol de AsyncStorage:', error);
    }
  };

  // Limpiar solo la sesión sin tocar el rol (para verificación de email)
  const clearSessionOnly = async () => {
    await signOut(auth);
    // NO limpiar globalUserRole aquí
  };

  // Establecer rol global
  const setUserRole = async (role) => {
    console.log('=== setUserRole llamado ===');
    console.log('Rol anterior:', globalUserRole);
    console.log('Nuevo rol:', role);
    
    // Persistir en estado local
    setGlobalUserRole(role);
    
    // Persistir en AsyncStorage para mantener el rol entre sesiones
    try {
      await AsyncStorage.setItem('globalUserRole', role);
      console.log('Rol persistido en AsyncStorage:', role);
    } catch (error) {
      console.error('Error persistiendo rol en AsyncStorage:', error);
    }
    
    console.log('globalUserRole actualizado a:', role);
  };

  // Recuperar rol desde AsyncStorage al iniciar la app
  const loadPersistedRole = async () => {
    try {
      const persistedRole = await AsyncStorage.getItem('globalUserRole');
      if (persistedRole) {
        console.log('Rol recuperado desde AsyncStorage:', persistedRole);
        setGlobalUserRole(persistedRole);
        return persistedRole;
      }
    } catch (error) {
      console.error('Error recuperando rol desde AsyncStorage:', error);
    }
    return null;
  };

  // Obtener rol global
  const getUserRole = () => {
    return globalUserRole;
  };

  // Reenviar verificación
  const resendVerification = async () => {
    try {
      console.log('=== INICIO resendVerification ===');
      console.log('firebaseUser:', firebaseUser);
      console.log('firebaseUser?.email:', firebaseUser?.email);
      console.log('firebaseUser?.emailVerified:', firebaseUser?.emailVerified);
      console.log('auth.currentUser:', auth.currentUser);
      
      if (!firebaseUser) {
        console.log('ERROR: No hay firebaseUser');
        throw new Error('No hay usuario autenticado. Debes estar logueado para reenviar la verificación.');
      }
      
      if (firebaseUser.emailVerified) {
        console.log('ERROR: Email ya verificado');
        throw new Error('Tu email ya está verificado. No es necesario reenviar la verificación.');
      }
      
      console.log('Intentando enviar verificación a:', firebaseUser.email);
      await sendEmailVerification(firebaseUser);
      console.log('Email de verificación reenviado exitosamente');
      console.log('=== FIN resendVerification (éxito) ===');
      return true;
    } catch (e) {
      console.error('=== ERROR en resendVerification ===');
      console.error('Error completo:', e);
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      
      let errorMessage = 'Error al reenviar el email de verificación';
      
      if (e.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
      } else if (e.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado. Debes estar logueado.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      console.error('Error message final:', errorMessage);
      console.log('=== FIN resendVerification (error) ===');
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        // Recargar el usuario de Firebase para obtener el estado más reciente
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
            // Si no está en admins, buscar en empleados
            const employeeRef = ref(database, `empleados/${firebaseUser.uid}`);
            const employeeSnapshot = await get(employeeRef);
            if (employeeSnapshot.exists()) {
              userRole = employeeSnapshot.val().role || 'empleado';
            }
          }
        } catch (dbError) {
          console.log('No se pudo obtener el rol desde la DB, usando default:', dbError.message);
        }
        
        // Actualizar el estado del usuario con la información más reciente
        const updatedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: userRole,
        };
        
        setUser(updatedUser);
        console.log('Usuario actualizado:', updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('Error al obtener rol del usuario:', error);
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
        'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y sigue las instrucciones.',
        [{ text: 'OK' }]
      );
      return true;
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      let errorMessage = 'Error al enviar el correo de recuperación.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido.';
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
      getUserRole,
      loadPersistedRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};