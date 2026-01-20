// ===== TÍTULOS DE TARJETAS =====
export const CARD_TITLES = {
  selectArea: "Seleccione Área",
  selectTipe: "Seleccionar de ",
};

// ===== OPCIONES DE ÁREAS =====
export const AREA_OPTIONS = [
  { label: "U T I", icon: "hospital", value: "UTI" },
  { label: "U C G", icon: "stethoscope", value: "UCG" },
];

// ===== OPCIONES DE TIPOS =====
export const TIPE_OPTIONS = [
  { label: "Empleados", icon: "account", value: "Enfermería" },
  { label: "Pacientes", icon: "account-group", value: "Paciente" },
];

// ===== TÍTULOS DE TOP BAR =====
export const TOP_BAR_HEADER_TITLES = {
  topBarTitleChoice: "Empleados/ Pacientes",
  topBarTitlePatient: "Seleccione Paciente:",
  topBarTitleEmploy: "Seleccione Empleado:",
  topBarModalTitlePatient: "Datos del Paciente",
  topBarModalTitleEmploy: "Datos del Empleado",
  topBarNoData: "UPS! Aún no hay datos",
  topBarNewData: "Agregar nuevo",
};

// ===== TÍTULOS DE MODALES =====
export const MODAL_TITLES = {
  modalTitleEmployPatients: "Empleados/ Pacientes",
  modalTitlePatient: "Datos del Paciente:",
  modalTitleEmploy: "Datos del Empleado:",
  modalNoData: "Ingresalos aquí:",
};

// ===== TEXTO DE AUTENTICACIÓN =====
export const AUTH_TEXTS = {
  // Selección de rol
  selectRole: "Seleccione su rol:",
  adminRole: "SOY ADMINISTRADOR",
  employeeRole: "SOY EMPLEADO",
  changeRole: "Cambiar de rol",
  
  // Login
  loginTitle: "Iniciar Sesión",
  emailLabel: "Email",
  passwordLabel: "Contraseña",
  loginButton: "INICIAR SESIÓN",
  forgotPassword: "¿Olvidaste tu contraseña?",
  noAccount: "¿No tienes cuenta?",
  createAccount: "Crear cuenta",
  
  // Registro
  registerTitle: "Crear Usuario",
  createUserButton: "CREAR USUARIO",
  cancelButton: "Cancelar",
  selectRoleFirst: "⚠️ Primero debes seleccionar un rol",
  
  // Verificación de email
  verificationTitle: "Verificar Email",
  verificationMessage: "Por favor, revisa tu correo y haz clic en el enlace para verificar tu cuenta.",
  verificationButton: "Reenviar verificación",
  backToLogin: "Ya verifiqué mi correo",
  
  // Recuperación de contraseña
  forgotPasswordTitle: "Recuperar Contraseña",
  forgotPasswordMessage: "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.",
  sendResetButton: "Enviar enlace",
  
  // Logout
  logoutButton: "🚪 Cerrar Sesión",
};

// ===== TEXTO DE FORMULARIOS =====
export const FORM_TEXTS = {
  // Campos de persona
  nameLabel: "Nombres y Apellidos",
  ageLabel: "Edad",
  dniLabel: "DNI",
  typeLabel: "Tipo",
  areaLabel: "Área",
  
  // Botones de formulario
  saveButton: "Guardar",
  editButton: "Modificar",
  deleteButton: "Eliminar",
  addNewButton: "Agregar nuevo",
  confirmationModal: "¿Guardar todo?",
  
  // Validaciones
  requiredField: "Este campo es requerido",
  invalidEmail: "Email inválido",
  passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
  
  // Campos adicionales de persona
  birthLabel: "Nacimiento",
  admissionLabel: "Ingresó",
  socialCoverageLabel: "Obra Social",
  nationalityLabel: "Nacionalidad",
  maritalStatusLabel: "Estado Civil",
  weightLabel: "Peso",
};

// ===== TEXTO DE ROLES =====
export const ROLE_TEXTS = {
  admin: "ADMINISTRADOR",
  employee: "EMPLEADO",
  adminIcon: "👨‍💼",
  employeeIcon: "👷",
};

// ===== TEXTO DE ÁREAS =====
export const AREA_TEXTS = {
  uti: "Unidad de Terapia Intensiva",
  ucg: "Unidad de Cuidados Generales",
};

// ===== TEXTO DE TIPOS DE PERSONA =====
export const PERSON_TYPE_TEXTS = {
  patient: "Paciente",
  nursing: "Enfermería",
  administrator: "Administrador",
};

// ===== MENSAJES DE ESTADO =====
export const STATUS_MESSAGES = {
  loading: "Cargando...",
  noData: "No hay datos disponibles",
  error: "Ha ocurrido un error",
  success: "Operación exitosa",
  saving: "Guardando...",
  deleting: "Eliminando...",
};

// ===== TEXTO DE NAVEGACIÓN =====
export const NAVIGATION_TEXTS = {
  back: "Atrás",
  next: "Siguiente",
  done: "Finalizar",
  close: "Cerrar",
  goHome: "🏠 Volver a inicio",
};

// ===== TEXTO DE VALIDACIÓN =====
export const VALIDATION_TEXTS = {
  requiredFields: "Campos obligatorios",
  fillAllFields: "Debes completar todos los campos antes de guardar",
  missingFields: "Campos faltantes:",
  ok: "OK",
  // Validación de recuperar contraseña
  invalidEmail: "Email inválido",
  enterValidEmail: "Por favor ingresa un email válido",
  emailRequired: "El email es obligatorio",
  // Validaciones generales
  enterValidEmailText: "Ingrese un mail válido",
  cancelText: "Cancelar",
  yesText: "Sí",
  noText: "No",
};

// ===== TEXTO DE SIGNOS VITALES =====
export const VITALS_TEXTS = {
  formTitle: "Ingresar Aquí:",
  headerColumns: "Ingresar Aquí:",
  patientLabelPrefix: "_Paciente:",
  viewHistoryButton: "Ver Histórico",
  cancelHistoryButton: "Cancelar",
  fields: {
    taSystolic: "TA (Sist.)",
    taDiastolic: "TA (Diast.)",
    heartRate: "FC (lpm)",
    respiratoryRate: "FR/min",
    spo2: "SpO₂ %",
    temperature: "T°C",
  },
};

// ===== TEXTO DE MEDICACIÓN =====
export const MEDICATION_TEXTS = {
  patientLabelPrefix: "_Paciente:",
  addLineItem: "Añadir Otra Línea",
  addMore: "Agregar más:",
  columns: {
    droga: "Droga",
    hora: "Hora",
    dosis: "Dosis",
  },
  placeholders: {
    droga: "Ingrésar Aquí:",
    dosis: "1",
  },
};