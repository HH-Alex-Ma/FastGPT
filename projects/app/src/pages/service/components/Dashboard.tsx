import React, { useEffect, useState } from 'react';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { Box, Flex, Grid, Text, VStack } from '@chakra-ui/react';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useTranslation } from 'next-i18next';
import { getSelf, getTokenList, getUserDashboard } from '@/service/api';
import { generateChartOptions, getLastSevenDays } from '@/service/utils/chart';
import { calculateQuota, calculateTotalQuota, renderNumber } from '@/service/utils/common';
import StatisticalBarChart from './StatisticalBarChart';
import StatisticalLineChartCard from './StatisticalLineChartCard';

const Dashboard = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPc } = useSystemStore();
  const [isLoading, setLoading] = useState(true);
  const [statisticalData, setStatisticalData] = useState([]);
  const [requestChart, setRequestChart] = useState() as any;
  const [quotaChart, setQuotaChart] = useState() as any;
  const [tokenChart, setTokenChart] = useState() as any;
  const [users, setUsers] = useState() as any;
  const [logsChart, setLogsChart] = useState();

  /**
   * 获取用户仪表盘数据
   */
  const userDashboard = async () => {
    const data = await getUserDashboard();
    if (data) {
      let lineData = getLineDataGroup(data);
      setRequestChart(getLineCardOption(lineData, 'RequestCount') as any);
      setQuotaChart(getLineCardOption(lineData, 'Quota') as any);
      setTokenChart(getLineCardOption(lineData, 'PromptTokens') as any);
      setStatisticalData(getBarDataGroup(data) as any);
    }
    setLoading(false);
  };

  // 获取用户信息
  const loadUser = async () => {
    const data = await getSelf();
    if (data) {
      let lineDate = getUserDataGroup(data);
      setUsers(getUserCardOption(lineDate, 'usedQuota') as any);
    }
    setLoading(false);
  };

  // 获取token列表
  const tokenList = async () => {
    const data = await getTokenList();
    if (data) {
      const tokenChartData = getTokenTableUsageBarDataGroup(data) as any;
      console.log("tokenChartData", tokenChartData);
      setLogsChart(tokenChartData);
    }
    setLoading(false);
  };

  // init chart
  useEffect(() => {
    userDashboard();
    loadUser();
    tokenList();
  }, []);

  return (
    <Flex flexDirection={'column'} h={'100%'} pt={[1, 5]} position={'relative'}>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <Box flex={1}>
          {isPc && (
            <>
              <Flex alignItems={'flex-end'}>
                <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
                  {t('service.service.Appmonitor')}
                </Box>
              </Flex>
              <Box fontSize={'sm'} color={'myGray.600'}>
                {t('service.service.AppInfo')}
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Box alignItems={'center'}>
        <Box sx={{
          minHeight: '490px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '40px',
          paddingRight: '40px'
        }}>
          <Flex marginBottom="40px" gap="30px">
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="总消耗金额"
              chartData={users?.chartData}
              todayValue={users?.todayValue}
            />
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="今日请求量"
              chartData={requestChart?.chartData}
              todayValue={requestChart?.todayValue}
            />
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="今日消费"
              chartData={quotaChart?.chartData}
              todayValue={quotaChart?.todayValue}
            />
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="今日 token"
              chartData={tokenChart?.chartData}
              todayValue={tokenChart?.todayValue}
            />
          </Flex>
          <VStack spacing={5}>
            <StatisticalBarChart isLoading={isLoading} chartDatas={statisticalData} title={"模型统计"} />
            <StatisticalBarChart isLoading={isLoading} chartDatas={logsChart} title={"令牌统计"} />
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Dashboard;

// 图表数据来源
function getBarDataGroup(data: any) {
  const lastSevenDays = getLastSevenDays();
  const result = new Array();
  const barDataArray = new Array(7).fill(0);
  const lineDataArray = new Array(7).fill(0);
  const map = new Map();

  for (const item of data) {
    if (!map.has(item.ModelName)) {
      // 柱状
      const barData = {
        name: item.ModelName,
        type: 'bar',
        yAxisIndex: 0,
        barWidth: '30%',
        stack: 'Ad',
        data: new Array(7).fill(0) // 初始化长度为7的数组并填充0
      };
      map.set(item.ModelName, barData);
      result.push(barData);
    }

    const index = lastSevenDays.indexOf(item.Day);
    if (index !== -1) {
      let quota = calculateQuota(item.Quota, 3);
      map.get(item.ModelName).data[index] = quota;
      barDataArray[index] += quota;
      lineDataArray[index] += parseFloat(parseFloat(quota).toFixed(3));
      // 在显示结果之前，四舍五入到小数点后三位
      lineDataArray[index] = parseFloat(lineDataArray[index].toFixed(3));
    }
  }

  // 折线
  const lineData = {
    name: '今日消耗总量',
    type: 'line', // 类型设置为'line'
    yAxisIndex: 1,
    stack: 'Ad', // 堆叠的组名，和柱状图相同
    data: lineDataArray, // 折线的数据
    itemStyle: {
      color: '#4cabce', // 设置折线的颜色为墨蓝色
    }
  };
  result.push(lineData);


  // 检查barDataArray中是否有undefined的元素
  for (let i = 0; i < 7; i++) {
    if (barDataArray[i] === undefined) {
      barDataArray[i] = 0;
    }
  }

  for (const item of result) {
    for (let i = 0; i < 7; i++) {
      if (item.data[i] === undefined) {
        item.data[i] = 0;
      }
    }
  }

  return { data: result, xaxis: lastSevenDays };
}

function getTokenTableUsageBarDataGroup(data: any) {
  const tokens = [...new Set(data.map((item: any) => item.name))];
  const result = [];

  for (const token of tokens) {
    const newData = {
      name: token,
      type: 'bar',
      yAxisIndex: 0,
      barWidth: '25%',
      stack: 'Ad',
      data: [] as number[] // Initialize data as an empty array with type annotation number[]
    };

    for (const item of data) {
      if (item.name === token) {
        const quotaTotal = parseFloat(calculateTotalQuota(item.used_quota, 2)); // 将字符串转换为数字
        const index = tokens.indexOf(item.name); // 获取 item.name 在 tokens 数组中的索引
        newData.data[index] = quotaTotal; // 将对应的位置设置为 quotaTotal
      }
    }

    result.push(newData);
  }
  return { data: result, xaxis: tokens };
}

function getLineDataGroup(statisticalData: any[]) {
  let groupedData = statisticalData.reduce((acc, cur) => {
    if (!acc[cur.Day]) {
      acc[cur.Day] = {
        date: cur.Day,
        RequestCount: 0,
        Quota: 0,
        PromptTokens: 0,
        CompletionTokens: 0
      };
    }
    acc[cur.Day].RequestCount += cur.RequestCount;
    acc[cur.Day].Quota += cur.Quota;
    acc[cur.Day].PromptTokens += cur.PromptTokens;
    acc[cur.Day].CompletionTokens += cur.CompletionTokens;
    return acc;
  }, {});
  let lastSevenDays = getLastSevenDays();
  return lastSevenDays.map((day) => {
    if (!groupedData[day]) {
      return {
        date: day,
        RequestCount: 0,
        Quota: 0,
        PromptTokens: 0,
        CompletionTokens: 0
      };
    } else {
      return groupedData[day];
    }
  });
}

function getUserDataGroup(users: any) {
  let groupedData = {
    id: users.id,
    username: users.username,
    displayName: users.display_name,
    role: users.role,
    status: users.status,
    email: users.email,
    githubId: users.github_id,
    wechatId: users.wechat_id,
    accessToken: users.access_token,
    quota: users.quota,
    usedQuota: users.used_quota,
    requestCount: users.request_count,
    group: users.group,
    inviterId: users.inviter_id
  };

  return groupedData;

}

function getLineCardOption(lineDataGroup: any[], field: any) {
  let todayValue: any = 0;
  let chartData = null;
  const lastItem = lineDataGroup.length - 1;
  let lineData = lineDataGroup.map((item, index) => {
    let tmp = {
      date: item.date,
      value: item[field]
    };
    switch (field) {
      case 'Quota':
        tmp.value = calculateQuota(item.Quota, 3);
        break;
      case 'PromptTokens':
        tmp.value += item.CompletionTokens;
        break;
    }

    if (index == lastItem) {
      todayValue = tmp.value;
    }
    return tmp;
  });

  switch (field) {
    case 'RequestCount':
      chartData = generateChartOptions(lineData, '次');
      todayValue = renderNumber(todayValue);
      break;
    case 'Quota':
      chartData = generateChartOptions(lineData, '美元');
      todayValue = '$' + renderNumber(todayValue);
      break;
    case 'PromptTokens':
      chartData = generateChartOptions(lineData, '');
      todayValue = renderNumber(todayValue);
      break;
  }

  return { chartData: chartData, todayValue: todayValue };
}

function getUserCardOption(userData: any, field: any) {
  let todayValue: any = 0;
  let chartData = null;
  let userCardData = {
    date: userData.date,
    value: userData[field]
  };

  switch (field) {
    case 'usedQuota':
      userCardData.value = calculateQuota(userData.usedQuota);
      todayValue = userCardData.value;
      break;
  }

  switch (field) {
    case 'usedQuota':
      chartData = generateChartOptions([userCardData], '美元');
      todayValue = '$' + renderNumber(todayValue);
      break;
  }

  return { chartData: chartData, todayValue: todayValue };
}
