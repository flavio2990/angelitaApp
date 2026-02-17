import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function MedicationAdminList({
  medications = [],
  medId = null,
  personId = null,
  area = null,
  uid = null,
  onAdminCheckChange = null,
  administrationState = null,
}) {
  const [checkedItems, setCheckedItems] = useState({});

  const medicationEntries = useMemo(() => {
    if (Array.isArray(medications)) {
      return medications.map((med, index) => ({
        id: med.id || med.medicationId || med.firebaseKey || `med-${index}-${med.droga}-${med.dosis}`,
        medIndex: index,
        droga: med.droga || '',
        dosis: med.dosis || '',
        hora: med.hora || '',
        administrado: med.administrado === true
          || administrationState?.[med.id || med.medicationId || med.firebaseKey || `med-${index}-${med.droga}-${med.dosis}`] === true
          || administrationState?.[med.id || med.medicationId || med.firebaseKey || `med-${index}-${med.droga}-${med.dosis}`]?.administered === true
          || administrationState?.[med.id || med.medicationId || med.firebaseKey || `med-${index}-${med.droga}-${med.dosis}`]?.administrado === true,
      }));
    }

    if (medications && typeof medications === 'object') {
      return Object.entries(medications).map(([id, med]) => ({
        id,
        medIndex: id,
        droga: med?.droga || '',
        dosis: med?.dosis || '',
        hora: med?.hora || '',
        administrado: med?.administrado === true
          || administrationState?.[id] === true
          || administrationState?.[id]?.administered === true
          || administrationState?.[id]?.administrado === true,
      }));
    }

    return [];
  }, [medications, administrationState]);

  useEffect(() => {
    const initialChecked = {};
    medicationEntries.forEach((item) => {
      if (item.administrado === true) {
        initialChecked[item.medIndex] = true;
      }
    });
    setCheckedItems(initialChecked);
  }, [medicationEntries]);

  const handleToggleCheck = (itemId, medIndex) => {
    const nextChecked = !checkedItems[medIndex];
    setCheckedItems(prev => ({
      ...prev,
      [medIndex]: nextChecked
    }));
    if (onAdminCheckChange) {
      onAdminCheckChange(itemId, nextChecked);
    }
  };

  const renderMedicationItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.tableRow}>
        <View style={styles.tableCellDroga}>
          <Text style={styles.cellText}>{item.droga || 'N/A'}</Text>
        </View>
        <View style={styles.tableCellDosis}>
          <Text style={styles.cellText}>{item.dosis || 'N/A'}</Text>
        </View>
        <View style={styles.tableCellHora}>
          <Text style={styles.cellText}>{item.hora || 'N/A'}</Text>
        </View>
        <View style={styles.tableCellRealizado}>
          <Checkbox
            status={checkedItems[item.medIndex] ? 'checked' : 'unchecked'}
            onPress={() => handleToggleCheck(item.id, item.medIndex)}
            color="#5124A5"
            disabled={item.administrado === true}
          />
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>
        No hay medicaciones disponibles
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        data={medicationEntries}
        renderItem={renderMedicationItem}
        keyExtractor={(item, index) => item.id || `med-${index}-${item.droga}-${item.dosis}`}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={medicationEntries.length > 0}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: 300,
    flexGrow: 0,
  },
  flatList: {
    width: '100%',
    maxHeight: 300,
    flexGrow: 0,
  },
  flatListContent: {
    paddingBottom: 8,
    flexGrow: 0,
  },
  listItemContainer: {
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  tableCellDroga: {
    flex: 1.5,
    marginRight: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  tableCellDosis: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  tableCellHora: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  tableCellRealizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cellText: {
    fontSize: 16,
    color: '#0a0a1e',
  },
  noDataContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    padding: 20,
  },
});
