import { API_URL } from "@/src/lib/config/config";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

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

type UseAnalyticsSummaryReturn = {
  loading: boolean;
  summary: Summary | null;
  expenses: ExpenseItem[];
  error: string | null;
  fetchData: () => Promise<void>;
};

export function useAnalyticsSummary(): UseAnalyticsSummaryReturn {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { getToken, isSignedIn } = useAuth();

  async function fetchData() {
    try {
      setError(null);

      if (!isSignedIn) {
        const msg = "User is not signed in";
        setError(msg);
        Toast.show({ type: "error", text1: "Auth Error", text2: msg });
        return;
      }

      const token = await getToken();
      if (!token) {
        const msg = "Unable to get authentication token";
        setError(msg);
        Toast.show({ type: "error", text1: "Auth Error", text2: msg });
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
          const raw = sumJson.success ? sumJson.data : sumJson;
          summaryData = raw as Summary;
        } else {
          const errorText = await sumRes.text();
          Toast.show({
            type: "error",
            text1: "Analytics Error",
            text2: `Failed to fetch analytics: ${errorText}`,
          });
        }
      } catch (analyticsError) {
        Toast.show({
          type: "error",
          text1: "Analytics Error",
          text2:
            analyticsError instanceof Error
              ? analyticsError.message
              : String(analyticsError),
        });
      }

      const expRes = (await fetchWithTimeout(expensesUrl)) as Response;
      if (!expRes.ok) {
        const errText = await expRes.text();
        Toast.show({
          type: "error",
          text1: "Expenses Error",
          text2: `Failed to fetch expenses: ${expRes.status} - ${errText}`,
        });
        throw new Error(`Expenses API error: ${expRes.status} - ${errText}`);
      }
      const expJson = await expRes.json();
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
      setError(err instanceof Error ? err.message : String(err));
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err instanceof Error ? err.message : "An unknown error occurred",
      });
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
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to view your expenses",
      });
    }
  }, [isSignedIn]);

  return { loading, summary, expenses, error, fetchData };
}
