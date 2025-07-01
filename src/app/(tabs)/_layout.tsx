import { Tabs } from "expo-router";
import "../../global.css";

export default function RootLayout(): React.JSX.Element {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
