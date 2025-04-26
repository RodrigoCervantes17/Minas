import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" // Ruta principal: /
        options={{ title: "Inicio" }}
      />
      <Stack.Screen 
        name="form" // Ruta: /form
        options={{ title: "Formulario" }}
      />
    </Stack>
  );
}