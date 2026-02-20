import { FlatList, Text, StyleSheet, View } from 'react-native';

import { Card, TouchableRipple, FAB } from 'react-native-paper';

import TopBarHeader from './TopBarHeader';
import { colors, typography, spacing, borderRadius } from '../constants/Theme';


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
    color: colors.white,
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.giant,
  },
  cardStyle: {
    marginBottom: 10,
    padding: spacing.lg,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.white,
  },
  cardTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMedium,
  },
  cardText: {
    fontSize: typography.fontSizes.lg,
  },
  fabStyle: {
    position: 'absolute',
    right: spacing.xxl,
    bottom: 50,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
});
