import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, ScrollView } from 'react-native';
import UserHeader from '@/components/UserHeader';
import { hp, wp } from '@/helpers/common';
import ExpenseCard from '@/components/ExpenseCard';
import Icon from '@/assets/icons';
import { useTheme } from '@/context/ThemeContext';
import supabase from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import ScreenWrapper from '@/components/ScreenWrapper';
import Dropdown from '@/components/DropDown';
import { expenseOptions } from '@/assets/Data/category';
import Button from '@/components/Button';
import Nav from '@/components/Nav';

type Expense = {
  id: number;
  name: string;
  total_amount: number;
  category: string;
  paid_by: string;
  created_at: string;
};

const Expenses: React.FC = () => {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [expenseType, setExpenseType] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error.message);
      return;
    }

    setExpenses(data || []);
  };

  const fetchAdminStatus = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    setUserId(user.id);

    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error.message);
      return;
    }

    setIsAdmin(data?.role === 'admin');
  };

  const fetchGroupStatus = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('is_finalized')
      .eq('id', groupId)
      .single();

    if (error) {
      console.error('Error fetching group status:', error.message);
      return;
    }

    setIsFinalized(data?.is_finalized || false);
  };

  const handleDeleteExpense = (expenseId: number) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('expenses')
              .delete()
              .eq('id', expenseId);

            if (error) {
              console.error('Error deleting expense:', error.message);
              return;
            }

            fetchExpenses();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddExpense = () => {
    if (expenseType === 'equal') {
      router.push({ pathname: '/main/equalsplit', params: { groupId } });
    } else if (expenseType === 'custom') {
      router.push({ pathname: '/main/customsplit', params: { groupId } });
    } else {
      Alert.alert('Select Expense Type', 'Please select the type of expense to add.');
    }
  };

  const handleEditPress = async (expenseId: number) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('split_type')
      .eq('id', expenseId)
      .single();

    if (error) {
      Alert.alert('Error', 'Failed to fetch expense details');
      return;
    }

    if (data?.split_type === 'equal') {
      router.push({
        pathname: '/main/editequal',
        params: { groupId, expenseId },
      });
    } else if (data?.split_type === 'custom') {
      router.push({
        pathname: '/main/editcustom',
        params: { groupId, expenseId },
      });
    } else {
      Alert.alert('Unsupported split type');
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchExpenses();
      fetchAdminStatus();
      fetchGroupStatus();
    }
  }, [groupId]);

  return (
    <ScreenWrapper>
      <UserHeader title="Expenses" />
      <View style={styles.container}>
        <Text style={styles.title}>Manage Your Group Expenses</Text>
        {isAdmin && !isFinalized && (
          <View style={styles.addExpenseContainer}>
            <Dropdown
              icon={<Icon name="expenses" />}
              label="Select Expense Type To Add"
              options={expenseOptions}
              selectedValue={expenseType || ''}
              onSelect={(value) => setExpenseType(value)}
              actionComponent={
                <Icon
                  name="add"
                  color={theme.colors.success}
                  onPress={handleAddExpense}
                />
              }
            />
          </View>
        )}

        {isFinalized && (
          <Text style={{ color: theme.colors.error, marginTop: theme.spacing.sm }}>
            Expenses are finalized. No new expenses can be added or modified.
          </Text>
        )}

        <ScrollView style={styles.expenseListContainer} contentContainerStyle={styles.expenseListContent}>
          {expenses.length === 0 ? (
            <Text style={styles.noExpenseText}>No expenses added yet.</Text>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                name={expense.name}
                amount={expense.total_amount}
                category={expense.category}
                icon={<Icon name="expenses" />}
                onPress={() =>
                  router.push({
                    pathname: '/main/expensedetail',
                    params: { expenseId: expense.id, groupId },
                  })
                }
                actionComponent={
                  isAdmin && !isFinalized && (
                    <View style={{ flexDirection: 'row', gap: wp(6) }}>
                      <Icon
                        name="edit"
                        color={theme.colors.primaryDark}
                        onPress={() => handleEditPress(expense.id)}
                      />
                      <Icon
                        name="delete"
                        color={theme.colors.error}
                        onPress={() => handleDeleteExpense(expense.id)}
                      />
                    </View>
                  )
                }
              />
            ))
          )}
        </ScrollView>

        <View style={styles.navbottom}>
          <Nav
            actionComponent={
              <>
                <View style={styles.nav}>
                  <Icon name="list" 
                  onPress={() => router.push({ pathname: '/main/duetrack', params: { groupId } })}/>
                  <Text style={styles.navText}>Due-List</Text>
                </View>
                <View style={styles.nav}>
                  <Icon name="pie"
                   onPress={() => router.push({ pathname: '/main/expensesanalysis', params: { groupId } })}/>
                  <Text style={styles.navText}>Analysis</Text>
                </View>
              </>
            }
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: wp(4),
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: hp(2.2),
      fontWeight: theme.fonts.semibold,
      color: theme.colors.text,
    },
    expenseListContainer: {
      flexGrow: 1, // Make the ScrollView expand to fill available space
      maxHeight: hp(80),
    },
    expenseListContent: {
      alignItems: 'center', // Center the content within the ScrollView
      paddingBottom: hp(1), // Add padding at the bottom to prevent overlap
      marginTop: hp(1),
    },
    noExpenseText: {
      fontSize: hp(1.8),
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    addExpenseContainer: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    navbottom: {
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    nav: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: hp(1),
    },
    navText: {
      marginTop: hp(0.5),
      fontSize: hp(1.6),
      color: theme.colors.text,
      textAlign:'center',
      width:wp(20),
    },
  });

export default Expenses;

