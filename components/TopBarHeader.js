import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './UserContext';
import { ROLE_TEXTS, AUTH_TEXTS, NAVIGATION_TEXTS } from '../constants/Strings';
import { colors, typography, spacing, borderRadius, shadows, sizes } from '../constants/Theme';

const TopBarHeader = ({
  // Existing props
  showTopBar = false,
  topBarTitle,
  onBack,
  style,
  centerTopbarTitle = false,
  // New props for integrated menu
  showMenu = false,
  menuPosition = 'top-right',
  onLogout,
  onGoHome,
  showGoHomeOption = true,
  forceShowMenu = false,
  // Safe area props
  respectSafeArea = true,
  edges = ['top'],
}) => {
  // Menu state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { globalUserRole, logout } = useAuth();

  // Early return if nothing to show
  if (!showTopBar && !showMenu) return null;

  // Check if menu should be shown based on auth context
  const shouldShowMenu = showMenu && (forceShowMenu || globalUserRole);

  // Function to get role information
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

  // Function to get menu button position style
  const getMenuButtonPosition = () => {
    const topPosition = 30;

    switch (menuPosition) {
      case 'top-left':
        return { top: topPosition, left: 20 };
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
      // Simulate processing time to ensure data is saved to database
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use custom logout function if available, otherwise use context logout
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

  // Render hamburger icon
  const renderHamburgerIcon = () => (
    <View style={styles.hamburgerIcon}>
      <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
      <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
      <View style={[styles.hamburgerLine, { backgroundColor: roleInfo.color }]} />
    </View>
  );

  return (
    <>
      <SafeAreaView
        edges={respectSafeArea ? edges : []}
        style={[styles.safeAreaStyle, style]}
      >
        {showTopBar && (
          <View style={styles.topBar}>
            {/* Left section: Back button */}
            <View style={styles.left}>
              {onBack && (
                <IconButton
                  icon="arrow-left"
                  onPress={() => {
                    onBack();
                  }}
                  style={styles.backButton}
                  iconColor="white"
                  size={24}
                />
              )}
            </View>

            {/* Center section: Title */}
            <View style={styles.center}>
              <Text
                style={[
                  styles.topbarTextTitle,
                  centerTopbarTitle && { textAlign: 'center' },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {topBarTitle}
              </Text>
            </View>

            {/* Right section: Menu button or spacer */}
            <View style={styles.right}>
              {shouldShowMenu && (
                <TouchableOpacity
                  style={styles.hamburgerButtonInHeader}
                  onPress={handleToggleMenu}
                  activeOpacity={0.8}
                >
                  {renderHamburgerIcon()}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Menu-only mode (when header is not shown) */}
        {!showTopBar && shouldShowMenu && (
          <View style={[styles.menuOnlyContainer, getMenuButtonPosition()]}>
            <TouchableOpacity
              style={styles.hamburgerButton}
              onPress={handleToggleMenu}
              activeOpacity={0.8}
            >
              {renderHamburgerIcon()}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Menu dropdown overlay (outside SafeAreaView) */}
      {isOpen && !isLoggingOut && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Menu dropdown */}
      {isOpen && (
        <View style={[
          styles.menuContainer,
          {
            backgroundColor: roleInfo.bgColor,
            borderColor: roleInfo.borderColor,
            top: showTopBar ? 50 : 90, // Position below header or button
            right: menuPosition === 'top-left' ? undefined : 10,
            left: menuPosition === 'top-left' ? 20 : undefined,
          }
        ]}>
          {/* Menu header with role info */}
          <View style={styles.menuHeader}>
            <Text style={[styles.roleIcon, { color: roleInfo.color }]}>
              {roleInfo.icon}
            </Text>
            <Text style={[styles.roleText, { color: roleInfo.color }]}>
              {roleInfo.text}
            </Text>
          </View>

          {/* Separator */}
          <View style={[styles.separator, { backgroundColor: roleInfo.borderColor }]} />

          {/* Go home button */}
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

          {/* Logout button */}
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

      {/* Logout overlay */}
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cerrando sesión...</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default TopBarHeader;

const styles = StyleSheet.create({
  safeAreaStyle: {
    backgroundColor: colors.primary,
    paddingTop: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: sizes.topBarMinHeight,
    backgroundColor: colors.primary,
  },
  left: {
    width: sizes.hamburgerInHeaderSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: sizes.hamburgerInHeaderSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 0,
    marginRight: 0,
  },
  topbarTextTitle: {
    color: colors.white,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOnlyContainer: {
    position: 'absolute',
    zIndex: 99999,
  },
  hamburgerButtonInHeader: {
    width: sizes.hamburgerInHeaderSize,
    height: sizes.hamburgerInHeaderSize,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99998,
  },
  menuContainer: {
    position: 'absolute',
    width: sizes.menuWidth,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingVertical: spacing.sm,
    ...shadows.xl,
    zIndex: 99999,
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
  disabledMenuItem: {
    opacity: 0.6,
  },
  logoutLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
