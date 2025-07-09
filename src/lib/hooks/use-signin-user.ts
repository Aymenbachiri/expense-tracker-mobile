import { useAuth, useSignIn, useUser } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  useForm,
  type Control,
  type FieldErrors,
  type UseFormHandleSubmit,
} from "react-hook-form";
import Toast from "react-native-toast-message";
import { signinSchema, type SigninFormData } from "../schema/signin-schema";

type UseSigninUserReturn = {
  control: Control<SigninFormData>;
  errors: FieldErrors<SigninFormData>;
  handleSubmit: UseFormHandleSubmit<SigninFormData>;
  onSignInPress: (data: SigninFormData) => Promise<void>;
  loading: boolean;
};

export function useSigninUser(): UseSigninUserReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { emailAddress: "", password: "" },
  });

  const onSignInPress = async (data: SigninFormData) => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      if (isSignedIn) {
        await signOut();
      }

      const attempt = await signIn.create({
        identifier: data.emailAddress,
        password: data.password,
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        Toast.show({
          type: "success",
          text1: "Signin Successful",
          text2: "Welcome Back",
        });
        router.replace("/(tabs)");
      } else {
        console.error("Sign-in status:", attempt.status);
        Toast.show({
          type: "error",
          text1: "Sign-in Error",
          text2: `Unexpected status: ${attempt.status}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err.errors?.[0]?.longMessage || err.message || "Sign-in failed";
      Toast.show({ type: "error", text1: "Sign-in Failed", text2: message });
    } finally {
      setLoading(false);
    }
  };

  return { control, errors, handleSubmit, onSignInPress, loading };
}
