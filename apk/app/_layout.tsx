import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { RateProvider } from '../context/RateContext';
import { AdminProvider } from '../context/AdminContext';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AdminProvider>
        <RateProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RateProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}
