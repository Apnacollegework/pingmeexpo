import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563eb',
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#111827',
    placeholder: '#6b7280',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={lightTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
