
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
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalUserRole, setGlobalUserRole] = useState(null);
  const [shouldLoadPersistedRole, setShouldLoadPersistedRole] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const initializeApp = async () => {
      
      if (shouldLoadPersistedRole) {
        await loadPersistedRole();
      }
      
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
       
        
        setFirebaseUser(fbUser);
        if (fbUser) {
          const newUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            emailVerified: fbUser.emailVerified,
            role: 'admin',
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

  const register = async (email, password, role = 'admin') => {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }
      
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      if (!database) {
        throw new Error('Base de datos no disponible');
      }

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString(),
        ...(role === 'admin' && {
          adminSettings: {
            nombreHospital: 'Hogar de Ancianos',
            version: '1.0.0',
            fechaCreacion: new Date().toISOString()
          },
          permissions: ['create', 'read', 'update', 'delete'],
          empleados: {},
          pacientes: {},
          areas: {
            UTI: {
              nombre: 'Unidad de Terapia Intensiva',
              subjects: {}
            },
            UCG: {
              nombre: 'Unidad de Cuidados Generales',
              subjects: {}
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
          adminAsignado: ''
        })
      };
      
        let userRef;
        if (role === 'admin') {
          userRef = ref(database, `admins/${firebaseUser.uid}`);
        } else if (role === 'empleado') {
          userRef = ref(database, `empleados/${firebaseUser.uid}`);
        }
      
      try {
        await set(userRef, userData);
      } catch (dbError) {
        throw new Error(`Error al guardar en base de datos: ${dbError.message}`);
      }

      await sendEmailVerification(firebaseUser);
      
      Alert.alert('Usuario creado exitosamente', 'Te enviamos un email de verificación.');
      
    } catch (e) {
      console.error('Error completo en registro:', e);
      console.error('Mensaje de error:', e.message);
      console.error('Código de error:', e.code);
      
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
      throw e;
    }
  };

  const login = async (email, password) => {
    try {
      
      if (!email || !password) {
        throw new Error('Debe ingresar email y contraseña');
      }
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      
      if (!user.emailVerified) {
        Alert.alert('Verifica tu correo', 'Debes verificar tu email antes de continuar.');
        await signOut(auth);
        return false;
      }
      
      return true;
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
      return false;
    }
  };
  
  const logout = async () => {
    try {
      setShouldLoadPersistedRole(false);
      
      await signOut(auth);
      
      setUser(null);
      setFirebaseUser(null);
      setGlobalUserRole(null);
      setLoading(false);
      
      await AsyncStorage.clear();
      
    } catch (error) {
      setUser(null);
      setFirebaseUser(null);
      setGlobalUserRole(null);
      setLoading(false);
      setShouldLoadPersistedRole(false);
    }
  };

  const clearSessionOnly = async () => {
    await signOut(auth);
  };



  const setUserRole = async (role) => {
    
    if (!role) {
      return;
    }
    
    setShouldLoadPersistedRole(true);
    
    setGlobalUserRole(role);
    
    try {
      await AsyncStorage.setItem('globalUserRole', role);
    } catch (error) {
    }
  };

  const loadPersistedRole = async () => {
    try {
      const persistedRole = await AsyncStorage.getItem('globalUserRole');
      
      if (persistedRole) {
        setGlobalUserRole(persistedRole);
        return persistedRole;
      }
    } catch (error) {
    }
    return null;
  };

  const getUserRole = () => {
    return globalUserRole;
  };

  const clearUserRole = async () => {
    try {
      setGlobalUserRole(null);
      
      await AsyncStorage.removeItem('globalUserRole');
      
      setShouldLoadPersistedRole(false);
      
    } catch (error) {
    }
  };



  const resendVerification = async () => {
    try {
      if (!firebaseUser) {
        throw new Error('No hay usuario autenticado. Debes estar logueado para reenviar la verificación.');
      }
      
      if (firebaseUser.emailVerified) {
        throw new Error('Tu email ya está verificado. No es necesario reenviar la verificación.');
      }
      
      await sendEmailVerification(firebaseUser);
      return true;
    } catch (e) {
      let errorMessage = 'Error al reenviar el email de verificación';
      
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
        await firebaseUser.reload();
        
        let userRole = 'admin';
        let isAdminInDB = false;
        let isEmployeeInDB = false;
        
        try {
          const adminRef = ref(database, `admins/${firebaseUser.uid}`);
          const adminSnapshot = await get(adminRef);
          isAdminInDB = adminSnapshot.exists();
          
          if (isAdminInDB) {
            const adminData = adminSnapshot.val();
            userRole = adminData.role || 'admin';
          } else {
            const employeeRef = ref(database, `empleados/${firebaseUser.uid}`);
            const employeeSnapshot = await get(employeeRef);
            isEmployeeInDB = employeeSnapshot.exists();
            
            if (isEmployeeInDB) {
              const employeeData = employeeSnapshot.val();
              userRole = employeeData.role || 'empleado';
            } else {
            }
          }
        } catch (dbError) {
        }
        
        const updatedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: userRole,
        };
        
        
        setUser(updatedUser);
        return updatedUser;
      } else {
      }
    } catch (error) {
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
      clearUserRole,
      getUserRole,
      loadPersistedRole,
      shouldLoadPersistedRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};