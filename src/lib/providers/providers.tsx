import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import Toast from "react-native-toast-message";
import { EXPO_KEY } from "../config/config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={EXPO_KEY} tokenCache={tokenCache}>
      {children}
      <Toast />
    </ClerkProvider>
  );
}
