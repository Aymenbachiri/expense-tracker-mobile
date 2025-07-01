import { useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function AuthLayout(): React.JSX.Element {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return <ActivityIndicator />;
  if (isSignedIn) return <Redirect href={"/(tabs)"} />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
