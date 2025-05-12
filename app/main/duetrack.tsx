import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import UserHeader from '@/components/UserHeader';
import supabase from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';
import Button from '@/components/Button';
import { hp, wp } from '@/helpers/common';
import { useCaptureAndShare } from '@/util/useCaptureAndShare';
import Icon from '@/assets/icons';

type UserBalance = {
  userId: string;
  name: string;
  netBalance: number;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

const DueTrack = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { captureRefView, handleCapture } = useCaptureAndShare();
  const [isAdmin, setIsAdmin] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  useEffect(() => {
    if (groupId) {
      calculateSettlements();
      checkGroupFinalizeStatus();
      checkIfAdmin();
    }
  }, [groupId]);

  const checkIfAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !groupId) return;
  
    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
  
    if (!error && data?.role === 'admin') {
      setIsAdmin(true);
    }
  };
  
  const calculateSettlements = async () => {
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, users(name)')
      .eq('group_id', groupId)
      .returns<{ user_id: string; users: { name: string } }[]>();

    const userNames: Record<string, string> = {};
    members?.forEach((m) => (userNames[m.user_id] = m.users.name));

    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, paid_by, total_amount')
      .eq('group_id', groupId);

    const userPaidMap: Record<string, number> = {};
    expenses?.forEach((e) => {
      if (e.paid_by) {
        userPaidMap[e.paid_by] = (userPaidMap[e.paid_by] || 0) + Number(e.total_amount);
      }
    });

    const expenseIds = expenses?.map((e) => e.id) || [];
    const { data: partitions } = await supabase
      .from('expense_partitions')
      .select('user_id, amount, expense_id')
      .in('expense_id', expenseIds);

    const userOwesMap: Record<string, number> = {};
    partitions?.forEach((p) => {
      userOwesMap[p.user_id] = (userOwesMap[p.user_id] || 0) + Number(p.amount);
    });

    const balances: UserBalance[] = members?.map((m) => {
      const paid = userPaidMap[m.user_id] || 0;
      const owes = userOwesMap[m.user_id] || 0;
      return {
        userId: m.user_id,
        name: userNames[m.user_id],
        netBalance: paid - owes,
      };
    }) || [];

    const creditors = balances.filter((u) => u.netBalance > 0).sort((a, b) => b.netBalance - a.netBalance);
    const debtors = balances.filter((u) => u.netBalance < 0).sort((a, b) => a.netBalance - b.netBalance);

    const newSettlements: Settlement[] = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(-debtor.netBalance, creditor.netBalance);

      newSettlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: parseFloat(amount.toFixed(2)),
      });

      debtor.netBalance += amount;
      creditor.netBalance -= amount;

      if (Math.abs(debtor.netBalance) < 0.01) i++;
      if (Math.abs(creditor.netBalance) < 0.01) j++;
    }

    setSettlements(newSettlements);
  };

  const checkGroupFinalizeStatus = async () => {
    const { data } = await supabase
      .from('groups')
      .select('is_finalized')
      .eq('id', groupId)
      .single();

    if (data) setIsFinalized(data.is_finalized);
  };

  const handleFinalizeSettlements = async () => {
    if (!groupId || settlements.length === 0) return;

    const { data: users } = await supabase.from('users').select('id, name');
    const nameToIdMap = users?.reduce((acc, u) => {
      acc[u.name] = u.id;
      return acc;
    }, {} as Record<string, string>);

    const inserts = settlements.map((s) => ({
      group_id: Number(groupId),
      from_user_id: nameToIdMap?.[s.from],
      to_user_id: nameToIdMap?.[s.to],
      amount: s.amount,
      is_paid: false,
    }));

    const { error } = await supabase.from('settlements').insert(inserts);

    if (!error) {
      const { error: updateError } = await supabase
        .from('groups')
        .update({ is_finalized: true })
        .eq('id', groupId);

      if (!updateError) {
        Alert.alert('Finalized', 'The Expenses are finalized');
        setIsFinalized(true);
      } else {
        console.error('Error updating group finalize status:', updateError);
      }
    } else {
      console.error('Error inserting settlements:', error);
    }
  };

  return (
    <ScreenWrapper>
      <UserHeader title="Due-List" />
      <ScrollView contentContainerStyle={styles.container}>
        <View ref={captureRefView} collapsable={false} style={styles.capture}>
          {settlements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No Expenses To settle.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={[styles.tableRow, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell]}>From</Text>
                <Text style={[styles.cell, styles.headerCell]}></Text>
                <Text style={[styles.cell, styles.headerCell]}>To</Text>
                <Text style={[styles.cell, styles.headerCell, { textAlign: 'right' }]}>Amount</Text>
              </View>
              {settlements.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.debtorCell]}>{item.from}</Text>
                  <Text style={styles.cell}>owes</Text>
                  <Text style={[styles.cell, styles.creditorCell]}>{item.to}</Text>
                  <Text style={[styles.cell, styles.amountCell]}>₹{item.amount}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottom}>
          {!isFinalized ? (
            isAdmin && (
              <Button title="Finalize" onPress={handleFinalizeSettlements} />
            )
          ) : (
            <Button
              title="Go to Settlements"
              onPress={() =>
                router.push({
                  pathname: '/main/settltment',
                  params: { groupId },
                })
              }
            />
          )}
          <Button icon={<Icon name='share' color="white" />} title="Share Snapshot" onPress={handleCapture} />
        </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    emptyState: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 100,
    },
    emptyText: {
      fontSize: 18,
      width:wp(100),
      textAlign:'center',
      color: theme.colors.textLight,
    },
    card: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.radius.md,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 16,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: theme.borderWidth.thick,
      borderBottomColor: theme.colors.border,
    },
    headerRow: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
      paddingBottom: 12,
    },
    cell: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    headerCell: {
      fontWeight: 'bold',
      color: theme.colors.textLight,
    },
    debtorCell: {
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    creditorCell: {
      fontWeight: 'bold',
      color: theme.colors.success,
    },
    amountCell: {
      textAlign: 'right',
      fontWeight: 'bold',
    },
    capture:{
      backgroundColor:theme.colors.background,
    },
    bottom: {
        marginTop: hp(1),
        marginBottom: hp(1),
        marginHorizontal:wp(5),
        gap: hp(1),
    },
  });

export default DueTrack;
