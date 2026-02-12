import { ref, get } from 'firebase/database';
import { database } from '../env/firebase';

/**
 * Determina el rol de un usuario basándose en su UID
 * @param {string} uid - User ID
 * @returns {Promise<'admin' | 'employee' | null>}
 */
export const getUserRole = async (uid) => {
  if (!uid) return null;
  
  try {
    // Verificar si es admin
    const adminRef = ref(database, `admins/${uid}`);
    const adminSnapshot = await get(adminRef);
    if (adminSnapshot.exists()) {
      return 'admin';
    }
    
    // Verificar si es empleado
    const empleadoRef = ref(database, `empleados/${uid}`);
    const empleadoSnapshot = await get(empleadoRef);
    if (empleadoSnapshot.exists()) {
      return 'employee';
    }
    
    return null;
  } catch (error) {
    console.error('Error determining user role:', error);
    return null;
  }
};

/**
 * Normaliza createdBy a formato estándar { uid, role }
 * Maneja tanto formato antiguo (string) como nuevo (objeto)
 * @param {string | object} createdBy - createdBy del registro
 * @returns {Promise<{uid: string, role: 'admin' | 'employee' | null}>}
 */
export const normalizeCreatedBy = async (createdBy) => {
  if (!createdBy) {
    return { uid: null, role: null };
  }
  
  // Si ya es objeto con role
  if (typeof createdBy === 'object' && createdBy.role) {
    return {
      uid: createdBy.uid || createdBy,
      role: createdBy.role,
    };
  }
  
  // Si es string (formato antiguo), determinar rol
  const uid = typeof createdBy === 'string' ? createdBy : createdBy.uid;
  const role = await getUserRole(uid);
  
  return { uid, role };
};

/**
 * Filtra registros de medicación por rol de autor
 * @param {Array} records - Array de registros de medicación
 * @param {'admin' | 'employee'} filterRole - Rol a filtrar
 * @returns {Promise<Array>} Registros filtrados
 */
export const filterMedicationByRole = async (records, filterRole) => {
  if (!records || records.length === 0) return [];
  if (!filterRole) return records;
  
  const filteredRecords = [];
  
  for (const record of records) {
    const normalized = await normalizeCreatedBy(record.createdBy);
    if (normalized.role === filterRole) {
      filteredRecords.push({
        ...record,
        createdBy: normalized.uid, // Mantener compatibilidad con formato actual
        createdByRole: normalized.role, // Agregar rol para referencia
      });
    }
  }
  
  return filteredRecords;
};

/**
 * Filtra un objeto de historial por fecha (historyByDate) por rol
 * @param {Object} historyByDate - Objeto con fechas como keys
 * @param {'admin' | 'employee'} filterRole - Rol a filtrar
 * @returns {Promise<Object>} Historial filtrado
 */
export const filterHistoryByRole = async (historyByDate, filterRole) => {
  if (!historyByDate || Object.keys(historyByDate).length === 0) return {};
  if (!filterRole) return historyByDate;
  
  const filteredHistory = {};
  
  for (const [dateKey, record] of Object.entries(historyByDate)) {
    const normalized = await normalizeCreatedBy(record.createdBy);
    if (normalized.role === filterRole) {
      filteredHistory[dateKey] = {
        ...record,
        createdBy: normalized.uid,
        createdByRole: normalized.role,
      };
    }
  }
  
  return filteredHistory;
};
