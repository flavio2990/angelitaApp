import { View, Text, StyleSheet } from 'react-native';

export default function VitalsDetails({ vitalsData }) {
  if (!vitalsData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No hay datos de signos vitales disponibles</Text>
      </View>
    );
  }

  // Formatear fecha según el diseño: "Realizado el 12/2/2025"
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

  // Formatear hora según el diseño: "10: 23 am"
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

  // Usar solo createdAt según los requerimientos
  const displayDate = vitalsData.createdAt;
  const displayBy = vitalsData.createdBy || 'N/A';

  return (
    <View style={styles.container}>
      {/* Realizado el */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>Realizado el</Text>
        <Text style={styles.dynamicText}>
          {displayDate ? formatDate(displayDate) : 'N/A'}
        </Text>
      </View>

      {/* Realizado a las */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>Realizado a las:</Text>
        <Text style={styles.dynamicText}>
          {displayDate ? formatTime(displayDate) : 'N/A'}
        </Text>
      </View>

      {/* Ingresado por */}
      <View style={styles.detailsRowWrap}>
        <Text style={styles.detailsModal}>Ingresado por:</Text>
        <Text style={styles.dynamicTextWrap}>
          {displayBy}
        </Text>
      </View>

      {/* Separador visual */}
      <View style={styles.separator} />

      {/* TA Sistólica */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_TA(Sist):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.taSystolic ? `${vitalsData.taSystolic} mmHg` : 'N/A'}
        </Text>
      </View>

      {/* TA Diastólica */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_TA(Diast):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.taDiastolic ? `${vitalsData.taDiastolic} mmHg` : 'N/A'}
        </Text>
      </View>

      {/* FC */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_FC(Ipm):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.heartRate || 'N/A'}
        </Text>
      </View>

      {/* FR */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_FR/min:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.respiratoryRate || 'N/A'}
        </Text>
      </View>

      {/* SpO2 */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_SpO2%:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.spo2 || 'N/A'}
        </Text>
      </View>

      {/* Temp */}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    flex: 1,
    flexWrap: 'wrap',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
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
