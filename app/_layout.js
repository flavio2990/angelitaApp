import { Stack } from 'expo-router';
import { UserProvider } from '../components/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}/>
    </UserProvider>
  );
}