import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePage(): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1">
      <Text>HomePages</Text>
      <Link href={"/(auth)/signup"}>signup</Link>
    </SafeAreaView>
  );
}
