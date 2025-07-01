import { cn } from "@/src/lib/utils/utils";
import { useSignUp } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const signupSchema = z.object({
  emailAddress: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup(): React.JSX.Element {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
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
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Unexpected sign-up status: " + signUpAttempt.status);
        console.error(signUpAttempt);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="p-4">
      <Text className="mb-6 text-center text-lg">Sign up</Text>
      <Controller
        control={control}
        name="emailAddress"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              autoCapitalize="none"
              value={value}
              placeholder="Enter email"
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              className={cn(
                "mb-1 rounded-md border p-2",
                errors.emailAddress ? "border-red-500" : "mb-6 border-gray-300",
              )}
            />
            {errors.emailAddress && (
              <Text className="mb-6 text-red-500">
                {errors.emailAddress.message}
              </Text>
            )}
          </>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              value={value}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={onChange}
              onBlur={onBlur}
              className={cn(
                "mb-1 rounded-md border p-2",
                errors.password ? "border-red-500" : "mb-6 border-gray-300",
              )}
            />
            {errors.password && (
              <Text className="mb-2 text-red-500">
                {errors.password.message}
              </Text>
            )}
          </>
        )}
      />
      {error && <Text className="mb-3 text-red-500">{error}</Text>}
      <TouchableOpacity
        onPress={handleSubmit(onSignUpPress)}
        disabled={loading}
        className={cn(
          "my-6 rounded p-3",
          loading ? "bg-gray-400" : "bg-blue-500",
        )}
      >
        <Text className="flex items-center justify-center gap-3 text-center text-white">
          {loading ? "Creating..." : "Create account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
