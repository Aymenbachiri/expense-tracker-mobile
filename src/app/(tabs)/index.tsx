import { useAnalyticsSummary } from "@/src/lib/hooks/use-analytics-summary";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index(): React.JSX.Element {
  const { loading, error, fetchData, expenses, summary } =
    useAnalyticsSummary();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 text-center text-red-500">Error: {error}</Text>
        <TouchableOpacity
          onPress={fetchData}
          className="rounded bg-blue-500 px-4 py-2"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const screenWidth = Dimensions.get("window").width - 32;
  const chartData =
    summary && summary.totalExpenses > 0
      ? {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              data: [
                summary.totalExpenses * 0.25,
                summary.totalExpenses * 0.5,
                summary.totalExpenses * 0.75,
                summary.totalExpenses,
              ],
            },
          ],
        }
      : {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{ data: [0, 0, 0, 0] }],
        };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <View className="mb-4 rounded-2xl bg-white p-4 shadow">
          <Text className="text-lg font-semibold">
            Total Expenses This Month
          </Text>
          <Text className="mt-2 text-2xl">
            ${summary?.totalExpenses.toFixed(2) || "0.00"}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4 shadow">
          <Text className="mb-2 text-lg font-semibold">Budget Progress</Text>
          {summary?.budgetComparison && summary.budgetComparison.length > 0 ? (
            summary.budgetComparison.map((b) => {
              const progress = Math.min(b.spent / b.budget.amount, 1);
              return (
                <View key={b.budget._id} className="mb-3">
                  <Text>
                    {b.budget.name}: ${b.spent.toFixed(2)} / $
                    {b.budget.amount.toFixed(2)}
                  </Text>
                  <ProgressBar
                    progress={progress}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                </View>
              );
            })
          ) : (
            <Text className="text-gray-500">No budgets found</Text>
          )}
        </View>

        <View className="mb-4 flex-row justify-between">
          <TouchableOpacity className="mr-2 flex-1 items-center rounded-full bg-blue-600 py-3 shadow">
            <Text className="font-semibold text-white">Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity className="ml-2 flex-1 items-center rounded-full bg-green-600 py-3 shadow">
            <Text className="font-semibold text-white">Add Budget</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4 shadow">
          <Text className="mb-2 text-lg font-semibold">Spending Trends</Text>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        <View className="rounded-2xl bg-white p-4 shadow">
          <Text className="mb-2 text-lg font-semibold">
            Recent Transactions
          </Text>
          {expenses.length > 0 ? (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="border-b border-gray-200 py-2">
                  <Text className="font-medium">{item.title}</Text>
                  <Text className="text-gray-500">
                    ${item.amount.toFixed(2)} -{" "}
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text className="text-gray-500">No recent transactions</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
