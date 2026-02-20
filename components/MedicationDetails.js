import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MEDICATION_TEXTS } from '../constants/Strings';
import { colors, typography, spacing, borderRadius } from '../constants/Theme';

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
  
  const normalizeMedicationEntries = (medicationsNode) => {
    if (!medicationsNode) return [];
    if (Array.isArray(medicationsNode)) {
      return medicationsNode.filter(med => med && med.droga);
    }
    if (medicationsNode.droga) {
      return [medicationsNode];
    }
    if (typeof medicationsNode === 'object') {
      return Object.entries(medicationsNode)
        .filter(([id, med]) => med && med.droga)
        .map(([id, med]) => ({ ...med, id }));
    }
    return [];
  };

  // Use medicationsList if available (grouped medications from same day), otherwise use single medications object
  const medicationEntries = medicationData.medicationsList
    ? medicationData.medicationsList.flatMap(med => normalizeMedicationEntries(med))
    : normalizeMedicationEntries(medicationData.medications);

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
    width: '100%',
    flex: 1,
    minHeight: 300,
  },
  flatList: {
    width: '100%',
    flex: 1,
    minHeight: 300,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: spacing.sm,
  },
  headerWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  listItemContainer: {
    paddingHorizontal: spacing.lg,
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
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginRight: spacing.sm,
  },
  dynamicText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textDark,
    fontWeight: typography.fontWeights.regular,
  },
  dynamicTextWrap: {
    fontSize: typography.fontSizes.lg,
    color: colors.textDark,
    fontWeight: typography.fontWeights.regular,
    flexWrap: 'wrap',
    width: '100%',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    marginBottom: spacing.sm,
  },
  headerCellDroga: {
    flex: 1.5,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  headerCellHora: {
    flex: 1,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  headerCellDosis: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.textDark,
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  tableCellDroga: {
    flex: 1.5,
    marginRight: spacing.sm,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  tableCellHora: {
    flex: 1,
    marginRight: spacing.sm,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  tableCellDosis: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  cellText: {
    fontSize: typography.fontSizes.md,
    color: colors.textDark,
  },
  noDataContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    padding: spacing.xl,
  },
});
