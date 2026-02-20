import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants/Theme';

export default function VitalsDetails({ vitalsData }) {
  if (!vitalsData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No hay datos de signos vitales disponibles</Text>
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

  const displayDate = vitalsData.createdAt;
  const displayBy = vitalsData.createdBy || 'N/A';

  return (
    <View style={styles.container}>
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

      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_TA(Sist):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.taSystolic ? `${vitalsData.taSystolic} mmHg` : 'N/A'}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_TA(Diast):</Text>
        <Text style={styles.dynamicText}> 
          {vitalsData.taDiastolic ? `${vitalsData.taDiastolic} mmHg` : 'N/A'}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_FC(Ipm):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.heartRate || 'N/A'}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_FR/min:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.respiratoryRate || 'N/A'}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_SpO2%:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.spo2 || 'N/A'}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_T °C:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.temperature || 'N/A'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
    flex: 1,
    flexWrap: 'wrap',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.lg,
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
