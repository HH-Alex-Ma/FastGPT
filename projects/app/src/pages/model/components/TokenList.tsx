import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useTheme,
  Input,
  MenuList,
  MenuItem,
  MenuButton,
  Menu,
  FormControl,
  SimpleGrid,
  IconButton,
  Switch,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Card,
  CardBody,
  Text,
  Heading
} from '@chakra-ui/react';
import {
  getTokenList,
  delTokenById,
  updateTokenStatus,
  createOrUpdateToken
} from '@/web/support/model/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import dayjs from 'dayjs';
import { AddIcon, ArrowForwardIcon, RepeatIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useCopyData } from '@/web/common/hooks/useCopyData';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest } from '@/web/common/hooks/useRequest';
import MyTooltip from '@/components/MyTooltip';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyModal from '@/components/MyModal';
import { useToast } from '@fastgpt/web/hooks/useToast';

const defaultEditData: any = {
  id: -1,
  name: '',
  expired_time: -1,
  remain_quota: 0,
  unlimited_quota: false
};

const TokenList = () => {
  const { t } = useTranslation();
  const { isPc } = useSystemStore();
  const [initPage, setInitPage] = useState(true);
  const { Loading } = useLoading();
  const { copyData } = useCopyData();
  const [editData, setEditData] = useState<any>();
  const [inputObj, setInputObj] = useState({
    pageNum: 0,
    keyword: ''
  });
  const [tempObj, setTempObj] = useState({
    pageNum: 1,
    keyword: ''
  });

  const { mutate: onclickRefresh, isLoading: isRefresh } = useMutation({
    mutationFn: async () => {
      setInitPage(true);
      refetch();
    }
  });
  const { mutate: onclickRemove, isLoading: isDeleting } = useRequest({
    mutationFn: async (id: string) => delTokenById(id),
    successToast: '删除成功',
    errorToast: '删除失败',
    onSuccess() {
      refetch();
    }
  });

  const { mutate: updateStatus, isLoading: isUpdateing } = useRequest({
    mutationFn: async (data: any) => updateTokenStatus(data),
    successToast: '更新状态成功',
    errorToast: '更新状态异常',
    onSuccess() {
      refetch();
    }
  });

  const {
    data: tokenLists = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getTokenList', inputObj], () => getTokenList(inputObj));

  useEffect(() => {
    setInitPage(false);
  }, [initPage]);

  return (
    <Flex flexDirection={'column'} h={'100%'} pt={[1, 5]} position={'relative'}>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <Box flex={1}>
          {isPc && (
            <>
              <Flex alignItems={'flex-end'}>
                <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
                  {t('modelCenter.token.tokenManager')}
                </Box>
              </Flex>
              <Box fontSize={'sm'} color={'myGray.600'}>
                {t('modelCenter.token.tokenInfo')}
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <FormControl>
          <SimpleGrid minChildWidth="200px" spacingX="36px">
            <Box>
              <Input
                placeholder={t('modelCenter.token.tokenPlaceholder')}
                value={tempObj.keyword}
                height="36px"
                onChange={(e) => {
                  const val = e.target.value;
                  // console.log(val);
                  setTempObj({ ...tempObj, keyword: val });
                }}
                onKeyDown={(e) => {
                  // @ts-ignore
                  const val = e.target.value;
                  if (e.code === 'Enter') {
                    setInputObj({ pageNum: 0, keyword: val });
                    setTempObj({ ...tempObj, pageNum: 1 });
                  }
                }}
              />
            </Box>
          </SimpleGrid>
          <Box height="36px" textAlign={'right'} style={{ marginTop: '20px' }}>
            <Button
              ml={3}
              leftIcon={<AddIcon fontSize={'md'} />}
              variant={'whitePrimary'}
              onClick={() =>
                setEditData({
                  ...defaultEditData
                })
              }
            >
              {t('Create New')}
            </Button>
            <Button
              ml={3}
              leftIcon={<RepeatIcon fontSize={'md'} />}
              variant={'whitePrimary'}
              onClick={() => {
                setInputObj({ pageNum: 0, keyword: '' });
                setTempObj({ pageNum: 1, keyword: '' });
                onclickRefresh();
              }}
            >
              {t('Refresh Clear')}
            </Button>
          </Box>
        </FormControl>
      </Box>
      <TableContainer mt={2} position={'relative'} h={'100%'} minH={'550px'}>
        <Table>
          <Thead>
            <Tr>
              {/* <Th>ID</Th> */}
              <Th>名称</Th>
              <Th>状态</Th>
              <Th>已用额度</Th>
              <Th>剩余额度</Th>
              <Th>创建时间</Th>
              <Th>过期时间</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody fontSize={'sm'}>
            {tokenLists.map(
              ({
                id,
                key,
                name,
                status,
                used_quota,
                remain_quota,
                created_time,
                expired_time,
                unlimited_quota
              }) => (
                <Tr key={id}>
                  <Td>{name}</Td>
                  <Td>
                    <MyTooltip
                      label={(() => {
                        switch (status) {
                          case 1:
                            return '已启用';
                          case 2:
                            return '已禁用';
                          case 3:
                            return '已过期';
                          case 4:
                            return '已耗尽';
                          default:
                            return '未知';
                        }
                      })()}
                      placement="top"
                    >
                      <Switch
                        sx={{
                          'span.chakra-switch__track:not([data-checked])': {
                            backgroundColor: '#9DA1AD'
                          }
                        }}
                        value={id}
                        isChecked={status == 1}
                        isDisabled={status !== 1 && status !== 2}
                        size={'lg'}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const value = e.target.value;
                          updateStatus({ id: parseInt(value), status: checked ? 1 : 2 });
                        }}
                      />
                    </MyTooltip>
                  </Td>
                  <Td>${(used_quota / 500000).toFixed(4)}</Td>
                  <Td>
                    {unlimited_quota ? '' : '$'}
                    {unlimited_quota ? '无限制' : (remain_quota / 500000).toFixed(4)}
                  </Td>
                  <Td>
                    {dayjs(created_time * 1000)
                      .format('YYYY-MM-DD HH:mm:ss')
                      .toString()}
                  </Td>
                  <Td>
                    {expired_time === -1
                      ? '永不过期'
                      : dayjs(expired_time * 1000)
                          .format('YYYY-MM-DD HH:mm:ss')
                          .toString()}
                  </Td>
                  <Td>
                    <Menu autoSelect={false} isLazy>
                      <MenuButton
                        _hover={{ bg: 'myWhite.600  ' }}
                        cursor={'pointer'}
                        borderRadius={'md'}
                      >
                        <MyIcon name={'more'} w={'14px'} p={2} />
                      </MenuButton>
                      <MenuList color={'myGray.700'} minW={`120px !important`} zIndex={10}>
                        <MenuItem
                          onClick={() =>
                            setEditData({
                              id,
                              name,
                              expired_time,
                              remain_quota,
                              unlimited_quota
                            })
                          }
                          py={[2, 3]}
                        >
                          <MyIcon name={'edit'} w={['14px', '16px']} />
                          <Box ml={[1, 2]}>{t('common.Edit')}</Box>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            copyData(`sk-${key}`, '令牌已复制');
                          }}
                          py={[2, 3]}
                        >
                          <MyIcon name={'copy'} w={['14px', '16px']} />
                          <Box ml={[1, 2]}>{t('common.Copy')}</Box>
                        </MenuItem>
                        <MenuItem onClick={() => onclickRemove(id)} py={[2, 3]}>
                          <MyIcon name={'delete'} w={['14px', '16px']} />
                          <Box ml={[1, 2]}>{t('common.Delete')}</Box>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              )
            )}
          </Tbody>
        </Table>
        <Loading loading={isGetting || isDeleting} fixed={false} />
      </TableContainer>
      {!!editData && (
        <TokensModal
          defaultData={editData}
          onClose={() => setEditData(undefined)}
          onCreateOrEdit={() => {
            setEditData(undefined);
            refetch();
          }}
        />
      )}
      {tokenLists.length === 0 && (
        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          pt={'-10vh'}
          style={{ position: 'absolute', top: '45%', left: '45%' }}
        >
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            {'还没有令牌噢~'}
          </Box>
        </Flex>
      )}
      <Flex w={'100%'} p={5} alignItems={'center'} justifyContent={'flex-end'}>
        <Box ml={3}>
          <Flex alignItems={'center'} justifyContent={'end'}>
            <IconButton
              isDisabled={tempObj.pageNum === 1}
              icon={<ArrowBackIcon />}
              aria-label={'left'}
              size={'smSquare'}
              onClick={() => {
                setTempObj({ ...tempObj, pageNum: tempObj.pageNum - 1 });
                setInputObj({ ...inputObj, pageNum: inputObj.pageNum - 1 });
              }}
            />
            <Flex mx={2} alignItems={'center'}>
              {t('modelCenter.pagePre')}&nbsp;
              <Input
                value={tempObj.pageNum}
                w={'50px'}
                h={'30px'}
                size={'xs'}
                type={'number'}
                min={1}
                readOnly={true}
                onChange={(e) => {
                  let val = e.target.value;
                  if (parseInt(val) <= 0) {
                    setTempObj({ ...tempObj, pageNum: 1 });
                  } else {
                    setTempObj({ ...tempObj, pageNum: parseInt(val) });
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (val === inputObj.pageNum + 1) return;
                  if (val < 1) {
                    setInputObj({ ...inputObj, pageNum: 0 });
                  } else {
                    setInputObj({ ...inputObj, pageNum: val - 1 });
                  }
                }}
              />
              &nbsp;{t('modelCenter.pageSuf')}
            </Flex>
            <IconButton
              isDisabled={tokenLists.length < 10}
              icon={<ArrowForwardIcon />}
              aria-label={'left'}
              size={'sm'}
              w={'28px'}
              h={'28px'}
              onClick={() => {
                setTempObj({ ...tempObj, pageNum: tempObj.pageNum + 1 });
                setInputObj({ ...inputObj, pageNum: inputObj.pageNum + 1 });
              }}
            />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default TokenList;

// edit link modal
function TokensModal({
  defaultData,
  onClose,
  onCreateOrEdit
}: {
  defaultData: any;
  onClose: () => void;
  onCreateOrEdit: () => void;
}) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const isEdit = useMemo(() => defaultData.id != -1, [defaultData]);
  const [defaultValues, setDefaultValues] = useState(defaultData);

  const { mutate: onclickCreateOrUpdate, isLoading: creatingOrUpdating } = useRequest({
    mutationFn: (data: any) => createOrUpdateToken(isEdit, data),
    successToast: isEdit ? '修改成功' : '新建成功',
    errorToast: '操作失败',
    onSuccess: onCreateOrEdit
  });

  return (
    <MyModal
      isOpen={true}
      iconSrc="/imgs/modal/key.svg"
      title={isEdit ? t('修改令牌') : t('新建令牌')}
    >
      <ModalHeader>
        <Card bgColor={'#E5F6FD'}>
          <CardBody>
            <Heading size="xs" textTransform="uppercase">
              注意:
            </Heading>
            <Text pt="2" fontSize="sm">
              令牌的额度仅用于限制令牌本身的最大额度使用量，实际的使用受到账户的剩余额度限制。
            </Text>
          </CardBody>
        </Card>
      </ModalHeader>
      <ModalBody>
        <Flex alignItems={'center'}>
          <Box flex={'0 0 90px'}>{'令牌名称'}:</Box>
          <Input
            maxLength={20}
            value={defaultValues.name}
            onChange={(e) => {
              let val = e.target.value;
              setDefaultValues({ ...defaultValues, name: val });
            }}
          />
        </Flex>
        {defaultValues.expired_time != -1 && (
          <Flex alignItems={'center'} mt={4}>
            <Flex flex={'0 0 90px'} alignItems={'center'}>
              {'过期时间'}:
            </Flex>
            <Input
              type="datetime-local"
              value={dayjs(defaultValues.expired_time * 1000)
                .format('YYYY-MM-DD HH:mm:ss')
                .toString()}
              onChange={(e) => {
                let val = e.target.value;
                setDefaultValues({
                  ...defaultValues,
                  expired_time: new Date(val).getTime() / 1000
                });
              }}
            />
          </Flex>
        )}
        <Flex alignItems={'center'} mt={4}>
          <Flex flex={'0 0 90px'} alignItems={'center'}>
            {'永不过期'}:{' '}
          </Flex>
          &nbsp;
          <Switch
            isChecked={defaultValues.expired_time == -1}
            sx={{
              'span.chakra-switch__track:not([data-checked])': {
                backgroundColor: '#9DA1AD'
              }
            }}
            size={'lg'}
            onChange={(e) => {
              const checked = e.target.checked;
              setDefaultValues({
                ...defaultValues,
                expired_time: checked ? -1 : new Date().getTime() / 1000
              });
            }}
          />
        </Flex>
        <Flex alignItems={'center'} mt={4}>
          <Flex flex={'0 0 90px'} alignItems={'center'}>
            {'令牌额度'}:
          </Flex>
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            max="1000000"
            value={defaultValues.remain_quota}
            isDisabled={defaultValues.unlimited_quota}
            onChange={(e) => {
              let val = e.target.value;
              setDefaultValues({
                ...defaultValues,
                remain_quota: val ? (parseInt(val) >= 0 ? parseInt(val) : 0) : 0
              });
            }}
          />
        </Flex>
        <Flex alignItems={'center'} mt={4}>
          <Flex flex={'0 0 90px'} alignItems={'center'}>
            {'无限额度'}:
          </Flex>
          &nbsp;
          <Switch
            isChecked={defaultValues.unlimited_quota}
            sx={{
              'span.chakra-switch__track:not([data-checked])': {
                backgroundColor: '#9DA1AD'
              }
            }}
            size={'lg'}
            onChange={(e) => {
              const checked = e.target.checked;
              setDefaultValues({ ...defaultValues, unlimited_quota: checked });
            }}
          />
        </Flex>
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button
          isLoading={creatingOrUpdating}
          onClick={() => {
            if (defaultValues.name) {
              onclickCreateOrUpdate(defaultValues);
            } else {
              toast({
                title: '令牌名称不能为空',
                status: 'error'
              });
            }
          }}
        >
          {t('Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
}
