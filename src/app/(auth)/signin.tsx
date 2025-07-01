import { useSigninUser } from "@/src/lib/hooks/use-signin-user";
import { cn } from "@/src/lib/utils/utils";
import { Link } from "expo-router";
import React from "react";
import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Signin(): React.JSX.Element {
  const { control, errors, handleSubmit, onSignInPress, loading } =
    useSigninUser();

  return (
    <View className="p-4">
      <Text className="mb-6 text-center text-lg">Sign in</Text>

      <Controller
        control={control}
        name="emailAddress"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              autoCapitalize="none"
              value={value}
              placeholder="Enter email"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
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
              secureTextEntry
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

      <TouchableOpacity
        onPress={handleSubmit(onSignInPress)}
        disabled={loading}
        className={cn(
          "my-6 rounded p-3",
          loading ? "bg-gray-400" : "bg-blue-500",
        )}
      >
        <Text className="text-center text-white">
          {loading ? (
            <ActivityIndicator color="white" className="pr-3" />
          ) : (
            "Continue"
          )}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center gap-3">
        <Text>Don&apos;t have an account?</Text>
        <Link href="/(auth)/signup">
          <Text className="text-blue-500">Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
