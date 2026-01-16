import { View, Text, StyleSheet } from 'react-native';
import { FORM_TEXTS } from '../constants/Strings';

export default function PersonDetails({ person, userType }) {
  const isEmployee = person?.tipo && 
    (person.tipo.toLowerCase() === 'enfermería' || person.tipo.toLowerCase() === 'administrador');

  return (
    <View style={styles.container}>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.nameLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.nombre}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.ageLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.edad}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.dniLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.dni}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.birthLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.nacimiento}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.admissionLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.ingreso}</Text>
      </View>
      {!isEmployee && (
        <>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsModal}>_{FORM_TEXTS.socialCoverageLabel}:</Text>
            <Text style={styles.dynamicText}>{person?.coberturaSocial}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsModal}>_{FORM_TEXTS.maritalStatusLabel}:</Text>
            <Text style={styles.dynamicText}>{person?.estadoCivil}</Text>
          </View>
        </>
      )}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.nationalityLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.nacionalidad}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.areaLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.area}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsModal}>_{FORM_TEXTS.typeLabel}:</Text>
        <Text style={styles.dynamicText}>{person?.tipo}</Text>
      </View>
      {!isEmployee && (
        <View style={styles.detailsRow}>
          <Text style={styles.detailsModal}>_{FORM_TEXTS.weightLabel}:</Text>
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
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 8,
    },
    dynamicText: {
      fontSize: 18,
      color: '#0a0a1e',
      fontWeight: 'regular',
    },
  });