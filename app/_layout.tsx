import '@/polyfills';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatOverlay } from '@/components/ChatOverlay';
import { ChatToggleButton } from '@/components/ChatToggleButton';
import 'react-native-reanimated';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <ConvexProvider client={convex}>
        <ChatProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <ChatOverlay />
          <ChatToggleButton />
          <StatusBar style="light" />
        </ChatProvider>
      </ConvexProvider>
    </ThemeProvider>
  );
}
