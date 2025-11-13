import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { database } from '../env/firebase';
import { ref, set, update, get } from 'firebase/database';
import { VITALS_TEXTS } from '../constants/Strings';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5; // Solo mostrar 5 elementos a la vez
const MAX_VITAL_VALUE = 999;

const sanitizeDigits = (text) => {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 3) {
    return digits;
  }
  return digits.slice(-3);
};
const clampNumericValue = (value) => {
  const numeric = parseInt(value, 10);
  if (isNaN(numeric)) {
    return 0;
  }
  return Math.min(Math.max(numeric, 0), MAX_VITAL_VALUE);
};
const formatVitalValue = (value) => clampNumericValue(value).toString().padStart(3, '0');

export default function VitalSignsColumns({ 
  label, 
  value, 
  onValueChange, 
  style,
  // Props para signos vitales completos
  adminUid,
  area,
  personId,
  patientName,
  visible,
  onDismiss,
  onModify,
  onSave
}) {
  const scrollViewRef = useRef(null);
  const [currentValue, setCurrentValue] = useState(value || 120);
  const [isScrolling, setIsScrolling] = useState(false);

  // Estados para signos vitales completos
  const [sistole, setSistole] = useState(0);
  const [diastole, setDiastole] = useState(0);
  const [pulso, setPulso] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataExists, setDataExists] = useState(false);
  const [sistoleInput, setSistoleInput] = useState(formatVitalValue(0));
  const [diastoleInput, setDiastoleInput] = useState(formatVitalValue(0));
  const [pulsoInput, setPulsoInput] = useState(formatVitalValue(0));
  
  // Estados para edición directa

  // Generar números repetidos como rueda (000, 111, 222, 333, etc.)
  const generateVisibleData = (centerValue) => {
    const range = 1; 
    const start = Math.max(0, centerValue - range);
    const end = Math.min(999, centerValue + range);
    
    const data = [];
    for (let i = start; i <= end; i++) {
      // Crear número repetido (000, 111, 222, etc.)
      const repeatedNumber = i.toString().padStart(3, i.toString().charAt(0));
      data.push({
        value: i,
        displayValue: repeatedNumber,
        index: i,
        displayIndex: i - start
      });
    }
    return data;
  };

  const [visibleData, setVisibleData] = useState(() => generateVisibleData(currentValue));

  useEffect(() => {
    if (value !== undefined && value !== currentValue) {
      setCurrentValue(value);
      setVisibleData(generateVisibleData(value));
    }
  }, [value]);

  const handleScroll = (event) => {
    if (isScrolling) return;
    
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const centerIndex = Math.round(contentOffsetY / ITEM_HEIGHT);
    const newValue = Math.max(0, Math.min(999, currentValue - 10 + centerIndex));
    
    if (newValue !== currentValue) {
      setCurrentValue(newValue);
      onValueChange(newValue);
      
      // Actualizar datos visibles si nos acercamos a los bordes
      if (centerIndex < 5 || centerIndex > 15) {
        setVisibleData(generateVisibleData(newValue));
      }
    }
  };

  const handleItemPress = (itemValue) => {
    setCurrentValue(itemValue);
    onValueChange(itemValue);
    setVisibleData(generateVisibleData(itemValue));
  };

  const scrollToValue = (targetValue) => {
    const centerIndex = Math.round(visibleData.length / 2);
    const scrollY = centerIndex * ITEM_HEIGHT;
    
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: scrollY,
        animated: false
      });
    }
  };

  // Funciones de Firebase para signos vitales
  const loadSignosVitales = async () => {
    if (!adminUid || !area || !personId) return;
    
    setLoading(true);
    try {
      const signosRef = ref(database, `admins/${adminUid}/areas/${area}/personas/${personId}/planillas/signosVitales`);
      const snapshot = await get(signosRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sistoleValue = clampNumericValue(data.sistole ?? 0);
        const diastoleValue = clampNumericValue(data.diastole ?? 0);
        const pulsoValue = clampNumericValue(data.pulso ?? 0);

        setSistole(sistoleValue);
        setDiastole(diastoleValue);
        setPulso(pulsoValue);
        setSistoleInput(formatVitalValue(sistoleValue));
        setDiastoleInput(formatVitalValue(diastoleValue));
        setPulsoInput(formatVitalValue(pulsoValue));
        setDataExists(true);
      } else {
        setDataExists(false);
        setSistole(0);
        setDiastole(0);
        setPulso(0);
        setSistoleInput(formatVitalValue(0));
        setDiastoleInput(formatVitalValue(0));
        setPulsoInput(formatVitalValue(0));
      }
    } catch (error) {
      console.error('Error loading signos vitales:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSignosVitales = async () => {
    if (!adminUid || !area || !personId) return;
    
    setSaving(true);
    try {
      const signosRef = ref(database, `admins/${adminUid}/areas/${area}/personas/${personId}/planillas/signosVitales`);
      
      const dataToSave = {
        sistole: formatVitalValue(sistole),
        diastole: formatVitalValue(diastole),
        pulso: formatVitalValue(pulso),
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid
      };

      if (!dataExists) {
        dataToSave.createdAt = new Date().toISOString();
        dataToSave.createdBy = adminUid;
        await set(signosRef, dataToSave);
        setDataExists(true);
      } else {
        await update(signosRef, dataToSave);
      }
    } catch (error) {
      console.error('Error saving signos vitales:', error);
    } finally {
      setSaving(false);
    }
  };

  // Cargar datos cuando el modal se abre
  useEffect(() => {
    if (adminUid && area && personId) {
      loadSignosVitales();
    }
  }, [adminUid, area, personId]);

  useEffect(() => {
    if (visible) {
      setSistoleInput(formatVitalValue(sistole));
      setDiastoleInput(formatVitalValue(diastole));
      setPulsoInput(formatVitalValue(pulso));
    }
  }, [visible]);

  const handleVitalInputChange = (text, setInput, setValue) => {
    const sanitized = sanitizeDigits(text);
    setInput(sanitized);
    const numeric = sanitized.length > 0 ? clampNumericValue(sanitized) : 0;
    setValue(numeric);
  };

  const handleVitalInputBlur = (inputValue, setInput, setValue) => {
    const sanitized = sanitizeDigits(inputValue);
    const numeric = sanitized.length > 0 ? clampNumericValue(sanitized) : 0;
    setValue(numeric);
    setInput(formatVitalValue(numeric));
  };

  // Exponer funciones para los botones del CustomModal
  useEffect(() => {
    if (adminUid && area && personId && patientName) {
      if (onModify) {
        onModify.current = () => console.log('Modificar pressed');
      }
      if (onSave) {
        onSave.current = saveSignosVitales;
      }
    }
  }, [adminUid, area, personId, patientName, onModify, onSave]);

  useEffect(() => {
    scrollToValue(currentValue);
  }, [visibleData]);

  // Si se pasan props completas de signos vitales, renderizar contenido para CustomModal
  if (adminUid && area && personId && patientName) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.vitalsContent}>
          {/* Pickers de Signos Vitales */}
          <View style={styles.pickersContainer}>
          <View style={styles.pickerColumn}>
            <TextInput
              style={styles.numericInput}
              value={sistoleInput}
              onChangeText={(text) => handleVitalInputChange(text, setSistoleInput, setSistole)}
              onBlur={() => handleVitalInputBlur(sistoleInput, setSistoleInput, setSistole)}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="000"
              placeholderTextColor="#B39DDB"
              returnKeyType="done"
              selectTextOnFocus
            />
          </View>
          
          <View style={styles.pickerColumn}>
            <TextInput
              style={styles.numericInput}
              value={diastoleInput}
              onChangeText={(text) => handleVitalInputChange(text, setDiastoleInput, setDiastole)}
              onBlur={() => handleVitalInputBlur(diastoleInput, setDiastoleInput, setDiastole)}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="000"
              placeholderTextColor="#B39DDB"
              returnKeyType="done"
              selectTextOnFocus
            />
          </View>
          
          <View style={styles.pickerColumn}>
            <TextInput
              style={styles.numericInput}
              value={pulsoInput}
              onChangeText={(text) => handleVitalInputChange(text, setPulsoInput, setPulso)}
              onBlur={() => handleVitalInputBlur(pulsoInput, setPulsoInput, setPulso)}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="000"
              placeholderTextColor="#B39DDB"
              returnKeyType="done"
              selectTextOnFocus
            />
          </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  // Si no se pasan props completas, renderizar picker individual
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onMomentumScrollBegin={() => setIsScrolling(true)}
          onMomentumScrollEnd={() => setIsScrolling(false)}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {visibleData.map((item, index) => {
            const isSelected = item.value === currentValue;
            return (
              <TouchableOpacity 
                key={`${item.value}-${index}`}
                style={[
                  styles.itemContainer,
                  isSelected && styles.selectedItem
                ]}
                onPress={() => handleItemPress(item.value)}
              >
                <Text style={[
                  styles.itemText,
                  isSelected && styles.selectedText
                ]}>
                  {item.displayValue}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5124A5',
    marginBottom: 10,
    textAlign: 'center',
  },
  pickerContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 80, // Espacio para centrar el primer elemento
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedItem: {
    backgroundColor: '#5124A5',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  itemText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Estilos para el contenido dentro del CustomModal
  vitalsContent: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInfo: {
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  patientText: {
    fontSize: 20,
    color: '#5124A5',
    fontWeight: 'bold',
  },
  pickersContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 16,
    paddingHorizontal: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: 110,
    maxWidth: 150,
  },
  numericInput: {
    height: ITEM_HEIGHT,
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5124A5',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5124A5',
    paddingVertical: 6,
  },
  centerDisplay: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5124A5',
    marginHorizontal: 4,
    borderRadius: 6,
    marginVertical: 2,
  },
  centerValue: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  textInput: {
    height: ITEM_HEIGHT,
    backgroundColor: '#5124A5',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
  },
});