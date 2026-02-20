import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { colors, typography, spacing, borderRadius } from '../constants/Theme';

export default function MedicationAdminList({
  medications = [],
  medId = null,
  personId = null,
  area = null,
  uid = null,
  onAdminCheckChange = null,
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
      }));
    }

    if (medications && typeof medications === 'object') {
      return Object.entries(medications).map(([id, med]) => ({
        id,
        medIndex: id,
        droga: med?.droga || '',
        dosis: med?.dosis || '',
        hora: med?.hora || '',
      }));
    }

    return [];
  }, [medications]);

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
            color={colors.primary}
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
    paddingBottom: spacing.sm,
    flexGrow: 0,
  },
  listItemContainer: {
    paddingHorizontal: spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    alignItems: 'center',
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
  tableCellDosis: {
    flex: 1,
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
  tableCellRealizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
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
