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

  async function fetchData() {
    try {
      const [sumRes, expRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/summary?categoryId=all`),
        fetch(`${API_URL}/api/expenses`),
      ]);

      if (!sumRes.ok || !expRes.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const sumJson = await sumRes.json();
      const expJson = await expRes.json();

      setSummary(sumJson.data as Summary);

      const recent: ExpenseItem[] = (sumJson.data.recentExpenses as any[]).map(
        (e) => ({
          id: e._id,
          title: e.description,
          amount: e.amount,
          date: e.date,
        }),
      );
      setExpenses(recent);
    } catch (error) {
      console.error("Error fetching data:", error);
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
            ${summary?.totalExpenses.toFixed(2)}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4 shadow">
          <Text className="mb-2 text-lg font-semibold">Budget Progress</Text>
          {summary?.budgetComparison.map((b) => {
            const progress = b.spent / b.budget.amount;
            return (
              <View key={b.budget._id} className="mb-3">
                <Text>
                  {b.budget.name}: ${b.spent.toFixed(2)} / $
                  {b.budget.amount.toFixed(2)}
                </Text>
                <ProgressBar
                  progress={progress}
                  style={{
                    height: 8,
                    borderRadius: 4,
                  }}
                />
              </View>
            );
          })}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
