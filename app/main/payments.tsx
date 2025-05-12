import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';
import UserHeader from '@/components/UserHeader';
import Loading from '@/components/Loading';

interface Settlement {
  id: string;
  amount: number;
  payment_mode: 'upi' | 'cash' | null;
  is_paid: boolean;
  created_at: string;
  paid_at: string;
  from_user: { id: string; name: string } | null;
  to_user: { id: string; name: string } | null;
  points_earned: number | null;
  group_id: string; // The group ID in settlements
}

interface Group {
  id: string;
  name: string; // The name of the group
}

const Payments = () => {
  const { user } = useAuth(); // user can be null here
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [payments, setPayments] = useState<Settlement[]>([]);
  const [groups, setGroups] = useState<Map<string, string>>(new Map()); // To map group_id to group name
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch payments
      const { data, error } = await supabase
        .from('settlements')
        .select('*, to_user:to_user_id(*), group_id')
        .eq('is_paid', true) // Only paid settlements
        .not('paid_at', 'is', null) // Ensure paid_at is not null
        .eq('from_user_id', user?.id) // Ensure the payments are from the current logged-in user
        .order('paid_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        Alert.alert('Error', 'Failed to fetch payments');
        return;
      }

      // Step 2: Fetch group names based on group_ids from settlements
      const groupIds = Array.from(new Set(data?.map((payment) => payment.group_id) || []));
      const groupData = await fetchGroupNames(groupIds);
      setGroups(groupData);

      setPayments(data || []);
    } catch (error) {
      console.error('Error during fetchPayments:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching payments.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Fetch group names from the groups table using group_ids
  const fetchGroupNames = async (groupIds: string[]) => {
    const { data, error } = await supabase
      .from('groups')
      .select('id, name')
      .in('id', groupIds);

    if (error) {
      console.error('Error fetching group names:', error);
      return new Map();
    }

    // Create a map to match group_ids with group names
    const groupMap = new Map<string, string>();
    data?.forEach((group) => {
      groupMap.set(group.id, group.name);
    });

    return groupMap;
  };

  const renderPaymentItem = ({ item }: { item: Settlement }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{groups.get(item.group_id) || 'Unknown Group'}</Text>
      <Text style={styles.tableCell}>{item.to_user?.name || 'Unknown'}</Text>
      <Text style={styles.tableCell}>₹{item.amount}</Text>
      <Text style={styles.tableCell}>{new Date(item.paid_at).toLocaleDateString()}</Text>
      <Text style={styles.tableCell}>{item.payment_mode ?? 'Not selected'}</Text>
      <Text style={styles.tableCell}>{item.points_earned || 0}</Text>
    </View>
  );

  if (!user) {
    return (
      <ScreenWrapper>
        <Text style={styles.emptyAuthText}>You must be logged in to view your payments.</Text>
      </ScreenWrapper>
    );
  }

  if (loading) return <Loading />;

  return (
    <ScreenWrapper>
      <UserHeader title="Payments" />
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Group</Text>
          <Text style={styles.tableHeaderCell}>To</Text>
          <Text style={styles.tableHeaderCell}>Amount</Text>
          <Text style={styles.tableHeaderCell}>Paid On</Text>
          <Text style={styles.tableHeaderCell}>Payment Mode</Text>
          <Text style={styles.tableHeaderCell}>Points Earned</Text>
        </View>
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderPaymentItem}
          ListEmptyComponent={<Text style={styles.emptyListText}>No payments made yet!</Text>}
        />
      </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    tableContainer: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      marginBottom: theme.spacing.sm,
    },
    tableHeaderCell: {
      flex: 1,
      color: theme.colors.background,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fonts.semibold,
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
    },
    tableCell: {
      flex: 1,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text,
      textAlign: 'center',
    },
    emptyListText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.textLight,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    emptyAuthText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.textLight,
      textAlign: 'center',
      padding: theme.spacing.lg,
    },
  });

export default Payments;
