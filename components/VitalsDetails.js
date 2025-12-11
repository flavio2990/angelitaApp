import { View, Text, StyleSheet } from 'react-native';

export default function VitalsDetails({ vitalsData }) {
  if (!vitalsData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No hay datos de signos vitales disponibles</Text>
      </View>
    );
  }

  // Formatear fecha y hora
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
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Fecha de realizado */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Fecha de realizado:</Text>
        <Text style={styles.dynamicText}>
          {formatDate(vitalsData.updatedAt || vitalsData.createdAt)}
        </Text>
      </View>

      {/* Hora de realizado */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Hora de realizado:</Text>
        <Text style={styles.dynamicText}>
          {formatTime(vitalsData.updatedAt || vitalsData.createdAt)}
        </Text>
      </View>

      {/* Por quien */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Por quien:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.updatedBy || vitalsData.createdBy || 'N/A'}
        </Text>
      </View>

      {/* Separador visual */}
      <View style={styles.separator} />

      {/* TA Sistólica */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_TA (Sist.):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.taSystolic || 'N/A'}
        </Text>
      </View>

      {/* TA Diastólica */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_TA (Diast.):</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.taDiastolic || 'N/A'}
        </Text>
      </View>

      {/* FC */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_FC:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.heartRate || 'N/A'}
        </Text>
      </View>

      {/* FR */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_FR:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.respiratoryRate || 'N/A'}
        </Text>
      </View>

      {/* SpO2 */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_SpO₂:</Text>
        <Text style={styles.dynamicText}>
          {vitalsData.spo2 || 'N/A'}
        </Text>
      </View>

      {/* Temp */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Temp:</Text>
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
    padding: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
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
    flex: 1,
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

