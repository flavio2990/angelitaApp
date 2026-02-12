import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function MedicationAdminList({ medications = [] }) {
  const [checkedItems, setCheckedItems] = useState({});

  console.log('MedicationAdminList: Rendering with medications:', medications.length);

  const handleToggleCheck = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    console.log('Checkbox toggled', itemId);
  };

  // Preparar datos de medicaciones con IDs únicos
  const medicationEntries = medications && medications.length > 0 
    ? medications.map((med, index) => ({
        id: med.id || `med-${index}`,
        droga: med.droga || 'N/A',
        dosis: med.dosis || 'N/A',
      }))
    : [];

  console.log('MedicationAdminList: medicationEntries prepared:', medicationEntries.length);

  const renderMedicationItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.tableRow}>
        <View style={styles.tableCellDroga}>
          <Text style={styles.cellText}>{item.droga}</Text>
        </View>
        <View style={styles.tableCellDosis}>
          <Text style={styles.cellText}>{item.dosis}</Text>
        </View>
        <View style={styles.tableCellRealizado}>
          <Checkbox
            status={checkedItems[item.id] ? 'checked' : 'unchecked'}
            onPress={() => handleToggleCheck(item.id)}
            color="#5124A5"
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
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
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
    flex: 1,
    minHeight: 200,
  },
  flatList: {
    width: '100%',
    flex: 1,
    minHeight: 200,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 8,
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
  tableCellRealizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 16,
    color: '#0a0a1e',
  },
  noDataContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
