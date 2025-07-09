import { useAuth } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Platform } from "react-native";
import { API_URL } from "../config/config";
import {
  createExpenseSchema,
  type ExpenseFormValues,
} from "../schema/expense-schema";

type CategoryResponse = { data: { _id: string; name: string }[] };

export function useAddExpense(
  onSuccess: () => void,
  onClose: () => void,
  visible: boolean,
) {
  const [categories, setCategories] = useState<CategoryResponse>({ data: [] });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { getToken } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      notes: "",
      category: "",
      date: new Date(),
    },
  });

  const watchedDate = watch("date");

  async function getCategories() {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/category`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setCategories(result);
    } catch (error) {
      console.error("failed to get Categories: ", error);
    }
  }

  const onSubmit = async (data: ExpenseFormValues) => {
    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      let msg = "Failed to add expense";
      if (typeof result.message === "string") {
        msg = result.message;
      } else if (Array.isArray(result.message)) {
        msg = result.message
          .map((e: any) =>
            typeof e === "string" ? e : e.message || JSON.stringify(e),
          )
          .join("; ");
      }

      if (result.success) {
        Alert.alert("Success", "Expense added successfully");
        reset();
        onSuccess();
        onClose();
      } else {
        Alert.alert("Failed to add expense", msg);
        console.error("Failed to add expense", msg);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add expense. Please try again.");
      console.error("Error adding expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setValue("date", selectedDate);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (visible) {
      reset({
        amount: 0,
        description: "",
        notes: "",
        category: "",
        date: new Date(),
      });
    }
  }, [visible, reset]);

  return {
    control,
    errors,
    loading,
    setShowDatePicker,
    showDatePicker,
    watchedDate,
    onChangeDate,
    handleSubmit,
    onSubmit,
    categories,
    formatDate,
  };
}
