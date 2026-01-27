import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MEDICATION_TEXTS } from '../constants/Strings';

export default function MedicationDetails({ medicationData }) {

  if (!medicationData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No hay datos de medicación disponibles</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}: ${displayMinutes} ${ampm}`;
    } catch (e) {
      return dateString;
    }
  };

  const displayDate = medicationData.createdAt;
  const displayBy = medicationData.createdBy || 'N/A';
  
  // Use medicationsList if available (grouped medications from same day), otherwise use single medications object
  const medicationEntries = medicationData.medicationsList 
    ? medicationData.medicationsList 
    : (medicationData.medications?.droga ? [medicationData.medications] : []);

  // Prepare data for FlatList with unique keys
  const flatListData = medicationEntries.length > 0 
    ? medicationEntries.map((med, index) => ({ ...med, id: med.id || `med-${index}` }))
    : [{ id: 'no-data', droga: 'N/A', hora: 'N/A', dosis: 'N/A' }];

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.headerSection}>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsModal}>Realizado el</Text>
          <Text style={styles.dynamicText}>
            {displayDate ? formatDate(displayDate) : 'N/A'}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsModal}>Realizado a las:</Text>
          <Text style={styles.dynamicText}>
            {displayDate ? formatTime(displayDate) : 'N/A'}
          </Text>
        </View>

        <View style={styles.detailsRowWrap}>
          <Text style={styles.detailsModal}>Ingresado por:</Text>
          <Text style={styles.dynamicTextWrap}>
            {displayBy}
          </Text>
        </View>

        <View style={styles.separator} />
      </View>

      <View style={styles.tableHeader}>
        <View style={styles.headerCellDroga}>
          <Text style={styles.headerText}>{MEDICATION_TEXTS.columns.droga}</Text>
        </View>
        <View style={styles.headerCellHora}>
          <Text style={styles.headerText}>{MEDICATION_TEXTS.columns.hora}</Text>
        </View>
        <View style={styles.headerCellDosis}>
          <Text style={styles.headerText}>{MEDICATION_TEXTS.columns.dosis}</Text>
        </View>
      </View>
    </View>
  );

  const renderMedicationItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.tableRow}>
        <View style={styles.tableCellDroga}>
          <Text style={styles.cellText}>{item.droga || 'N/A'}</Text>
        </View>
        <View style={styles.tableCellHora}>
          <Text style={styles.cellText}>{item.hora || 'N/A'}</Text>
        </View>
        <View style={styles.tableCellDosis}>
          <Text style={styles.cellText}>{item.dosis || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.listItemContainer}>
      <View style={styles.tableRow}>
        <View style={styles.tableCellDroga}>
          <Text style={styles.cellText}>N/A</Text>
        </View>
        <View style={styles.tableCellHora}>
          <Text style={styles.cellText}>N/A</Text>
        </View>
        <View style={styles.tableCellDosis}>
          <Text style={styles.cellText}>N/A</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        data={medicationEntries.length > 0 ? flatListData : []}
        renderItem={renderMedicationItem}
        keyExtractor={(item, index) => item.id || `med-${index}-${item.droga}-${item.hora}`}
        ListHeaderComponent={renderHeader}
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
    flex: 1,
    width: '100%',
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listItemContainer: {
    paddingHorizontal: 16,
  },
  headerSection: {
    width: '100%',
  },
  detailsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  detailsRowWrap: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  detailsModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  dynamicText: {
    fontSize: 18,
    color: '#0a0a1e',
    fontWeight: 'regular',
  },
  dynamicTextWrap: {
    fontSize: 18,
    color: '#0a0a1e',
    fontWeight: 'regular',
    flexWrap: 'wrap',
    width: '100%',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  headerCellDroga: {
    // flex: 1.5,
    marginRight: 8,
    justifyContent: 'center',
  },
  headerCellHora: {
    // flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  headerCellDosis: {
    // flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0a1e',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  tableCellDosis: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#ffffff',
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
