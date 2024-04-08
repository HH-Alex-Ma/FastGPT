import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
// project imports
import MainCard from "./MainCard";
import SkeletonTotalGrowthBarChart from "./TotalGrowthBarChart";
import { useSystemStore } from "@/web/common/system/useSystemStore";
import React from "react";

const colors = [
  '#008FFB',
  '#00E396',
  '#FEB019',
  '#FF4560',
  '#775DD0',
  '#55efc4',
  '#81ecec',
  '#74b9ff',
  '#a29bfe',
  '#00b894',
  '#00cec9',
  '#0984e3',
  '#6c5ce7',
  '#ffeaa7',
  '#fab1a0',
  '#ff7675',
  '#fd79a8',
  '#fdcb6e',
  '#e17055',
  '#d63031',
  '#e84393'
]
interface StatisticalBarChartProps {
  isLoading: boolean;
  chartDatas: any;
  title: string;
}

const StatisticalBarChart: React.FC<StatisticalBarChartProps> = ({ isLoading, chartDatas, title }) => {
  const { screenWidth } = useSystemStore();
  const Dom = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();
  const option = useMemo(() => ({
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return `${params.seriesName}: $${params.value}`;
      }
    },
    toolbox: {
      show: true,
      left: 'right',
      top: 20,
      feature: {
        saveAsImage: {}
      }
    },
    axisPointer: {
      animationEasing: "cubicOut"
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    xAxis: [
      {
        type: 'category',
        data: chartDatas?.xaxis,
        axisTick: {
          alignWithLabel: true
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        boundaryGap: [0, 0.001],
        axisLabel: {
          formatter: function (value: number) {
            return `$${value}`;
          }
        }
      },
      {
        show: false,
        type: 'value',
        boundaryGap: [0, 0.001],
        axisLabel: {
          formatter: function (value: number) {
            return `$${value}`;
          }
        }
      }
    ],
    legend: {
      selectedMode: true
    },
    series: chartDatas?.data,
  }), [chartDatas]);

  // init chart
  useEffect(() => {
    if (!Dom.current || myChart?.current?.getOption()) return;
    myChart.current = echarts.init(Dom.current);
    myChart.current && myChart.current.setOption(option);

    setTimeout(() => {
      myChart.current?.resize();
    }, 500);
  }, [chartDatas]);

  // data changed, update
  useEffect(() => {
    if (!myChart.current || !myChart?.current?.getOption()) return;
    myChart.current.setOption(option);
  }, [chartDatas]);

  // resize chart
  useEffect(() => {
    if (!myChart.current || !myChart.current.getOption()) return;
    myChart.current.resize();
  }, [screenWidth]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid templateColumns="repeat(12, 1fr)" gap={3}>
            <GridItem colSpan={12}>
              <Grid templateColumns="repeat(1, 1fr)" alignItems="center" justifyContent="space-between" gap={3}>
                <GridItem colSpan={1}>
                  <Text fontSize="3xl" as='b'>{title}</Text>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={16}>
              {chartDatas && chartDatas.data && chartDatas.data.length > 0 ? (
                <Box ref={Dom} style={{ width: '700%', height: '450px' }} />
              ) : (
                <Box
                  minHeight="400px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="3xl" color="#697586">
                    暂无数据
                  </Text>
                </Box>
              )}
            </GridItem>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

export default StatisticalBarChart;