export function getLastSevenDays() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    const formattedDate = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    dates.push(formattedDate);
  }
  return dates;
}

export function getTodayDay() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export function generateChartOptions(data: any, unit: any) {
  const dates: string[] = data.map((item: any) => item.date);
  const values: number[] = data.map((item: any) => item.value);
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}: ${params[0].value}${unit}`;
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      top: '4%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      min: minDate,
      max: maxDate,
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      min: minValue,
      max: maxValue,
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#fff',
        width: 3
      }
    }]
  };
}