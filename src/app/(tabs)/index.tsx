import { API_URL } from "@/src/lib/config/config";
import { useEffect, useState } from "react";
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

type Summary = {
  totalExpenses: number;
  totalCount: number;
  avgExpense: number;
  expensesByCategory: {
    _id: string;
    total: number;
    count: number;
    name: string;
    color: string;
  }[];
  recentExpenses: {
    _id: string;
    description: string;
    amount: number;
    date: string;
    category: { name: string; color: string };
  }[];
  budgetComparison: {
    budget: {
      _id: string;
      name: string;
      amount: number;
      category: { _id: string; name: string; color: string };
    };
    spent: number;
    remaining: number;
    percentage: number;
    status: "exceeded" | "warning" | "good";
  }[];
};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  date: string;
};

export default function Index(): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setError(null);

      // Get current month dates for the analytics summary
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const startDateStr = startOfMonth.toISOString().split("T")[0];
      const endDateStr = endOfMonth.toISOString().split("T")[0];

      console.log("API_URL:", API_URL);
      console.log("Fetching data with dates:", { startDateStr, endDateStr });

      // Test basic connectivity first
      const analyticsUrl = `${API_URL}/api/analytics/summary?startDate=${startDateStr}&endDate=${endDateStr}&categoryId=all`;
      const expensesUrl = `${API_URL}/api/expenses`;

      console.log("Analytics URL:", analyticsUrl);
      console.log("Expenses URL:", expensesUrl);

      // Add timeout and better error handling
      const timeoutPromise = (ms: number) =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), ms),
        );

      const fetchWithTimeout = async (url: string, timeout = 30000) => {
        return Promise.race([
          fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }),
          timeoutPromise(timeout),
        ]);
      };

      let sumRes: Response;
      let expRes: Response;

      try {
        console.log("Making analytics request...");
        sumRes = (await fetchWithTimeout(analyticsUrl)) as Response;
        console.log("Analytics response status:", sumRes.status);
        console.log(
          "Analytics response headers:",
          Object.fromEntries(sumRes.headers.entries()),
        );
      } catch (analyticsError) {
        console.error("Analytics request failed:", analyticsError);
        throw new Error(
          `Analytics API connection failed: ${analyticsError.message}`,
        );
      }

      try {
        console.log("Making expenses request...");
        expRes = (await fetchWithTimeout(expensesUrl)) as Response;
        console.log("Expenses response status:", expRes.status);
        console.log(
          "Expenses response headers:",
          Object.fromEntries(expRes.headers.entries()),
        );
      } catch (expensesError) {
        console.error("Expenses request failed:", expensesError);
        throw new Error(
          `Expenses API connection failed: ${expensesError.message}`,
        );
      }

      if (!sumRes.ok) {
        const errorText = await sumRes.text();
        console.error("Analytics API error response:", errorText);
        throw new Error(`Analytics API error: ${sumRes.status} - ${errorText}`);
      }

      if (!expRes.ok) {
        const errorText = await expRes.text();
        console.error("Expenses API error response:", errorText);
        throw new Error(`Expenses API error: ${expRes.status} - ${errorText}`);
      }

      const sumJson = await sumRes.json();
      const expJson = await expRes.json();

      console.log("Analytics response:", JSON.stringify(sumJson, null, 2));
      console.log("Expenses response:", JSON.stringify(expJson, null, 2));

      // Check if the responses have the expected structure
      if (!sumJson || typeof sumJson !== "object") {
        throw new Error("Invalid response format from analytics API");
      }

      if (!expJson || typeof expJson !== "object") {
        throw new Error("Invalid response format from expenses API");
      }

      // Handle both success/data format and direct data format
      const summaryData = sumJson.success ? sumJson.data : sumJson;
      const expensesData = expJson.success ? expJson.data : expJson;

      if (!summaryData) {
        throw new Error("No data received from analytics API");
      }

      setSummary(summaryData as Summary);

      // Handle recent expenses mapping with proper null checks
      const recentExpenses = summaryData.recentExpenses || [];
      const recent: ExpenseItem[] = recentExpenses.map((e: any) => ({
        id: e._id || e.id,
        title: e.description || e.title || "Unknown",
        amount: e.amount || 0,
        date: e.date || new Date().toISOString(),
      }));

      setExpenses(recent);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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
  const chartData = summary
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
    : { labels: [], datasets: [] };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <View className="mb-4 rounded-2xl bg-white p-4 shadow">
          <Text className="text-lg font-semibold">
            Total Expenses This Month
          </Text>
          <Text className="mt-2 text-2xl">
            ${summary?.totalExpenses?.toFixed(2) || "0.00"}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4 shadow">
          <Text className="mb-2 text-lg font-semibold">Budget Progress</Text>
          {summary?.budgetComparison && summary.budgetComparison.length > 0 ? (
            summary.budgetComparison.map((b) => {
              const progress = Math.min(b.spent / b.budget.amount, 1); // Cap at 1 for progress bar
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
