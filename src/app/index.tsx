import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePage(): React.JSX.Element {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1">
      <Text>HomePages</Text>
      <Link href={"/(auth)/signup"}>signup</Link>
      <Link href={"/(auth)/signin"}>signin</Link>
      <Button title="signout" onPress={() => signOut()} />
    </SafeAreaView>
  );
}
