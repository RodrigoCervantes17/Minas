// app/_layout.tsx
import { Slot } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { useFonts, Roboto_400Regular } from "@expo-google-fonts/roboto";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3LightTheme}>
        <Slot />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
