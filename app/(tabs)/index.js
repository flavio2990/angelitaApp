import * as React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, View, ScrollView } from 'react-native';

import { Card, Text, TextInput, Button } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Dropdown } from 'react-native-paper-dropdown';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

export default function LogScreen() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const OPTIONS = [
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Enfermeria', value: 'Enfermeria' },
  ];
  const [gender, setGender] = React.useState("")
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#007AFF',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#000000',
      placeholder: '#A9A9A9',
    },
  };



  return (
    <>
      <PaperProvider theme={theme}>
        <StatusBar />
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/images/grandma.png')}
                style={styles.homeLogo}
              />
              <ThemedText type="title" style={styles.titleText}>
                Hogar Angelita!
              </ThemedText>
            </View>

            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleLarge" style={styles.bigWelcomeText}>Bienvenido</Text>
                <TextInput
                  value={username}
                  onChangeText={text => setUsername(text)}
                  label="Usuario"
                  style={styles.textInput}
                  theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                />
                <View style={{ margin: 8 }} />
                <TextInput
                  label="Contraseña"
                  secureTextEntry
                  value={password}
                  onChangeText={text => setPassword(text)}
                  style={styles.textInput}
                  theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                />
                <View style={{ margin: 16, width: 260 }}>
                  <Dropdown
                    label="Sector"
                    placeholder="Seleccione Sector"
                    options={OPTIONS}
                    value={gender}
                    onSelect={setGender}
                    theme={{ colors: { text: '#000', primary: '#007AFF', placeholder: '#A9A9A9' } }}
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={() => console.log('Pressed')}
                  buttonColor="#5124A5"
                  style={styles.button}
                  labelStyle={styles.buttonLabel}>
                  INGRESAR
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </PaperProvider>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    top: 25
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  homeLogo: {
    height: 150,
    width: 150,
    borderRadius: 100,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 30,
    color: '#000',
  },
  card: {
    backgroundColor: '#ffffff',
    width: 320,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  bigWelcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  textInput: {
    width: 260,
  },
  button: {
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});