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

const CustomSplit: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { groupId } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [expenseName, setExpenseName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<{ [userId: string]: string }>({});

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, users(name)")
      .eq("group_id", groupId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    const memberList = data.map((m: any) => ({
      label: m.users.name,
      value: m.user_id,
    }));

    setMembers(memberList);
    setPaidBy(user?.id ?? "");
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const handleAmountChange = (userId: string, amount: string) => {
    setCustomAmounts((prev) => ({ ...prev, [userId]: amount }));
  };

  const handleSubmit = async () => {
    const amount = parseFloat(totalAmount);
    const finalCategory =
      category === "Other"
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

    // Validate total custom amounts
    const totalCustom = selectedMembers.reduce(
      (sum, id) => sum + parseFloat(customAmounts[id] || "0"),
      0
    );

    if (parseFloat(totalCustom.toFixed(2)) !== parseFloat(amount.toFixed(2))) {
      Alert.alert("Error", "Custom amounts must sum to total amount");
      return;
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert([
        {
          group_id: parseInt(groupId as string),
          category: finalCategory,
          name: expenseName,
          total_amount: amount,
          paid_by: paidBy,
          split_type: "custom", // Add split_type as "custom"
        },
      ])
      .select()
      .single();

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    const partitions = selectedMembers.map((userId) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: parseFloat(customAmounts[userId] || "0"),
    }));

    const { error: partitionError } = await supabase
      .from("expense_partitions")
      .insert(partitions);

    if (partitionError) {
      Alert.alert("Error", partitionError.message);
    } else {
      Alert.alert("Success", "Expense added!");
      router.back();
    }
  };

  return (
    <ScreenWrapper>
      <UserHeader title="Custom Split" />
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

        {selectedMembers.map((memberId) => {
          const memberName = members.find((m) => m.value === memberId)?.label;
          return (
            <Input
              key={memberId}
              icon={<Icon name="user" />}
              placeholder={`Amount for ${memberName}`}
              keyboardType="decimal-pad"
              value={customAmounts[memberId] || ""}
              onChangeText={(val) => handleAmountChange(memberId, val)}
            />
          );
        })}
        <Button title="Create Expense" onPress={handleSubmit} />
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

export default CustomSplit;
