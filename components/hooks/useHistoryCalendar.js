import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * Reusable hook for managing calendar-based history selection logic.
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.historyByDate - Object keyed by YYYY-MM-DD date strings containing historical records
 * @param {string} config.currentPersonId - Person ID used to validate record ownership
 * @param {Function} config.onSelect - Optional callback invoked when a valid record is selected
 * @param {Object|null} config.initialSelectedRecord - Optional initial record to set as selected (e.g., previousVitalsData)
 * @param {string} config.alertTitle - Optional title for alert messages (default: 'Selección')
 * @param {string} config.noDataMessage - Optional message when no data found (default: 'No hay datos disponibles para la fecha seleccionada.')
 * @param {string} config.futureDateMessage - Optional message for future dates (default: 'No se pueden seleccionar fechas futuras.')
 * 
 * @returns {Object} Hook API
 * @returns {boolean} showCalendar - Whether calendar should be displayed
 * @returns {Date} selectedDate - Currently selected date
 * @returns {Object|null} selectedRecord - Currently selected record or null
 * @returns {boolean} selectionAttempted - Whether user has attempted to select a date
 * @returns {Function} openCalendar - Opens the calendar
 * @returns {Function} closeCalendar - Closes the calendar (does not clear selectedRecord)
 * @returns {Function} handleDayPress - Handles day selection from calendar
 */
export const useHistoryCalendar = ({
  historyByDate = {},
  currentPersonId = null,
  onSelect = null,
  initialSelectedRecord = null,
  alertTitle = 'Selección',
  noDataMessage = 'No hay datos disponibles para la fecha seleccionada.',
  futureDateMessage = 'No se pueden seleccionar fechas futuras.',
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(initialSelectedRecord);
  const [selectionAttempted, setSelectionAttempted] = useState(false);

  // Sync initialSelectedRecord when it changes
  useEffect(() => {
    if (initialSelectedRecord) {
      setSelectedRecord(initialSelectedRecord);
      if (initialSelectedRecord.createdAt) {
        setSelectedDate(new Date(initialSelectedRecord.createdAt));
      }
    }
  }, [initialSelectedRecord]);

  /**
   * Opens the calendar and initializes selectedDate.
   * If a record is already selected, uses its date; otherwise uses today's date.
   */
  const openCalendar = useCallback(() => {
    const initialDate = selectedRecord?.createdAt 
      ? new Date(selectedRecord.createdAt) 
      : new Date();
    setSelectedDate(initialDate);
    setShowCalendar(true);
    setSelectionAttempted(false);
  }, [selectedRecord]);

  /**
   * Closes the calendar.
   * By default, does NOT clear selectedRecord to preserve the current selection.
   * Can optionally clear selectedRecord if clearSelection is true.
   */
  const closeCalendar = useCallback((clearSelection = false) => {
    setShowCalendar(false);
    setSelectionAttempted(false);
    if (clearSelection) {
      setSelectedRecord(null);
    }
  }, []);

  /**
   * Handles day press from calendar component.
   * 
   * @param {Object} day - Day object from react-native-calendars
   * @param {string} day.dateString - Date string in YYYY-MM-DD format
   */
  const handleDayPress = useCallback((day) => {
    const pickedKey = day.dateString;
    const picked = new Date(pickedKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickedDate = new Date(picked);
    pickedDate.setHours(0, 0, 0, 0);

    // Reject future dates
    if (pickedDate > today) {
      Alert.alert(
        alertTitle,
        futureDateMessage,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedDate(picked);
    setSelectionAttempted(true);

    // Look up record in historyByDate
    const recordForDate = historyByDate[pickedKey];

    // Validate record exists and belongs to current person
    if (recordForDate && currentPersonId) {
      if (recordForDate.personId === currentPersonId) {
        setSelectedRecord(recordForDate);
        setShowCalendar(false);
        
        // Invoke optional callback
        if (onSelect && typeof onSelect === 'function') {
          onSelect(recordForDate);
        }
        return;
      }
    }

    // No valid record found
    setSelectedRecord(null);
    Alert.alert(
      alertTitle,
      noDataMessage,
      [{ text: 'OK' }]
    );
    // Calendar remains open for user to select another date
  }, [historyByDate, currentPersonId, onSelect, alertTitle, noDataMessage, futureDateMessage]);

  return {
    showCalendar,
    selectedDate,
    selectedRecord,
    selectionAttempted,
    openCalendar,
    closeCalendar,
    handleDayPress,
  };
};
