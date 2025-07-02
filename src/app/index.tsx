import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { advancedFeatures } from "../components/screens/home-screen/advanced-features";
import { features } from "../components/screens/home-screen/features";
import { howItWorks } from "../components/screens/home-screen/how-it-works";
import { metrics } from "../components/screens/home-screen/metrics";
import { powerfulFeatures } from "../components/screens/home-screen/powerful-features";
import { useHomeScreen } from "../lib/hooks/use-home-screen";

export default function HomePage(): React.JSX.Element {
  const { handleSignIn, handleSignUp } = useHomeScreen();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="bg-gradient-to-br from-blue-600 to-purple-700 px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <View className="items-center">
            <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-white/20 sm:h-24 sm:w-24">
              <Text className="text-4xl sm:text-5xl">💰</Text>
            </View>
            <Text className="mb-4 text-center text-3xl font-bold text-gray-700 sm:text-4xl">
              ExpenseWise
            </Text>
            <Text className="mb-8 text-center text-lg text-gray-600 sm:text-xl">
              Your Smart Financial Companion
            </Text>
            <Text className="max-w-xl text-center text-base leading-6 text-gray-600 sm:text-lg">
              Take control of your finances with intelligent expense tracking,
              budget management, and insightful analytics
            </Text>
          </View>
        </View>

        <View className="px-4 py-12 sm:px-6 lg:px-8">
          <Text className="mb-8 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            Why Choose ExpenseWise?
          </Text>
          <View className="space-y-6">
            {features.map((feature, idx) => (
              <View
                key={idx}
                className="flex-row items-start rounded-xl bg-gray-50 p-4"
              >
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                  <Text className="text-xl sm:text-2xl">{feature.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
                    {feature.title}
                  </Text>
                  <Text className="leading-5 text-gray-600">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
          <Text className="mb-8 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            How It Works
          </Text>
          <View className="space-y-4">
            {howItWorks.map((step, i) => (
              <View key={i} className="my-3 flex-row items-center sm:my-0">
                <View className="mr-4 h-6 w-6 items-center justify-center rounded-full bg-blue-500 sm:h-8 sm:w-8">
                  <Text className="text-sm font-bold text-white sm:text-base">
                    {i + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700 sm:text-base">
                  <Text className="font-semibold">{step.split(":")[0]}:</Text>{" "}
                  {step.split(":")[1].trim()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-4 py-12 sm:px-6 lg:px-8">
          <Text className="mb-8 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            Join Thousands of Smart Savers
          </Text>
          <View className="flex-row flex-wrap justify-around">
            {metrics.map((item, idx) => (
              <View key={idx} className="mb-6 w-1/2 items-center sm:w-1/3">
                <Text
                  className={`text-2xl font-bold sm:text-3xl ${item.color}`}
                >
                  {item.value}
                </Text>
                <Text className="text-center text-sm text-gray-600 sm:text-base">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <Text className="mb-8 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            Powerful Features at Your Fingertips
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {powerfulFeatures.map((card, idx) => (
              <View
                key={idx}
                className="mb-4 w-full items-center rounded-xl bg-white p-4 sm:w-1/2 lg:w-1/4"
              >
                <Text className="mb-2 text-3xl">{card.icon}</Text>
                <Text className="text-base font-semibold text-gray-800 sm:text-lg">
                  {card.title}
                </Text>
                <Text className="text-center text-sm text-gray-600 sm:text-base">
                  {card.desc}
                </Text>
              </View>
            ))}
          </View>
          <View className="mt-6 rounded-xl bg-white p-6">
            <Text className="mb-4 text-lg font-semibold text-gray-800 sm:text-xl">
              Advanced Features Include:
            </Text>
            <View className="space-y-2">
              {advancedFeatures.map((feat, idx) => (
                <View key={idx} className="flex-row items-center">
                  <Text className="mr-2 text-green-500">✓</Text>
                  <Text className="flex-1 text-sm text-gray-600 sm:text-base">
                    {feat}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="px-4 pb-12 sm:px-6 lg:px-8">
          <View className="items-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8">
            <Text className="mb-4 text-center text-xl font-bold text-gray-700 sm:text-2xl">
              Ready to Take Control?
            </Text>
            <Text className="mb-8 text-center text-sm leading-6 text-gray-600 sm:text-base">
              Start your journey to financial freedom today. It&apos;s free and
              takes less than 2 minutes!
            </Text>
            <View className="w-full space-y-4">
              <TouchableOpacity
                onPress={handleSignUp}
                className="w-full rounded-xl bg-white px-6 py-4"
              >
                <Text className="text-center text-lg font-bold text-blue-600 sm:text-xl">
                  Create Free Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignIn}
                className="w-full rounded-xl border-2 border-white/30 px-6 py-4"
              >
                <Text className="text-center text-lg font-semibold text-gray-600 sm:text-xl">
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
          <View className="items-center">
            <View className="mb-4 flex-row items-center">
              <Text className="mr-2 text-2xl">💰</Text>
              <Text className="text-lg font-bold text-white">ExpenseWise</Text>
            </View>
            <Text className="mb-4 text-center text-sm text-gray-400 sm:text-base">
              Your privacy is our priority. All data is encrypted and secure.
            </Text>
            <View className="flex-row gap-4 space-x-6">
              <TouchableOpacity>
                <Text className="text-sm text-gray-400">Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-sm text-gray-400">Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-sm text-gray-400">Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
