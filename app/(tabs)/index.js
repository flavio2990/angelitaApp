import { Image, StyleSheet, View, SafeAreaView } from 'react-native';
import { Card, Text } from 'react-native-paper';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

export default function LogScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/grandma.png')}
              style={styles.homeLogo}
            />
            <ThemedText type="title" style={styles.titleText}>
              Hogar Angelita!
            </ThemedText>
          </View>
        }
      />
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Bienvenido</Text>
          <Text variant="bodyMedium">Card content</Text>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  homeLogo: {
    height: 150,
    width: 150,
    borderRadius: 75,
    resizeMode: 'cover',
  },
  titleText: {
    marginTop: 10,
    fontSize: 20,
    color: '#000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
  },
});
