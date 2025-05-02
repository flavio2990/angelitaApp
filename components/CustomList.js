import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';

import { Card, IconButton } from 'react-native-paper';


const CustomList = ({ 
  data,
  onPress,
  topBarTitleEmploy
}) => {

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardText}>Num: {item.dni}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <><View style={styles.topbarBackground}>
      <View style={styles.topbarContent}>
        <IconButton icon="arrow-left"
          onPress={onPress}
          style={styles.backButton}
          iconColor="white">
        </IconButton>
        <Text style={styles.topbarTitle}>{topBarTitleEmploy}</Text>
      </View>
    </View><FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.dni.toString()}
        contentContainerStyle={[styles.listContent, { paddingTop: 120 }]} /></>
  );
};

export default CustomList;

const styles = StyleSheet.create({
  topbarBackground: {
    backgroundColor: '#5124A5',
    width: '100%',
    height: 100,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  topbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  topbarTitle: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 18,
    color: '#555',
  },
});
