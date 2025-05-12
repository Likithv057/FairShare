import React, { useEffect, useState } from "react";
import { StyleSheet, Alert, View, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { hp, wp } from "@/helpers/common";
import ScreenWrapper from "@/components/ScreenWrapper";
import UserHeader from "@/components/UserHeader";
import Input from "@/components/Input";
import Button from "@/components/Button";
import supabase from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { categorys } from "@/assets/Data/category";
import Dropdown from "@/components/DropDown";
import MultiSelect from "@/components/MultiSelect";
import Icon from "@/assets/icons";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";

type MemberOption = {
  label: string;
  value: string;
};

const EditEqualSplit: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { groupId, expenseId } = useLocalSearchParams();
  const [expenseName, setExpenseName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchMembers = async () => {
    const { data: memberData, error } = await supabase
      .from("group_members")
      .select("user_id, users(name)")
      .eq("group_id", groupId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    const memberList: MemberOption[] = memberData.map((m: any) => ({
      label: m.users.name,
      value: m.user_id,
    }));

    setMembers(memberList);
  };

  const fetchExpenseDetails = async () => {
    const { data: expense, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", expenseId)
      .single();

    if (error) {
      Alert.alert("Error fetching expense", error.message);
      return;
    }

    setExpenseName(expense.name);
    setTotalAmount(expense.total_amount.toString());
    setCategory(categorys.some(c => c.value === expense.category) ? expense.category : "Other");
    if (!categorys.some(c => c.value === expense.category)) {
      setCustomCategory(expense.category);
    }
    setPaidBy(expense.paid_by);

    const { data: partitions, error: partitionError } = await supabase
      .from("expense_partitions")
      .select("user_id")
      .eq("expense_id", expenseId);

    if (partitionError) {
      Alert.alert("Error", partitionError.message);
    } else {
      setSelectedMembers(partitions.map(p => p.user_id));
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchExpenseDetails();
  }, [groupId, expenseId]);

  const handleUpdate = async () => {
    const amount = parseFloat(totalAmount);
    const finalCategory = category === "Other"
      ? customCategory.trim().replace(/\s+/g, " ")
      : category;

    if (
      !expenseName ||
      !totalAmount ||
      isNaN(amount) ||
      amount <= 0 ||
      !category ||
      (category === "Other" && !customCategory.trim()) ||
      !paidBy ||
      selectedMembers.length === 0
    ) {
      Alert.alert("Error", "Please fill all fields correctly");
      return;
    }

    const share = parseFloat((amount / selectedMembers.length).toFixed(2));

    const { error: updateError } = await supabase
      .from("expenses")
      .update({
        name: expenseName,
        total_amount: amount,
        category: finalCategory,
        paid_by: paidBy,
      })
      .eq("id", expenseId);

    if (updateError) {
      Alert.alert("Error updating expense", updateError.message);
      return;
    }

    // Delete existing partitions before inserting updated ones
    await supabase
      .from("expense_partitions")
      .delete()
      .eq("expense_id", expenseId);

    const newPartitions = selectedMembers.map((userId) => ({
      expense_id: expenseId,
      user_id: userId,
      amount: share,
    }));

    const { error: partitionError } = await supabase
      .from("expense_partitions")
      .insert(newPartitions);

    if (partitionError) {
      Alert.alert("Error", partitionError.message);
    } else {
      Alert.alert("Success", "Expense updated!");
      router.back();
    }
  };

  return (
    <ScreenWrapper>
      <UserHeader title="Edit Expense" />
      <ScrollView style={styles.container}>
        <View style={styles.form}>
        <Dropdown
          icon={<Icon name="expenses" />}
          label="Category"
          options={categorys}
          selectedValue={category}
          onSelect={setCategory}
        />

        {category === "Other" && (
          <Input
            icon={<Icon name="expenses" />}
            placeholder="Enter custom category"
            value={customCategory}
            onChangeText={setCustomCategory}
          />
        )}

        <Input
          icon={<Icon name="expenses" />}
          placeholder="Expense Name"
          value={expenseName}
          onChangeText={setExpenseName}
        />
        <Input
          icon={<Icon name="expenses" />}
          placeholder="Total Amount"
          keyboardType="decimal-pad"
          value={totalAmount}
          onChangeText={setTotalAmount}
        />
        <Dropdown
          icon={<Icon name="user" />}
          label="Paid By"
          options={members}
          selectedValue={paidBy}
          onSelect={setPaidBy}
        />
        <MultiSelect
          icon={<Icon name="group" />}
          label="Select Members"
          options={members}
          selected={selectedMembers}
          onChange={setSelectedMembers}
        />
        <Button title="Update Expense" onPress={handleUpdate} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(5),
      backgroundColor: theme.colors.background,
    },
    form:{
      gap: theme.spacing.md,
    }
  });

export default EditEqualSplit;
