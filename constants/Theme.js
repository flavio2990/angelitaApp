/**
 * Centralized design tokens for the Angelita App.
 * Import named exports: colors, typography, spacing, borderRadius, shadows, sizes
 *
 * Usage:
 *   import { colors, typography, spacing, borderRadius, shadows, sizes } from '../constants/Theme';
 */

// ─── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // Brand – primary purple
  primary: '#5124A5',
  primaryLight: '#E8E4F7',    // Admin button/card background
  primaryAccent: '#EDE7F6',   // Modal accent box background
  primaryBorder: '#8B5CF6',   // Admin border

  // Secondary – employee blue
  secondary: '#007AFF',
  secondaryLight: '#E3F2FD',
  secondaryBorder: '#3B82F6',

  // Semantic
  error: '#DC3545',           // Destructive actions, logout indicator
  errorLight: '#FF6B6B',      // Change-role button, validation messages
  link: '#0a7ea4',            // Teal link text

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  textDark: '#0a0a1e',        // Main body text, table cell text
  textMedium: '#333333',      // Card titles
  textLight: '#666666',       // Subtext, no-data messages, placeholders
  textMuted: '#A9A9A9',       // Input placeholder
  textDisabled: '#d3d3d3',    // Disabled / calendar grayed-out

  // Surfaces
  background: '#ffffff',
  surface: '#ffffff',
  separator: '#e0e0e0',       // Table rows / divider lines

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Role-based colors (used in HamburgerMenu and TopBarHeader)
  roles: {
    admin: {
      color: '#5124A5',
      bgColor: '#E8E4F7',
      borderColor: '#8B5CF6',
    },
    employee: {
      color: '#007AFF',
      bgColor: '#E3F2FD',
      borderColor: '#3B82F6',
    },
    default: {
      color: '#666666',
      bgColor: '#F5F5F5',
      borderColor: '#9CA3AF',
    },
  },
};

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  fontSizes: {
    sm: 14,    // Menu items, role text, validation messages
    md: 16,    // Default body, links, loading text, button labels
    lg: 18,    // Body labels, vitals/card text, form labels
    xl: 20,    // Card titles, subtitles, topbar title
    xxl: 22,   // Modal card title
    xxxl: 24,  // Patient name label, icon size in menu
    display: 28, // Welcome heading
    title: 30,   // Home title
    hero: 32,    // Page-level title (ThemedText "title" type)
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: 'bold',
  },
  lineHeights: {
    tight: 24,  // default text
    normal: 30, // link text
    title: 32,  // hero titles
  },
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 32,
  giant: 34,
};

// ─── Border Radius ───────────────────────────────────────────────────────────
export const borderRadius = {
  xs: 2,    // Hamburger menu lines
  sm: 4,    // Table cells, small inputs
  md: 8,    // Patient info box, small modals
  lg: 12,   // Menu dropdown, modal content
  xl: 15,   // Loading container
  xxl: 16,  // Cards, list items
  logButton: 32, // CustomLogButton square corners
  round: 25,     // Half of hamburgerButtonSize (circular button)
  pill: 50,      // Pill-shaped buttons, card tops
  circle: 100,   // Avatar / circular images
};

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
};

// ─── Component Sizes ─────────────────────────────────────────────────────────
export const sizes = {
  // Buttons
  buttonWidth: 260,
  buttonHeight: 50,

  // Inputs
  formInputWidth: 340,

  // Cards
  cardWidth: 320,

  // Hamburger menu
  hamburgerButtonSize: 50,
  hamburgerInHeaderSize: 36,
  hamburgerIconHeight: 18,
  hamburgerIconWidth: 20,
  hamburgerLineHeight: 3,
  menuWidth: 200,

  // Home screen
  homeLogo: 150,

  // Log buttons (CustomLogButton)
  logButtonSize: 150,
  logButtonIcon: 80,

  // Icons
  iconSize: 24,

  // TopBar
  topBarMinHeight: 50,
};

// ─── React Native Paper Theme ────────────────────────────────────────────────
export const paperTheme = {
  colors: {
    primary: colors.secondary,   // Paper uses blue as primary (matches MasterScreen)
    background: colors.background,
    surface: colors.surface,
    text: colors.black,
    placeholder: colors.textMuted,
  },
};

// ─── Calendar Theme ──────────────────────────────────────────────────────────
export const calendarTheme = {
  selectedDayBackgroundColor: colors.primary,
  todayTextColor: colors.primary,
  arrowColor: colors.primary,
  textDisabledColor: colors.textDisabled,
};

// ─── Dropdown Theme ──────────────────────────────────────────────────────────
export const dropdownTheme = {
  colors: {
    text: '#000',
    primary: colors.primary,
    placeholder: colors.textMuted,
  },
};
