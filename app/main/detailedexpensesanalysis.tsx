import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import supabase from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import SimplePieChart from '@/components/SimplePieChart';
import ScreenWrapper from '@/components/ScreenWrapper';
import UserHeader from '@/components/UserHeader';
import Loading from '@/components/Loading';
import { Theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import Button from '@/components/Button';
import Icon from '@/assets/icons';
import { useCaptureAndShare } from '@/util/useCaptureAndShare';

type CategoryData = {
  category: string;
  userContributions: { userName: string; totalSpent: number }[];
};

export default function DetailedExpenseAnalysis() {
  const { groupId } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { captureRefView, handleCapture } = useCaptureAndShare();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Fetch all expenses for the group
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('id, category')
      .eq('group_id', groupId);

    if (expenseError) {
      setLoading(false);
      setError('Error fetching expenses: ' + expenseError.message);
      return;
    }

    // Fetch all expense partitions for the expenses in this group
    const { data: partitions, error: partitionError } = await supabase
      .from('expense_partitions')
      .select('user_id, amount, expense_id')
      .in('expense_id', expenses.map((expense) => expense.id));

    if (partitionError) {
      setLoading(false);
      setError('Error fetching partitions: ' + partitionError.message);
      return;
    }

    // Fetch user names from the users table based on user_ids
    const userIds = [...new Set(partitions.map((partition) => partition.user_id))];
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds);

    if (userError) {
      setLoading(false);
      setError('Error fetching user names: ' + userError.message);
      return;
    }

    // Map user_id to user_name
    const userNameMap = new Map(users.map((user) => [user.id, user.name]));

    // Group partitions by category and user
    const categoryContributions: CategoryData[] = expenses.reduce((acc: CategoryData[], expense) => {
      const partitionsForExpense = partitions.filter((partition) => partition.expense_id === expense.id);
      partitionsForExpense.forEach((partition) => {
        const user = partition.user_id;
        const userName = userNameMap.get(user) || 'Unknown User'; // Get the user name or 'Unknown User' if not found
        const amount = partition.amount;

        // Find the category entry for this expense or create it
        let categoryEntry = acc.find((category) => category.category === expense.category);
        if (!categoryEntry) {
          categoryEntry = { category: expense.category, userContributions: [] };
          acc.push(categoryEntry);
        }

        // Add the user's contribution for this category (make sure to aggregate correctly)
        const userContribution = categoryEntry.userContributions.find((uc) => uc.userName === userName);
        if (userContribution) {
          // Instead of adding the amount multiple times, update the total if the user is already present
          userContribution.totalSpent += amount;
        } else {
          categoryEntry.userContributions.push({
            userName: userName,
            totalSpent: amount,
          });
        }
      });
      return acc;
    }, []);

    setCategoryData(categoryContributions);
    setLoading(false);
  };


  useEffect(() => {
    if (groupId) {
      fetchData();
    } else {
      setLoading(false);
      setError('Group ID not found.');
    }
  }, [groupId]);

  return (
    <ScreenWrapper>
      <UserHeader title="Detailed-Analysis" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} >
        <View ref={captureRefView} collapsable={false} style={styles.capture}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Detailed Expense Distribution
        </Text>
        {loading ? (
          <Loading />
        ) : error ? (
          <Text style={[styles.noDataText, { color: theme.colors.error }]}>Error: {error}</Text>
        ) : categoryData.length === 0 ? (
          <Text style={[styles.noDataText, { color: theme.colors.textLight }]}>No expenses to analyze.</Text>
        ) : (
          categoryData.map((category) => (
            <View key={category.category} style={styles.categoryContainer}>
              <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                {category.category}
              </Text>
              <SimplePieChart
                data={category.userContributions.map((user) => ({
                  label: `${user.userName}`,
                  value: user.totalSpent,
                }))}
              />
            </View>
          ))
        )}
        </View>
        </ScrollView>
        <View style={styles.bottom}>
        <Button title="Regenerate Report" onPress={fetchData} />
        <Button icon={<Icon name='share' color='white' />} title="Share Snapshot" onPress={handleCapture} />
        </View>
    </ScreenWrapper>
  );
}

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    container: {
      flexGrow: 1, // Ensure the container can grow to accommodate content
      alignItems: 'center',
      paddingHorizontal: wp(4),
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    capture:{
      backgroundColor:theme.colors.background,
      paddingVertical:hp(2),
    },
    title: {
      textAlign: 'center', 
      fontSize: 20,
      marginBottom:hp(2),
      fontWeight: 'bold',
    },
    categoryContainer: {
      marginBottom: theme.spacing.lg,
      alignItems: 'center'
    },
    categoryTitle: {
      fontSize: 18,
      marginVertical: 10,
      fontWeight: 'bold',
      textAlign: 'left'
    },
    bottom:{
      marginTop: hp(1),
      marginBottom: hp(1),
      marginHorizontal: wp(5),
      gap: hp(1),
    },
    noDataText: {
      marginVertical: 20,
    },
  });

