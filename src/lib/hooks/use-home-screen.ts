import { useRouter } from "expo-router";

type useHomeScreenReturn = {
  handleSignIn: () => void;
  handleSignUp: () => void;
};

export function useHomeScreen(): useHomeScreenReturn {
  const router = useRouter();
  const handleSignIn = () => {
    router.push("/(auth)/signin");
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup");
  };

  return { handleSignIn, handleSignUp };
}
