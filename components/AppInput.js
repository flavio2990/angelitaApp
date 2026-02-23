import React, { useState } from 'react';
import { Platform, Modal, View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  dropdownTheme,
} from '../constants/Theme';

/**
 * AppInput – Unified input component for the app.
 *
 * Props:
 *   type        'text' | 'email' | 'password' | 'numeric' | 'decimal' | 'date' | 'dropdown'
 *   label       string
 *   value       string
 *   onChange    (value: string) => void
 *   placeholder string
 *   editable    boolean (default true)
 *   error       string  – validation message shown below the field
 *   style       ViewStyle overrides for the outer field
 *   contentStyle TextStyle overrides for the inner text (Paper's contentStyle)
 *   maxLength   number
 *   dense       boolean (default false)
 *   onBlur      () => void
 *   theme       React Native Paper theme override for TextInput
 *
 *   — Date-specific —
 *   maximumDate Date
 *   minimumDate Date
 *
 *   — Dropdown-specific —
 *   options     Array<{ label: string; value: string }>
 */
export default function AppInput({
  type = 'text',
  label,
  value = '',
  onChange,
  placeholder,
  editable = true,
  error,
  style,
  contentStyle,
  maxLength,
  dense = false,
  onBlur,
  theme,
  // date
  maximumDate,
  minimumDate,
  // dropdown
  options = [],
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatDate = (date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const parseDate = (str) => {
    if (!str || typeof str !== 'string' || !str.includes('/')) return new Date();
    const [d, m, y] = str.split('/');
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const keyboardTypeMap = {
    text: 'default',
    email: 'email-address',
    password: 'default',
    numeric: 'numeric',
    decimal: 'decimal-pad',
  };

  // ── DATE ───────────────────────────────────────────────────────────────────

  if (type === 'date') {
    const openPicker = () => {
      if (!editable) return;
      setTempDate(parseDate(value));
      setPickerVisible(true);
    };

    const handleAndroidChange = (event, date) => {
      setPickerVisible(false);
      if (event.type === 'set' && date) {
        onChange(formatDate(date));
      }
    };

    const handleConfirm = () => {
      setPickerVisible(false);
      onChange(formatDate(tempDate));
    };

    const handleCancel = () => setPickerVisible(false);

    return (
      <>
        <TextInput
          mode="outlined"
          label={label}
          value={value}
          placeholder={placeholder || 'DD/MM/AAAA'}
          style={[styles.input, style]}
          dense={dense}
          editable={false}
          onPressIn={openPicker}
          theme={theme}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={openPicker}
              disabled={!editable}
              color={editable ? colors.textLight : colors.textDisabled}
            />
          }
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {pickerVisible && Platform.OS === 'android' && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleAndroidChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        )}

        {pickerVisible && Platform.OS === 'ios' && (
          <Modal
            visible={pickerVisible}
            transparent
            animationType="slide"
            onRequestClose={handleCancel}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Button onPress={handleCancel} mode="text">
                    Cancelar
                  </Button>
                  <Button onPress={handleConfirm} mode="contained">
                    Confirmar
                  </Button>
                </View>
                <View style={styles.datePickerContainer}>
                  <DatePicker
                    date={tempDate}
                    mode="date"
                    onDateChange={setTempDate}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    style={styles.customDatePicker}
                    textColor="#FFFFFF"
                    theme="dark"
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </>
    );
  }

  // ── DROPDOWN ───────────────────────────────────────────────────────────────

  if (type === 'dropdown') {
    return (
      <View style={[styles.dropdownWrapper, style]}>
        <Dropdown
          label={label}
          placeholder={placeholder || 'Seleccionar'}
          mode="outlined"
          visible={dropdownVisible && editable}
          showDropDown={() => editable && setDropdownVisible(true)}
          onDismiss={() => setDropdownVisible(false)}
          value={value}
          onSelect={(val) => {
            onChange(val);
            setDropdownVisible(false);
          }}
          options={options}
          theme={dropdownTheme}
          style={{ width: '100%' }}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  // ── TEXT / EMAIL / PASSWORD / NUMERIC / DECIMAL ────────────────────────────

  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
        keyboardType={keyboardTypeMap[type] || 'default'}
        secureTextEntry={type === 'password'}
        autoCapitalize={type === 'email' ? 'none' : 'sentences'}
        autoCorrect={type !== 'email'}
        editable={editable}
        style={[styles.input, style]}
        contentStyle={contentStyle}
        dense={dense}
        maxLength={maxLength}
        onBlur={onBlur}
        theme={theme}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  dropdownWrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  // Date picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    margin: spacing.xl,
    minWidth: 300,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  datePickerContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: 15,
    marginVertical: 10,
    ...shadows.md,
  },
  customDatePicker: {
    height: 200,
    backgroundColor: 'transparent',
  },
});
