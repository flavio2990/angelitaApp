// ===== TÃTULOS DE TARJETAS =====
export const CARD_TITLES = {
  selectArea: "Seleccione Ãrea",
  selectTipe: "Seleccione: ",
};

// ===== OPCIONES DE ÃREAS =====
export const AREA_OPTIONS = [
  { label: "U T I", icon: "hospital", value: "UTI" },
  { label: "U C G", icon: "stethoscope", value: "UCG" },
];

// ===== OPCIONES DE TIPOS =====
export const TIPE_OPTIONS = [
  { label: "Empleados", icon: "account", value: "EnfermerÃ­a" },
  { label: "Pacientes", icon: "account-group", value: "Paciente" },
];

// ===== TÃTULOS DE TOP BAR =====
export const TOP_BAR_HEADER_TITLES = {
  topBarTitleChoice: "Empleados/ Pacientes",
  topBarTitlePatient: "Seleccione Paciente:",
  topBarTitleEmploy: "Seleccione Empleado:",
  topBarModalTitlePatient: "Datos del Paciente",
  topBarModalTitleEmploy: "Datos del Empleado",
  topBarNoData: "UPS! AÃºn no hay datos",
  topBarNewData: "Agregar nuevo",
};

// ===== TÃTULOS DE MODALES =====
export const MODAL_TITLES = {
  modalTitleEmployPatients: "Empleados/ Pacientes",
  modalTitlePatient: "Datos del Paciente:",
  modalTitleEmploy: "Datos del Empleado:",
  modalNoData: "Ingresalos aquÃ­:",
};

// ===== TEXTO DE AUTENTICACIÃ“N =====
export const AUTH_TEXTS = {
  // SelecciÃ³n de rol
  selectRole: "Seleccione su rol:",
  adminRole: "SOY ADMINISTRADOR",
  employeeRole: "SOY EMPLEADO",
  changeRole: "Cambiar de rol",
  
  // Login
  loginTitle: "Iniciar SesiÃ³n",
  emailLabel: "Email",
  passwordLabel: "ContraseÃ±a",
  loginButton: "INICIAR SESIÃ“N",
  forgotPassword: "Â¿Olvidaste tu contraseÃ±a?",
  noAccount: "Â¿No tienes cuenta?",
  createAccount: "Crear cuenta",
  
  // Registro
  registerTitle: "Crear Usuario",
  createUserButton: "CREAR USUARIO",
  cancelButton: "Cancelar",
  selectRoleFirst: "âš ï¸ Primero debes seleccionar un rol",
  
  // VerificaciÃ³n de email
  verificationTitle: "Verificar Email",
  verificationMessage: "Por favor, revisa tu correo y haz clic en el enlace para verificar tu cuenta.",
  verificationButton: "Reenviar verificaciÃ³n",
  backToLogin: "Ya verifiquÃ© mi correo",
  
  // RecuperaciÃ³n de contraseÃ±a
  forgotPasswordTitle: "Recuperar ContraseÃ±a",
  forgotPasswordMessage: "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseÃ±a.",
  sendResetButton: "Enviar enlace",
  
  // Logout
  logoutButton: "ðŸšª Cerrar SesiÃ³n",
};

// ===== TEXTO DE FORMULARIOS =====
export const FORM_TEXTS = {
  // Campos de persona
  nameLabel: "Nombres y Apellidos",
  ageLabel: "Edad",
  dniLabel: "DNI",
  typeLabel: "Tipo",
  areaLabel: "Ãrea",
  
  // Botones de formulario
  saveButton: "Guardar",
  editButton: "Modificar",
  deleteButton: "Eliminar",
  addNewButton: "Agregar nuevo",
  
  // Validaciones
  requiredField: "Este campo es requerido",
  invalidEmail: "Email invÃ¡lido",
  passwordTooShort: "La contraseÃ±a debe tener al menos 6 caracteres",
  
  // Campos adicionales de persona
  birthLabel: "Nacimiento",
  admissionLabel: "IngresÃ³",
  socialCoverageLabel: "Obra Social",
  nationalityLabel: "Nacionalidad",
  maritalStatusLabel: "Estado Civil",
  weightLabel: "Peso",
};

// ===== TEXTO DE ROLES =====
export const ROLE_TEXTS = {
  admin: "ADMINISTRADOR",
  employee: "EMPLEADO",
  adminIcon: "ðŸ›¡ï¸",
  employeeIcon: "ðŸ‘¤",
};

// ===== TEXTO DE ÃREAS =====
export const AREA_TEXTS = {
  uti: "Unidad de Terapia Intensiva",
  ucg: "Unidad de Cuidados Generales",
};

// ===== TEXTO DE TIPOS DE PERSONA =====
export const PERSON_TYPE_TEXTS = {
  patient: "Paciente",
  nursing: "EnfermerÃ­a",
  administrator: "Administrador",
};

// ===== MENSAJES DE ESTADO =====
export const STATUS_MESSAGES = {
  loading: "Cargando...",
  noData: "No hay datos disponibles",
  error: "Ha ocurrido un error",
  success: "OperaciÃ³n exitosa",
  saving: "Guardando...",
  deleting: "Eliminando...",
};

// ===== TEXTO DE NAVEGACIÃ“N =====
export const NAVIGATION_TEXTS = {
  back: "AtrÃ¡s",
  next: "Siguiente",
  done: "Finalizar",
  close: "Cerrar",
  goHome: "ðŸ  Volver a inicio",
};

// ===== TEXTO DE VALIDACIÃ“N =====
export const VALIDATION_TEXTS = {
  requiredFields: "Campos obligatorios",
  fillAllFields: "Debes completar todos los campos antes de guardar",
  missingFields: "Campos faltantes:",
  ok: "OK",
  // ValidaciÃ³n de recuperar contraseÃ±a
  invalidEmail: "Email invÃ¡lido",
  enterValidEmail: "Por favor ingresa un email vÃ¡lido",
  emailRequired: "El email es obligatorio",
};
  