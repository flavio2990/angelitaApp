import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

//aqui estan las navegaciones

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
// import { Stack } from 'expo-router';

// export default function Layout() {
//   return <Stack />;
// }
// Esto reemplaza el diseño de pestañas con un diseño de pila (Stack), que renderiza las rutas de forma independiente.
// 2. Mover las rutas fuera de (tabs)
// Si no necesitas agrupar las rutas bajo (tabs), puedes mover los archivos index.js y explore.js a un directorio superior, como app.

// Por ejemplo:
// app/
  // index.js
  // explore.js
  // Luego, actualiza el archivo tsconfig.json para reflejar los cambios:
//   "include": [
//   "**/*.ts",
//   "**/*.tsx",
//   ".expo/types/**/*.ts",
//   "expo-env.d.ts",
//   "app/index.js",
//   "app/explore.js"
// ]
// 3. Actualizar las rutas en tsconfig.json
// Si decides mantener las rutas en (tabs) pero sin un _layout.js, asegúrate de que las rutas estén correctamente configuradas en tsconfig.json. Sin embargo, Expo Router requiere un _layout.js para manejar directorios con rutas agrupadas, por lo que esta opción no es ideal.

// Recomendación:
// La solución más sencilla es mantener un archivo _layout.js básico con un diseño de pila (Stack) si no necesitas pestañas. Esto asegura que las rutas dentro de (tabs) sigan funcionando correctamente.