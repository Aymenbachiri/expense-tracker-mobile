import { Stack } from "expo-router";

export default function AuthLayout(): React.JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="signin" options={{ headerShown: true }} />
    </Stack>
  );
}
