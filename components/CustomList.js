import { FlatList, Text, StyleSheet, View } from 'react-native';

import { Card, TouchableRipple, FAB } from 'react-native-paper';

import TopBarHeader from './TopBarHeader';


export default function CustomList({ data, onPress, topBarTitleEmploy, onItemPress, onAddPress, canEdit = false }) {


  const renderItem = ({ item }) => (
    <TouchableRipple onPress={() => onItemPress(item)} rippleColor="rgba(0, 0, 0, .1)">
      <Card style={styles.cardStyle}>
        <Card.Content>
          <Text style={styles.cardTitle}>{item.nombre || 'Sin nombre'}</Text>
          <Text style={styles.cardText}>Num: {item.dni || 'Sin DNI'}</Text>
        </Card.Content>
      </Card>
    </TouchableRipple>
  );

  return (
    <>
      <TopBarHeader
        showTopBar={true}
        topBarTitle={topBarTitleEmploy}
        onBack={onPress} />
      <FlatList
        key={`list-${data?.length || 0}`}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id || item.dni || 'unknown'}-${index}`}
        contentContainerStyle={styles.listContent}
        extraData={data?.length}
        removeClippedSubviews={false} />
      {canEdit && (
        <FAB
          icon="account-plus"
          style={styles.fabStyle}
          onPress={onAddPress}
          color="white" />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
  },
  topbarTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 34
  },
  cardStyle: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 18,
    // color: '#555',
  },
  fabStyle: {
    position: 'absolute',
    right: 24,
    bottom: 50,
    backgroundColor: '#5124A5',
    zIndex: 10,
  },
});
