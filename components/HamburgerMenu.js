import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuth } from './UserContext';
import { ROLE_TEXTS, AUTH_TEXTS, NAVIGATION_TEXTS } from '../constants/Strings';
import { colors, typography, spacing, borderRadius, shadows, sizes } from '../constants/Theme';

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
        return { icon: ROLE_TEXTS.adminIcon, text: ROLE_TEXTS.admin, ...colors.roles.admin };
      case 'empleado':
        return { icon: ROLE_TEXTS.employeeIcon, text: ROLE_TEXTS.employee, ...colors.roles.employee };
      default:
        return {
          icon: ROLE_TEXTS.employeeIcon,
          text: role ? role.toUpperCase() : 'USUARIO',
          ...colors.roles.default,
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
            <ActivityIndicator size="large" color={colors.primary} />
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
                  <ActivityIndicator size="small" color={colors.error} />
                  <Text style={[styles.menuItemText, { color: colors.error, marginLeft: spacing.sm }]}>
                    Cerrando...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.menuItemText, { color: colors.error }]}>
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
    width: sizes.hamburgerButtonSize,
    height: sizes.hamburgerButtonSize,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    ...shadows.lg,
  },
  hamburgerIcon: {
    justifyContent: 'space-between',
    height: sizes.hamburgerIconHeight,
    width: sizes.hamburgerIconWidth,
  },
  hamburgerLine: {
    height: sizes.hamburgerLineHeight,
    width: '100%',
    borderRadius: borderRadius.xs,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 0,
    width: sizes.menuWidth,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingVertical: spacing.sm,
    ...shadows.xl,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  roleIcon: {
    fontSize: sizes.iconSize,
    marginRight: spacing.sm,
  },
  roleText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    flex: 1,
  },
  separator: {
    height: 1,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    opacity: 0.3,
  },
  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.white,
    padding: spacing.xxxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.xl,
  },
  loadingText: {
    marginTop: 15,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primary,
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
