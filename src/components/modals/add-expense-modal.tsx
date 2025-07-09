import { API_URL } from "@/src/lib/config/config";
import { useAuth } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

type CategoryResponse = { data: { _id: string; name: string }[] };

export default function AddExpenseModal({
  visible,
  onClose,
  onSuccess,
}: Props): React.JSX.Element {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    notes: "",
    category: "",
    date: new Date().toISOString(),
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryResponse>({ data: [] });
  const { getToken } = useAuth();

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

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.category) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
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
        setFormData({
          amount: "",
          description: "",
          notes: "",
          category: "",
          date: new Date().toISOString(),
        });
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
      setFormData({ ...formData, date: selectedDate.toISOString() });
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  console.log("categories: ", categories);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-black/50 p-4">
        <View className="mx-4 rounded-2xl bg-white p-6 shadow-lg">
          <Text className="mb-4 text-xl font-bold text-gray-800">
            Add New Expense
          </Text>

          <ScrollView className="max-h-96">
            {/* Amount Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Amount *
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-3 py-2 text-base"
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData({ ...formData, amount: text })
                }
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Description *
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-3 py-2 text-base"
                placeholder="Enter description"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                maxLength={200}
                editable={!loading}
              />
            </View>

            {/* Category Selection */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Category *
              </Text>
              <View className="rounded-lg border border-gray-300">
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(itemValue) =>
                    setFormData({ ...formData, category: itemValue })
                  }
                  enabled={!loading}
                >
                  <Picker.Item label="Select a category..." value="" />
                  {categories ? (
                    categories.data.map((cat) => (
                      <Picker.Item
                        key={cat._id}
                        label={cat.name}
                        value={cat._id}
                      />
                    ))
                  ) : (
                    <ActivityIndicator size="small" />
                  )}
                </Picker>
              </View>
            </View>

            {/* Date Selection */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Date *
              </Text>
              <TouchableOpacity
                className="rounded-lg border border-gray-300 px-3 py-2"
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Text className="text-base text-gray-800">
                  {formatDate(formData.date)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.date)}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            {/* Notes Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Notes (Optional)
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-3 py-2 text-base"
                placeholder="Add notes..."
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                multiline
                numberOfLines={3}
                maxLength={500}
                editable={!loading}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="mt-4 flex-row justify-between">
            <TouchableOpacity
              className="mr-2 flex-1 rounded-lg border border-gray-300 py-3"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-center text-base font-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="ml-2 flex-1 rounded-lg bg-blue-600 py-3"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-medium text-white">
                  Add Expense
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
