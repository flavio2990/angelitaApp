import { View, Text, StyleSheet } from 'react-native';

export default function PersonDetails({ person, userType }) {

  return (
    <View style={styles.container}>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Nombre:</Text>
        <Text style={styles.dynamicText}>{person?.nombre}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Edad:</Text>
        <Text style={styles.dynamicText}>{person?.edad}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_DNI:</Text>
        <Text style={styles.dynamicText}>{person?.dni}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Nacimiento:</Text>
        <Text style={styles.dynamicText}>{person?.nacimiento}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Ingresó:</Text>
        <Text style={styles.dynamicText}>{person?.ingreso}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Obra Social:</Text>
        <Text style={styles.dynamicText}>{person?.coberturaSocial}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Nacionalidad:</Text>
        <Text style={styles.dynamicText}>{person?.nacionalidad}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Estado Civil:</Text>
        <Text style={styles.dynamicText}>{person?.estadoCivil}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Area:</Text>
        <Text style={styles.dynamicText}>{person?.area}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_Tipo:</Text>
        <Text style={styles.dynamicText}>{person?.tipo}</Text>
      </View>
      {userType === 'pacientes' && (
        <View style={styles.detailsRow}>
          <Text style={styles.detailsModal}>_Peso:</Text>
          <Text style={styles.dynamicText}>{person?.peso}</Text>
        </View>
      )}
    </View>
  );
}

  const styles = StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      width: '100%',
    },
    detailsRow: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    detailsModal: {
      fontSize: 22,
      fontWeight: 'bold',
      marginRight: 8,
    },
    dynamicText: {
      fontSize: 20,
      color: '#0a0a1e',
      fontWeight: 'regular',
    },
  });