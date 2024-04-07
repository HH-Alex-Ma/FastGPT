import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Flex,
  Box,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  TagLabel,
  FormControl,
  Input,
  Tag,
  SimpleGrid,
  Button,
  IconButton
} from '@chakra-ui/react';
import { getLogsList } from '@/web/support/model/api';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { RepeatIcon, SearchIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';

const LogsList = () => {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const { isPc } = useSystemStore();
  const [initPage, setInitPage] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pageNum, setPageNum] = useState(0);
  const [currentPageNum, setCurrentPageNum] = useState(1);

  const { mutate: onclickRefresh, isLoading: isRefresh } = useMutation({
    mutationFn: async () => {
      setInitPage(true);
      setSearchBar(originalKeyword);
    }
  });

  const originalKeyword = {
    p: 0,
    username: '',
    token_name: '',
    model_name: '',
    start_timestamp: 0,
    end_timestamp: new Date().getTime() / 1000 + 3600,
    type: 0,
    channel: ''
  };

  const [searchBar, setSearchBar] = useState(originalKeyword);
  const { mutate: initLogs, isLoading: isGetting } = useMutation({
    mutationFn: async () => {
      const result: any = await getLogsList(
        `?p=${pageNum}&type=${searchBar.type}&username=${searchBar.username}&token_name=${searchBar.token_name}&model_name=${searchBar.model_name}&start_timestamp=${searchBar.start_timestamp}&end_timestamp=${searchBar.end_timestamp}&channel=${searchBar.channel}`
      );
      setLogs(result);
      // console.log(result)
    }
  });

  useEffect(() => {
    setInitPage(false);
    initLogs();
  }, [initPage, pageNum]);

  return (
    <Flex flexDirection={'column'} h={'100%'} pt={[1, 5]} position={'relative'}>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <Box flex={1}>
          {isPc && (
            <>
              <Flex alignItems={'flex-end'}>
                <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
                  {t('modelCenter.log.modelLogs')}
                </Box>
              </Flex>
              <Box fontSize={'sm'} color={'myGray.600'}>
                {t('modelCenter.log.logInfo')}
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <FormControl>
          <SimpleGrid minChildWidth="200px" spacingX="36px">
            <Box>
              <span>令牌名称: </span>
              <Input
                value={searchBar.token_name}
                height="36px"
                onChange={(e) => setSearchBar({ ...searchBar, token_name: e.target.value })}
              />
            </Box>
            <Box>
              <span>模型名称: </span>
              <Input
                value={searchBar.model_name}
                height="36px"
                onChange={(e) => setSearchBar({ ...searchBar, model_name: e.target.value })}
              />
            </Box>
            <Box>
              <span>起始时间: </span>
              <Input
                value={dayjs.unix(searchBar.start_timestamp).format('YYYY-MM-DD HH:mm').toString()}
                placeholder="Select Date and Time"
                type="datetime-local"
                height="36px"
                onChange={(e) =>
                  setSearchBar({
                    ...searchBar,
                    start_timestamp: new Date(e.target.value).getTime() / 1000 + 3600
                  })
                }
              />
            </Box>
            <Box>
              <span>结束时间: </span>
              <Input
                value={dayjs.unix(searchBar.end_timestamp).format('YYYY-MM-DD HH:mm').toString()}
                placeholder="Select Date and Time"
                type="datetime-local"
                height="36px"
                onChange={(e) =>
                  setSearchBar({
                    ...searchBar,
                    end_timestamp: new Date(e.target.value).getTime() / 1000 + 3600
                  })
                }
              />
            </Box>
            <Box>
              <span>渠道ID:</span>
              <Input
                value={searchBar.channel}
                height="36px"
                onChange={(e) => setSearchBar({ ...searchBar, channel: e.target.value })}
              />
            </Box>
          </SimpleGrid>
          <Box height="36px" textAlign={'right'} style={{ marginTop: '20px' }}>
            <Button
              ml={3}
              leftIcon={<SearchIcon fontSize={'md'} />}
              variant={'whitePrimary'}
              onClick={() => {
                setPageNum(0);
                initLogs();
              }}
            >
              {t('common.Search')}
            </Button>
            <Button
              ml={3}
              leftIcon={<RepeatIcon fontSize={'md'} />}
              variant={'whitePrimary'}
              onClick={() => {
                setPageNum(0);
                onclickRefresh();
              }}
            >
              {t('Refresh Clear')}
            </Button>
          </Box>
        </FormControl>
      </Box>
      {/* table */}
      <TableContainer mt={2} position={'relative'} h={'100%'} minH={'550px'}>
        <Table>
          <Thead>
            <Tr>
              <Th>时间</Th>
              <Th>渠道</Th>
              <Th>用户</Th>
              <Th>令牌</Th>
              <Th>模型</Th>
              <Th>提示</Th>
              <Th>补全</Th>
              <Th>金额($)</Th>
              <Th>金额(￥)</Th>
              <Th>详情</Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.map(
              ({
                id,
                channel,
                completion_tokens,
                content,
                model_name,
                prompt_tokens,
                quota,
                token_name,
                username,
                created_at
              }) => (
                <Tr key={id}>
                  <Td>
                    {dayjs(created_at * 1000)
                      .format('YYYY-MM-DD HH:mm:ss')
                      .toString()}
                  </Td>
                  <Td>{channel}</Td>
                  <Td>
                    <Tag
                      size="md"
                      key="md"
                      variant="outline"
                      color="#697586"
                      style={{ fontWeight: 600 }}
                    >
                      <TagLabel>{username}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>
                    <Tag size="md" key="md" color="gray" style={{ fontWeight: 600 }}>
                      <TagLabel>{token_name}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>
                    <Tag
                      size="md"
                      key="md"
                      variant="outline"
                      colorScheme="blue"
                      style={{ fontWeight: 600 }}
                    >
                      <TagLabel>{model_name}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>{prompt_tokens}</Td>
                  <Td>{completion_tokens}</Td>
                  <Td>${quota / 500000}</Td>
                  <Td>￥{(quota * 7) / 500000}</Td>
                  <Td>{content}</Td>
                </Tr>
              )
            )}
          </Tbody>
        </Table>
        <Loading loading={isGetting || isRefresh} fixed={false} />
      </TableContainer>
      {logs.length === 0 && (
        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          pt={'-10vh'}
          style={{ position: 'absolute', top: '45%', left: '45%' }}
        >
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            {t('app.Logs Empty')}
          </Box>
        </Flex>
      )}
      <Flex w={'100%'} p={5} alignItems={'center'} justifyContent={'flex-end'}>
        <Box ml={3}>
          <Flex alignItems={'center'} justifyContent={'end'}>
            <IconButton
              isDisabled={pageNum === 0}
              icon={<ArrowBackIcon />}
              aria-label={'left'}
              size={'smSquare'}
              onClick={() => {
                setCurrentPageNum(currentPageNum - 1);
                setPageNum(pageNum - 1);
              }}
            />
            <Flex mx={2} alignItems={'center'}>
              {t('modelCenter.pagePre')}&nbsp;
              <Input
                value={currentPageNum}
                w={'50px'}
                h={'30px'}
                size={'xs'}
                type={'number'}
                min={1}
                readOnly={true}
                onChange={(e) => {
                  let val = e.target.value;
                  // console.log('e.target.value', val);
                  if (parseInt(val) <= 0) {
                    setCurrentPageNum(1);
                  } else {
                    setCurrentPageNum(parseInt(val));
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  // console.log('onblur', val);
                  if (val === pageNum + 1) return;
                  if (val < 1) {
                    setPageNum(0);
                  } else {
                    setPageNum(val - 1);
                  }
                }}
              />
              &nbsp;{t('modelCenter.pageSuf')}
            </Flex>
            <IconButton
              isDisabled={logs.length < 10}
              icon={<ArrowForwardIcon />}
              aria-label={'left'}
              size={'sm'}
              w={'28px'}
              h={'28px'}
              onClick={() => {
                setCurrentPageNum(currentPageNum + 1);
                setPageNum(pageNum + 1);
              }}
            />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default LogsList;
