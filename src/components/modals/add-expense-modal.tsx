import { useAddExpense } from "@/src/lib/hooks/use-add-expense";
import { cn } from "@/src/lib/utils/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

export default function AddExpenseModal({
  visible,
  onClose,
  onSuccess,
}: Props): React.JSX.Element {
  const {
    control,
    errors,
    loading,
    setShowDatePicker,
    showDatePicker,
    watchedDate,
    onChangeDate,
    handleSubmit,
    categories,
    onSubmit,
    formatDate,
  } = useAddExpense(onSuccess, onClose, visible);

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
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Amount *
              </Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className={cn(
                        "mb-1 rounded-lg border px-3 py-2 text-base",
                        errors.amount ? "border-red-500" : "border-gray-300",
                      )}
                      placeholder="0.00"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                    {errors.amount && (
                      <Text className="mb-2 text-red-500">
                        {errors.amount.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Description *
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className={cn(
                        "mb-1 rounded-lg border px-3 py-2 text-base",
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                      placeholder="Enter description"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      maxLength={200}
                      editable={!loading}
                    />
                    {errors.description && (
                      <Text className="mb-2 text-red-500">
                        {errors.description.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Category *
              </Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <>
                    <View
                      className={cn(
                        "mb-1 rounded-lg border",
                        errors.category ? "border-red-500" : "border-gray-300",
                      )}
                    >
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        enabled={!loading}
                      >
                        <Picker.Item label="Select a category..." value="" />
                        {categories.data.map((cat) => (
                          <Picker.Item
                            key={cat._id}
                            label={cat.name}
                            value={cat._id}
                          />
                        ))}
                      </Picker>
                    </View>
                    {errors.category && (
                      <Text className="mb-2 text-red-500">
                        {errors.category.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Date *
              </Text>
              <TouchableOpacity
                className={cn(
                  "mb-1 rounded-lg border px-3 py-2",
                  errors.date ? "border-red-500" : "border-gray-300",
                )}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Text className="text-base text-gray-800">
                  {formatDate(watchedDate)}
                </Text>
              </TouchableOpacity>
              {errors.date && (
                <Text className="mb-2 text-red-500">{errors.date.message}</Text>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(watchedDate)}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Notes (Optional)
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className={cn(
                        "mb-1 rounded-lg border px-3 py-2 text-base",
                        errors.notes ? "border-red-500" : "border-gray-300",
                      )}
                      placeholder="Add notes..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={3}
                      maxLength={500}
                      editable={!loading}
                    />
                    {errors.notes && (
                      <Text className="mb-2 text-red-500">
                        {errors.notes.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </ScrollView>

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
              className={cn(
                "ml-2 flex-1 rounded-lg py-3",
                loading ? "bg-gray-400" : "bg-blue-600",
              )}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text className="text-center text-base font-medium text-white">
                {loading ? <ActivityIndicator color="white" /> : "Add Expense"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
