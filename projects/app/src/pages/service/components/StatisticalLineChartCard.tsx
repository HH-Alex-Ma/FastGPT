import React, { useEffect, useRef } from 'react';
import { Box, Grid, Text, chakra, useTheme } from '@chakra-ui/react';
import * as echarts from 'echarts';
import MainCard from "./MainCard";
import SkeletonTotalOrderCard from './EarningCard';

interface StatisticalLineChartCardProps {
  isLoading: boolean;
  title: string;
  chartData?: any;
  todayValue?: string | number;
}

const CardWrapper = chakra(MainCard, {
  baseStyle: {
    bg: 'blue.700',
    color: 'white',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '18px',
    '&>div': {
      position: 'relative',
      zIndex: 5
    },
  },
});
const StatisticalLineChartCard: React.FC<StatisticalLineChartCardProps> = ({ isLoading, title, chartData, todayValue }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (chartData && chartRef.current) {
      const chartInstance = echarts.init(chartRef.current);
      chartInstance.setOption(chartData);
    }
  }, [chartData]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <CardWrapper content={false}>
          <Box bg={theme.colors.blue[500]} color="white" p={5}>
            <Grid gap={3} templateColumns="1fr 1fr">
              <Box>
                <Text fontSize="4xl" fontWeight="medium">
                  {todayValue || '0'}
                </Text>
                <Text fontSize="1xl" fontWeight="normal" color={theme.colors.blue[200]}>
                  {title}
                </Text>
              </Box>
              <Box ref={chartRef} w="180px" h="140%" />
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

export default StatisticalLineChartCard;