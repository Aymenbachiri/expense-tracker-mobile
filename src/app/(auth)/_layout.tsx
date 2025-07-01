import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout(): React.JSX.Element {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Redirect href={"/(tabs)"} />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
