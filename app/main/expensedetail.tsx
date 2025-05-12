import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/helpers/common';
import supabase from '@/lib/supabase';
import UserHeader from '@/components/UserHeader';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';
import Loading from '@/components/Loading';
import Icon from '@/assets/icons';
import { useCaptureAndShare } from '@/util/useCaptureAndShare';

type Expense = {
  id: number;
  name: string;
  total_amount: number;
  category: string;
  paid_by: string;
  created_at: string;
};

type Partition = {
  user_id: string;
  amount: number;
};

type UserMap = Record<string, string>;

const ExpenseDetail: React.FC = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { expenseId } = useLocalSearchParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [partitions, setPartitions] = useState<Partition[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const { captureRefView, handleCapture } = useCaptureAndShare();
  

  useEffect(() => {
    if (!expenseId) return;

    const fetchDetails = async () => {
      setLoading(true);

      const { data: expenseData, error: expenseErr } = await supabase.from('expenses').select('*').eq('id', expenseId).single();

      if (expenseErr || !expenseData) {
        console.error('Error fetching expense:', expenseErr?.message);
        setLoading(false);
        return;
      }

      setExpense(expenseData);

      const { data: partitionsData, error: partitionErr } = await supabase.from('expense_partitions').select('user_id, amount').eq('expense_id', expenseId);

      if (partitionErr) {
        console.error('Error fetching partitions:', partitionErr.message);
        setLoading(false);
        return;
      }

      setPartitions(partitionsData || []);

      const userIds = new Set([
        expenseData.paid_by,
        ...(partitionsData || []).map((p) => p.user_id),
      ]);

      const { data: usersData, error: usersErr } = await supabase.from('users').select('id, name').in('id', Array.from(userIds));

      if (usersErr) {
        console.error('Error fetching users:', usersErr.message);
        setLoading(false);
        return;
      }

      const map: UserMap = {};
      usersData?.forEach((user) => {
        map[user.id] = user.name;
      });

      setUserMap(map);
      setLoading(false);
    };

    fetchDetails();
  }, [expenseId]);

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <UserHeader title="Expense Details" />
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <Loading />
        ) : expense ? (
          <View ref={captureRefView} collapsable={false} style={styles.capture}>
          <View style={styles.card}>
            <Pressable style={styles.share} onPress={handleCapture}><Icon name='share'/>
            </Pressable>
            <Text style={styles.name}>{expense.name}</Text>
            <Text style={styles.amount}>₹{expense.total_amount.toFixed(2)}</Text>
            <View style={styles.infoTable}>
              <InfoRow label="Category" value={expense.category} />
              <InfoRow label="Paid By" value={userMap[expense.paid_by] || 'Unknown'} />
              <View style={styles.row}>
                <View style={styles.infoBlock}>
                  <Text style={styles.label}>Split Between</Text>
                  {partitions.map((p, idx) => (
                    <View key={idx} style={styles.splitRow}>
                      <Text style={styles.splitName}>{userMap[p.user_id] || 'Unknown'}</Text>
                      <Text style={styles.splitAmount}>₹{p.amount.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <InfoRow label="Date" value={new Date(expense.created_at).toLocaleDateString()} />
            </View>
          </View>
          </View>
        ) : (
          <Text style={styles.errorText}>Expense not found.</Text>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ExpenseDetail;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    card: {
      marginTop: hp(2),
      marginBottom: hp(2),
      borderRadius: 5,
      padding: wp(5),
      width: wp(90),
      alignSelf: 'center',
      backgroundColor: theme.colors.cardBackground, // Add card background color
    },
    name: {
      fontSize: hp(2.4),
      fontWeight: theme.fonts.bold, // Use theme font weight
      marginBottom: hp(0.5),
      color: theme.colors.text, // Add text color
    },
    amount: {
      fontSize: hp(2.2),
      fontWeight: theme.fonts.semibold, // Use theme font weight
      color: theme.colors.success, // Use theme success color
      marginBottom: hp(1.5),
    },
    infoTable: {
      borderTopWidth: 1,
      borderColor: theme.colors.border, // Use theme border color
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: hp(1.2),
      borderBottomWidth: 1,
      borderColor: theme.colors.border, // Use theme border color
    },
    label: {
      fontSize: hp(1.85),
      fontWeight: theme.fonts.medium, // Use theme font weight
      color: theme.colors.textLight, // Use theme secondary text color
      width: wp(30),
    },
    value: {
      fontSize: hp(1.85),
      color: theme.colors.text, // Add text color
      flex: 1,
      textAlign: 'right',
    },
    splitList: {
      flex: 1,
      alignItems: 'flex-end',
      gap: hp(0.3),
    },
    errorText: {
      fontSize: hp(2),
      textAlign: 'center',
      color: theme.colors.textLight, // Use theme secondary text color
      marginTop: hp(10),
    },
    splitRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: hp(0.5),
    },
    splitName: {
      fontSize: hp(1.9),
      color: theme.colors.text, // Add text color
      flex: 1,
    },
    splitAmount: {
      fontSize: hp(1.9),
      color: theme.colors.text, // Add text color
      fontWeight: theme.fonts.semibold, // Use theme font weight
      marginLeft: wp(2),
    },
    infoBlock: {
      marginBottom: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border, // Use theme border color
      paddingBottom: hp(1),
    },
    share:{
      alignSelf:'flex-end',
    },
    capture:{
      backgroundColor:theme.colors.background,
      height:'100%',
    },
  });

