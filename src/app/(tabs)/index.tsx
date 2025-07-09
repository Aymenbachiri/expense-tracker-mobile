import { API_URL } from "@/src/lib/config/config";
import { useAuth } from "@clerk/clerk-expo";
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

  const { getToken, isSignedIn } = useAuth();

  async function fetchData() {
    try {
      setError(null);

      if (!isSignedIn) {
        setError("User is not signed in");
        return;
      }

      const token = await getToken();
      if (!token) {
        setError("Unable to get authentication token");
        return;
      }

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

      const analyticsUrl =
        `${API_URL}/api/analytics/summary?startDate=${startDateStr}` +
        `&endDate=${endDateStr}`;
      const expensesUrl = `${API_URL}/api/expenses`;

      const timeoutPromise = (ms: number) =>
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), ms),
        );

      const fetchWithTimeout = async (url: string, timeout = 30000) => {
        return Promise.race([
          fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          timeoutPromise(timeout),
        ]);
      };

      let summaryData: Summary | null = null;
      try {
        const sumRes = (await fetchWithTimeout(analyticsUrl)) as Response;

        if (sumRes.ok) {
          const sumJson = await sumRes.json();
          console.log("Analytics response:", sumJson);
          const raw = sumJson.success ? sumJson.data : sumJson;
          summaryData = raw as Summary;
        } else {
          const errorText = await sumRes.text();
          console.warn(
            `Analytics API returned non-OK: ${sumRes.status}`,
            errorText,
          );
        }
      } catch (analyticsError) {
        console.warn("Analytics fetch failed:", analyticsError);
      }

      const expRes = (await fetchWithTimeout(expensesUrl)) as Response;
      if (!expRes.ok) {
        const errText = await expRes.text();
        throw new Error(`Expenses API error: ${expRes.status} - ${errText}`);
      }
      const expJson = await expRes.json();
      console.log("Expenses response:", expJson);
      const expensesData = expJson.success ? expJson.data : expJson;

      setSummary(
        summaryData ?? {
          totalExpenses: 0,
          totalCount: 0,
          avgExpense: 0,
          expensesByCategory: [],
          recentExpenses: [],
          budgetComparison: [],
        },
      );

      if (
        summaryData?.recentExpenses &&
        summaryData.recentExpenses.length > 0
      ) {
        const recent: ExpenseItem[] = summaryData.recentExpenses.map(
          (e: any) => ({
            id: e._id,
            title: e.description,
            amount: e.amount,
            date: e.date,
          }),
        );
        setExpenses(recent);
      } else if (Array.isArray(expensesData)) {
        const fallback = (expensesData as any[]).slice(0, 10).map((e) => ({
          id: e._id || e.id,
          title: e.description || "Unknown",
          amount: e.amount,
          date: e.date,
        }));
        setExpenses(fallback);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      fetchData();
    } else {
      setLoading(false);
      setError("Please sign in to view your expenses");
    }
  }, [isSignedIn]);

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
