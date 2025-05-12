// components/SimplePieChart.tsx
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/context/ThemeContext';
import { wp } from '@/helpers/common';

interface PieChartItem {
  label: string;
  value: number;
}

interface SimplePieChartProps {
  data: PieChartItem[];
}



export default function SimplePieChart({ data }: SimplePieChartProps) {
  const { theme } = useTheme();
  const colorPalette = theme.pie;
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.label,
      population: item.value,
      color: colorPalette[index % colorPalette.length],
      legendFontColor: theme.colors.text,
      legendFontSize: 14,
    }));
  }, [data, theme.colors.text]);

  return (
    <View style={{ alignItems: 'center', marginVertical: 15 }}>
      <PieChart
        data={chartData}
        width={wp(100) - 32} 
        height={220}
        chartConfig={{
          color: (opacity = 1) => theme.colors.text + (opacity < 1 ? ` ${opacity}` : ''),
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
}