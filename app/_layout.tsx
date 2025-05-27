// app/_layout.tsx
import { Slot } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Roboto_400Regular } from "@expo-google-fonts/roboto";
import { View, ActivityIndicator } from "react-native";

export default function Layout() {
  console.log("✅ _layout.tsx se está ejecutando"); // 👈 esto

  const [fontsLoaded] = useFonts({ Roboto_400Regular });

  if (!fontsLoaded) {
    console.log("⌛ Fuente aún no cargada"); // 👈 esto
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#006633" />
      </View>
    );
  }

  console.log("✅ Fuente cargada, renderizando Slot"); // 👈 esto

  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3LightTheme}>
        <Slot />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
