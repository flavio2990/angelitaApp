import { ref, push, get } from 'firebase/database';
import { database, auth } from '../../../env/firebase';

/**
 * Creates a new planilla record in Firebase Realtime Database.
 * All planilla writes must go through this helper to ensure consistent structure.
 * 
 * @param {string} authUid - The authenticated user's UID (who is creating the record)
 * @param {string} ownerUid - The admin owner's UID (owner of the planilla)
 * @param {string} area - The area identifier (e.g., 'UTI', 'UCG')
 * @param {string} personId - The subject/person ID
 * @param {string} type - The planilla type: 'medicacion' or 'signosVitales'
 * @param {object} payload - The clinical data to store (without metadata)
 * @returns {Promise<string>} The Firebase key of the created record
 * @throws {Error} If type is not supported or required parameters are missing
 */
export const createPlanillaRecord = async (authUid, ownerUid, area, personId, type, payload) => {
  const firebasePath = `admins/${ownerUid}/areas/${area}/subjects/${personId}/planillas/${type}`;
  
  console.log({
    location: 'createPlanillaRecord - START',
    receivedPath: firebasePath,
    authUid,
    ownerUid,
    area,
    personId,
    type,
    payloadKeys: Object.keys(payload || {}),
  });

  if (!authUid || !ownerUid || !area || !personId || !type || !payload) {
    console.log({
      location: 'createPlanillaRecord - VALIDATION ERROR',
      error: 'Missing required parameters',
      authUid: !!authUid,
      ownerUid: !!ownerUid,
      area: !!area,
      personId: !!personId,
      type: !!type,
      payload: !!payload,
    });
    throw new Error('createPlanillaRecord: All parameters are required');
  }

  if (type !== 'medicacion' && type !== 'signosVitales') {
    console.log({
      location: 'createPlanillaRecord - VALIDATION ERROR',
      error: 'Unsupported planilla type',
      type,
    });
    throw new Error(`createPlanillaRecord: Unsupported planilla type: ${type}`);
  }

  const planillaRef = ref(database, firebasePath);

  const record = {
    createdAt: new Date().toISOString(),
    createdBy: authUid,
  };

  if (type === 'medicacion') {
    const droga = payload.droga || '';
    const hora = payload.hora || '';
    const dosis = payload.dosis || '1';
    const medIndex = Number.isFinite(payload.index) ? payload.index : 0;
    const medicationId = `med-${medIndex}-${droga}-${dosis}`;

    record.medications = {
      [medicationId]: {
        droga,
        hora,
        dosis,
      },
    };
  } else if (type === 'signosVitales') {
    record.taSystolic = payload.taSystolic || '';
    record.taDiastolic = payload.taDiastolic || '';
    record.heartRate = payload.heartRate || '';
    record.respiratoryRate = payload.respiratoryRate || '';
    record.spo2 = payload.spo2 || '';
    record.temperature = payload.temperature || '';
    record.personId = personId;
  }

  const currentUser = auth.currentUser;
  const authUidFromAuth = currentUser?.uid || null;

  let isAdmin = false;
  let isEmpleado = false;
  
  if (authUidFromAuth) {
    try {
      const adminRef = ref(database, `admins/${authUidFromAuth}`);
      const adminSnapshot = await get(adminRef);
      isAdmin = adminSnapshot.exists();
    } catch (error) {
      console.log({
        location: 'createPlanillaRecord - ERROR CHECKING ADMIN',
        error: error.message,
      });
    }

    try {
      const empleadoRef = ref(database, `empleados/${authUidFromAuth}`);
      const empleadoSnapshot = await get(empleadoRef);
      isEmpleado = empleadoSnapshot.exists();
    } catch (error) {
      console.log({
        location: 'createPlanillaRecord - ERROR CHECKING EMPLEADO',
        error: error.message,
      });
    }
  }

  console.log({
    location: 'createPlanillaRecord - AUTH DIAGNOSTICS',
    authCurrentUserUid: authUidFromAuth,
    authUidParam: authUid,
    ownerUid,
    area,
    personId,
    assumedAdmin: ownerUid,
    isAdmin,
    isEmpleado,
  });

  console.log({
    location: 'createPlanillaRecord - BEFORE PUSH',
    authCurrentUserUid: authUidFromAuth,
    writePath: firebasePath,
    operation: 'push()',
    dataToSave: record,
  });

  try {
    const snapshot = await push(planillaRef, record);
    console.log({
      location: 'createPlanillaRecord - SUCCESS',
      firebasePath,
      recordKey: snapshot.key,
    });
    return snapshot.key;
  } catch (error) {
      console.log({
      location: 'createPlanillaRecord - FIREBASE ERROR',
      firebasePath,
      error: error.message,
      errorCode: error.code,
      errorStack: error.stack,
    });
    throw error;
  }
};
