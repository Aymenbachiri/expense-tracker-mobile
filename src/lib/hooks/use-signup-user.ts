import { useSignUp } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Control,
  useForm,
  type FieldErrors,
  type UseFormHandleSubmit,
} from "react-hook-form";
import Toast from "react-native-toast-message";
import { signupSchema, type SignupFormData } from "../schema/signup-schema";

type UseSignupUserReturn = {
  control: Control<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  handleSubmit: UseFormHandleSubmit<SignupFormData>;
  onSignUpPress: (data: SignupFormData) => Promise<void>;
  loading: boolean;
};

export function useSignupUser(): UseSignupUserReturn {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { emailAddress: "", password: "" },
  });

  const onSignUpPress = async (data: SignupFormData) => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: data.emailAddress,
        password: data.password,
      });

      if (
        signUpAttempt.status === "complete" &&
        signUpAttempt.createdSessionId
      ) {
        Toast.show({
          type: "success",
          text1: "Signup Successful",
          text2: "Please Signin",
        });
        router.replace("/(auth)/signin");
      } else {
        const msg = `Unexpected sign-up status: ${signUpAttempt.status}`;
        Toast.show({
          type: "error",
          text1: "Signup Error",
          text2: msg,
        });
        console.error(signUpAttempt);
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err.errors?.[0]?.longMessage || err.message || "Sign-up failed";
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit,
    onSignUpPress,
    loading,
  };
}
