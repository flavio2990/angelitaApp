import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuth } from './UserContext';
import { ROLE_TEXTS, AUTH_TEXTS, NAVIGATION_TEXTS } from '../constants/Strings';

export default function HamburgerMenu({ 
  position = 'top-right',
  style,
  onLogout,   
  onGoHome,
  hasTopBar = false,
  showGoHomeOption = true,
  forceShow = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { globalUserRole, logout } = useAuth();

  if (forceShow) {
  } else if (!globalUserRole) {
    return null;
  }

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
          text: role ? role.toUpperCase() : 'USUARIO',
          color: '#666',
          bgColor: '#F5F5F5',
          borderColor: '#9CA3AF'
        };
    }
  };

  const roleInfo = getRoleInfo(globalUserRole);

  const getPositionStyle = () => {
    const topPosition = hasTopBar ? 30 : 30;
    
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onLogout) {
        onLogout();
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    }
    setIsOpen(false);
  };

  
  return (
    <>
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5124A5" />
            <Text style={styles.loadingText}>Cerrando sesión...</Text>
          </View>
        </View>
      )}
      
      {isOpen && !isLoggingOut && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}
      
      <View style={[styles.container, getPositionStyle(), style]}>
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={handleToggleMenu}
          activeOpacity={0.8}
        >
          <View style={styles.hamburgerIcon}>
            <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={[styles.menuContainer, { backgroundColor: roleInfo.bgColor, borderColor: roleInfo.borderColor }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.roleIcon, { color: roleInfo.color }]}>
                {roleInfo.icon}
              </Text>
              <Text style={[styles.roleText, { color: roleInfo.color }]}>
                {roleInfo.text}
              </Text>
            </View>

            <View style={[styles.separator, { backgroundColor: roleInfo.borderColor }]} />

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

            <TouchableOpacity 
              style={[styles.menuItem, isLoggingOut && styles.disabledMenuItem]} 
              onPress={handleLogout}
              activeOpacity={isLoggingOut ? 1 : 0.7}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <View style={styles.logoutLoadingContainer}>
                  <ActivityIndicator size="small" color="#DC3545" />
                  <Text style={[styles.menuItemText, { color: '#DC3545', marginLeft: 8 }]}>
                    Cerrando...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.menuItemText, { color: '#DC3545' }]}>
                  {AUTH_TEXTS.logoutButton}
                </Text>
              )}
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
    zIndex: 99998,
  },
  container: {
    position: 'absolute',
    zIndex: 99999,
  },
  
  hamburgerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E4F7',
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
  
  menuContainer: {
    position: 'absolute',
    top: 60,
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
      
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#5124A5',
    textAlign: 'center',
  },
  
  disabledMenuItem: {
    opacity: 0.6,
  },
  
  logoutLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
