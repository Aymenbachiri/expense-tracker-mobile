import { useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout(): React.JSX.Element {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded)
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  if (isSignedIn) return <Redirect href={"/(tabs)"} />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
