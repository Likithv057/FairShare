import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import { useTheme } from '@/context/ThemeContext';
import SimplePieChart from '@/components/SimplePieChart';
import ScreenWrapper from '@/components/ScreenWrapper';
import UserHeader from '@/components/UserHeader';
import { Theme } from '@/constants/theme';
import Loading from '@/components/Loading';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helpers/common';
import Icon from '@/assets/icons';
import { useCaptureAndShare } from '@/util/useCaptureAndShare';

type Expense = {
  category: string;
  total_amount: number;
};

export default function ExpenseAnalysis() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [chartData, setChartData] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { captureRefView, handleCapture } = useCaptureAndShare();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const { data: expenseData, error } = await supabase
      .from('expenses')
      .select('category, total_amount')
      .eq('group_id', groupId);

    if (error) {
      setLoading(false);
      setError('Error fetching data: ' + error.message);
      return;
    }

    const grouped = expenseData.reduce((acc: Record<string, number>, curr: Expense) => {
      acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.total_amount.toString());
      return acc;
    }, {});

    const formatted = Object.entries(grouped).map(([label, value]) => ({ label, value }));
    
    if (formatted.length === 0) {
      setError('No expenses found for this group.');
    }

    setChartData(formatted);
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
      <UserHeader title="Analysis"/>
      <ScrollView contentContainerStyle={styles.container}>
        <View ref={captureRefView} collapsable={false} style={styles.capture}>
        <Text style={styles.title}>
          Category-wise Expense Analysis
        </Text>
        {loading ? (
          <Loading/>
        ) : error ? (
          <Text style={[styles.noDataText, { color: theme.colors.textLight }]}>Error: {error}</Text>
        ) : chartData.length === 0 ? (
          <Text style={[styles.noDataText, { color: theme.colors.textLight }]}>No expenses to analyze.</Text>
        ) : (
          <SimplePieChart data={chartData} />
        )}
        </View>
      </ScrollView>
      <View style={styles.bottom}>
        <Button title="Regenerate Report" onPress={fetchData} />
        <Button
          title="Detailed Expense Analysis"
          onPress={() => router.push({ pathname:'/main/detailedexpensesanalysis', params: { groupId } })}
        />
        <Button icon={<Icon name='share' color='white'/>} title="Share Snapshot" onPress={handleCapture} />
        </View>
    </ScreenWrapper>
  );
}

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center', 
      color: theme.colors.text,
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
