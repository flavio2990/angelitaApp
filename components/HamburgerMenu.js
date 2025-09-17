import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuth } from './UserContext';
import { ROLE_TEXTS, AUTH_TEXTS, NAVIGATION_TEXTS } from '../constants/Strings';

export default function HamburgerMenu({ 
  position = 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  style,
  showInModal = true, // Controla si se muestra en modales
  onLogout, // Función personalizada de logout que limpia datos locales
  onGoHome, // Función para volver a la vista principal (selección de área)
  hasTopBar = false, // Indica si hay un TopBarHeader presente
  showGoHomeOption = true // Controla si se muestra la opción "Volver a inicio"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { globalUserRole, logout } = useAuth();

  // Si no hay rol definido o no se debe mostrar en modal, no mostrar nada
  if (!globalUserRole || !showInModal) {
    return null;
  }

  // Función para obtener la información del rol
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          icon: ROLE_TEXTS.adminIcon,
          text: ROLE_TEXTS.admin,
          color: '#5124A5',
          bgColor: '#E8E4F7',
          borderColor: '#8B5CF6'
        };
      case 'empleado':
        return {
          icon: ROLE_TEXTS.employeeIcon,
          text: ROLE_TEXTS.employee,
          color: '#007AFF',
          bgColor: '#E3F2FD',
          borderColor: '#3B82F6'
        };
      default:
        return {
          icon: ROLE_TEXTS.employeeIcon,
          text: role.toUpperCase(),
          color: '#666',
          bgColor: '#F5F5F5',
          borderColor: '#9CA3AF'
        };
    }
  };

  const roleInfo = getRoleInfo(globalUserRole);

  // Función para obtener la posición del menú
  const getPositionStyle = () => {
    // Ajustar posición basándose en si hay TopBarHeader o no
    const topPosition = hasTopBar ? 30 : 30; // Más arriba cuando no hay TopBarHeader
    
    switch (position) {
      case 'top-left':
        return { top: topPosition, left: 20 };
      case 'bottom-right':
        return { bottom: 20, right: 20 };
      case 'bottom-left':
        return { bottom: 20, left: 20 };
      case 'top-right':
      default:
        return { top: topPosition, right: 10 };
    }
  };

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Usar función personalizada de logout si está disponible, sino usar la del contexto
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
    setIsOpen(false);
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay invisible para cerrar el menú al hacer clic fuera */}
      {isOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}
      
      <View style={[styles.container, getPositionStyle(), style]}>
        {/* Botón del menú hamburguesa */}
        <TouchableOpacity 
          style={[styles.hamburgerButton, { backgroundColor: roleInfo.bgColor }]} 
          onPress={handleToggleMenu}
          activeOpacity={0.8}
        >
          <View style={styles.hamburgerIcon}>
            <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
          </View>
        </TouchableOpacity>

        {/* Menú desplegable */}
        {isOpen && (
          <View style={[styles.menuContainer, { backgroundColor: roleInfo.bgColor, borderColor: roleInfo.borderColor }]}>
            {/* Header del menú con información del rol */}
            <View style={styles.menuHeader}>
              <Text style={[styles.roleIcon, { color: roleInfo.color }]}>
                {roleInfo.icon}
              </Text>
              <Text style={[styles.roleText, { color: roleInfo.color }]}>
                {roleInfo.text}
              </Text>
            </View>

            {/* Separador antes de las opciones */}
            <View style={[styles.separator, { backgroundColor: roleInfo.borderColor }]} />

            {/* Botón para volver a inicio */}
            {onGoHome && showGoHomeOption && (
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleGoHome}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuItemText, { color: roleInfo.color }]}>
                  {NAVIGATION_TEXTS.goHome}
                </Text>
              </TouchableOpacity>
            )}

            {/* Botón de logout - Limpia TODO */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: '#DC3545' }]}>
                {AUTH_TEXTS.logoutButton}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  container: {
    position: 'absolute',
    zIndex: 9999,
  },
  
  // Botón del menú hamburguesa
  hamburgerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  
  hamburgerIcon: {
    justifyContent: 'space-between',
    height: 18,
    width: 20,
  },
  
  hamburgerLine: {
    height: 3,
    width: '100%',
    borderRadius: 2,
  },
  
  // Menú desplegable
  menuContainer: {
    position: 'absolute',
    top: 60, // Debajo del botón hamburguesa
    right: 0,
    width: 200,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  roleIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  
  roleText: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  
  separator: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
