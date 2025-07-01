import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Signup(): React.JSX.Element {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);

    try {
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
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
    <View style={{ padding: 16 }}>
      <Text style={{ marginBottom: 8, fontSize: 18 }}>Sign up</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      {error && <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>}
      <TouchableOpacity
        onPress={onSignUpPress}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#aaa" : "#007aff",
          padding: 12,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {loading ? "Creating account..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
