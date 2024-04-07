import React, { useEffect, useRef, useMemo, useState } from 'react';
import Select from 'react-select';
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
  Tag,
  TagLabel,
  Switch,
  InputGroup,
  NumberInputField,
  NumberInput,
  InputRightAddon,
  IconButton,
  SimpleGrid,
  FormControl,
  ModalBody,
  ModalFooter,
  FormLabel,
  FormHelperText,
  Textarea
} from '@chakra-ui/react';
import {
  getChannels,
  putChannelStatus,
  getTestChannel,
  getUpdateBalance,
  delChannelById,
  putChannelPriority,
  getGroups,
  getModels,
  createOrUpdateChannel
} from '@/web/support/model/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import dayjs from 'dayjs';
import { AddIcon, CheckIcon, RepeatIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest } from '@/web/common/hooks/useRequest';
import MyTooltip from '@/components/MyTooltip';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useToast } from '@fastgpt/web/hooks/useToast';
import {
  renderBalance,
  renderType,
  CHANNEL_OPTIONS,
  defaultConfig,
  typeConfig
} from '@/utils/models';
import MyModal from '@/components/MyModal';
import MySelect from '@/components/Select';

const defaultEditData: any = {
  name: '',
  key: '',
  models: '',
  model_mapping: '',
  type: 1,
  base_url: '',
  group: 'default',
  groups: ['default'],
  other: ''
};

const ChannelManger = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPc } = useSystemStore();
  const { Loading } = useLoading();
  const [editData, setEditData] = useState<any>();
  const [priorityValue, setPriorityValue] = useState(-1);
  const [initPage, setInitPage] = useState(true);
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
    mutationFn: async (id: any) => delChannelById(id),
    successToast: '操作成功',
    errorToast: '操作失败',
    onSuccess() {
      refetch();
    }
  });
  const { mutate: updatePriority, isLoading: isUpdateingPriority } = useRequest({
    mutationFn: async (data: any) => putChannelPriority(data),
    successToast: '操作成功',
    errorToast: '操作失败',
    onSuccess() {
      refetch();
    }
  });
  const { mutate: updateStatus, isLoading: isUpdateing } = useRequest({
    mutationFn: async (data: any) => putChannelStatus(data),
    successToast: '操作成功',
    errorToast: '操作失败',
    onSuccess() {
      refetch();
    }
  });
  const { mutate: textResponseTime, isLoading: isTexting } = useMutation({
    mutationFn: async (data: any) => {
      let result: any = await getTestChannel(data);
      // console.log(result)
      if (result.success === false && result.time == 0) {
        toast({
          title: result.message,
          status: 'error'
        });
      } else {
        toast({
          title: '测试成功',
          status: 'success'
        });
      }
      refetch();
    }
  });
  const { mutate: getRenderBalance } = useMutation({
    mutationFn: async (data: any) => {
      let result: any = await getUpdateBalance(data);
      if (result.success === false) {
        toast({
          title: result.message,
          status: 'error'
        });
      } else {
        toast({
          title: '查询成功',
          status: 'success'
        });
      }
      refetch();
    }
  });
  const {
    data: channels = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getChannels', inputObj], () => getChannels(inputObj));
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
                  {t('modelCenter.channel.channelManager')}
                </Box>
              </Flex>
              <Box fontSize={'sm'} color={'myGray.600'}>
                {t('modelCenter.channel.channelInfo')}
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
                placeholder={t('modelCenter.channel.channelPlaceholder')}
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
              <Th>ID</Th>
              <Th>名称</Th>
              <Th>分组</Th>
              <Th>类型</Th>
              <Th>状态</Th>
              <Th>响应时间</Th>
              <Th>余额</Th>
              <Th>优先级</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody fontSize={'sm'}>
            {channels.map(
              ({
                id,
                name,
                group,
                type,
                status,
                response_time,
                balance,
                priority,
                test_time,
                balance_updated_time,
                key,
                models,
                model_mapping,
                base_url,
                groups,
                other
              }) => (
                <Tr key={id}>
                  <Td>{id}</Td>
                  <Td>{name}</Td>
                  <Td>
                    {group.split(',').map((item: string, index: number) => {
                      return (
                        <Tag size="md" key={index} variant="subtle" color="#69758269">
                          <TagLabel color="#697582">{item}</TagLabel>
                        </Tag>
                      );
                    })}
                  </Td>
                  <Td>
                    <Tag size="md" key="md" variant="subtle" color="#69758269">
                      <TagLabel color={renderType(type)?.color}> {renderType(type)?.text}</TagLabel>
                    </Tag>
                  </Td>
                  <Td style={{ padding: '12px 21px' }}>
                    <MyTooltip
                      label={
                        status == 1
                          ? '已启用'
                          : status == 2
                            ? '本渠道被手动禁用'
                            : status == 3
                              ? '本渠道被程序自动禁用'
                              : '未知状态'
                      }
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
                        size={'lg'}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const value = e.target.value;
                          updateStatus({ id: parseInt(value), status: checked ? 1 : 2 });
                        }}
                      />
                    </MyTooltip>
                  </Td>
                  <Td style={{ padding: '11px 21px' }}>
                    <MyTooltip
                      placement="top"
                      label={(() => {
                        let test = dayjs(test_time * 1000)
                          .format('YYYY-MM-DD HH:mm:ss')
                          .toString();
                        return (
                          <>
                            <div>点击测试</div>
                            <div>上次测速时间：{test}</div>
                          </>
                        );
                      })()}
                    >
                      <Tag
                        size="md"
                        key="md"
                        variant="subtle"
                        color={response_time > 0 ? '#00e67600' : '#69758600'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          textResponseTime(id);
                        }}
                      >
                        <TagLabel
                          color={response_time > 0 ? '#00c853' : '#697586'}
                          style={{ fontWeight: 600 }}
                        >
                          {response_time > 0 ? (response_time / 1000).toFixed(2) + '秒' : '未测试'}
                        </TagLabel>
                      </Tag>
                    </MyTooltip>
                  </Td>
                  <Td style={{ padding: '11px 21px' }}>
                    <MyTooltip
                      placement="top"
                      label={(() => {
                        let test = dayjs(balance_updated_time * 1000)
                          .format('YYYY-MM-DD HH:mm:ss')
                          .toString();
                        return (
                          <>
                            <div>点击查询</div>
                            <div>上次查询时间：{test}</div>
                          </>
                        );
                      })()}
                    >
                      <Tag
                        size="md"
                        key="md"
                        variant="subtle"
                        color={'#697586'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          getRenderBalance(id);
                        }}
                      >
                        <TagLabel color={'#697586'} style={{ fontWeight: 600 }}>
                          {renderBalance(type, balance)}
                        </TagLabel>
                      </Tag>
                    </MyTooltip>
                  </Td>
                  <Td style={{ padding: '9px 10px' }}>
                    <InputGroup style={{ width: '150px', height: '30px' }} maxWidth={150}>
                      <NumberInput defaultValue={priority} min={0} precision={0}>
                        <NumberInputField
                          id={id}
                          style={{ height: '30px' }}
                          onChange={(event) => {
                            setPriorityValue(Math.round(parseFloat(event.target.value)));
                          }}
                          onFocus={() => {
                            setPriorityValue(-1);
                          }}
                        />
                      </NumberInput>
                      <InputRightAddon
                        style={{ width: '40px', height: '30px', cursor: 'pointer' }}
                        onClick={() => {
                          // console.log(id, priorityValue);
                          if (priorityValue >= 0) {
                            updatePriority({ id: id, priority: priorityValue });
                          }
                          setPriorityValue(-1);
                        }}
                      >
                        <CheckIcon color={'gray'} />
                      </InputRightAddon>
                    </InputGroup>
                  </Td>
                  <Td style={{ padding: 'px 10px' }}>
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
                              key,
                              models,
                              model_mapping,
                              type,
                              base_url,
                              group,
                              groups,
                              other
                            })
                          }
                          py={[2, 3]}
                        >
                          <MyIcon name={'edit'} w={['14px', '16px']} />
                          <Box ml={[1, 2]}>{t('common.Edit')}</Box>
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
        <Loading
          loading={
            isGetting || isDeleting || isUpdateing || isTexting || isUpdateingPriority || isRefresh
          }
          fixed={false}
        />
      </TableContainer>
      {!!editData && (
        <ChannelsModal
          defaultData={editData}
          onClose={() => setEditData(undefined)}
          onCreateOrEdit={() => {
            setEditData(undefined);
            refetch();
          }}
        />
      )}
      {channels.length === 0 && (
        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          pt={'-10vh'}
          style={{ position: 'absolute', top: '45%', left: '45%' }}
        >
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            {'还没有渠道噢~'}
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
              isDisabled={channels.length < 10}
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
export default React.memo(ChannelManger);

// edit link modal
function ChannelsModal({
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
  const isEdit = useMemo(() => defaultData.id, [defaultData]);
  const [defaultValues, setDefaultValues] = useState(defaultData);
  const [groupOptions, setGroupOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [inputLabel, setInputLabel] = useState(defaultConfig.inputLabel);
  const [inputPrompt, setInputPrompt] = useState(defaultConfig.prompt);

  /* 加载模型，数据初始化 */
  const { isFetching } = useQuery(['loadApps'], () => initChannel(defaultData.type), {
    refetchOnMount: true
  });

  const initChannel = (typeValue: any) => {
    if ((typeConfig as any)[typeValue]?.inputLabel) {
      setInputLabel({
        ...defaultConfig.inputLabel,
        ...(typeConfig as any)[typeValue].inputLabel
      });
    } else {
      setInputLabel(defaultConfig.inputLabel);
    }

    if ((typeConfig as any)[typeValue]?.prompt) {
      setInputPrompt({
        ...defaultConfig.prompt,
        ...(typeConfig as any)[typeValue].prompt
      });
    } else {
      setInputPrompt(defaultConfig.prompt);
    }

    return (typeConfig as any)[typeValue]?.input;
  };

  // getGroups
  const fetchGroups = async () => {
    try {
      let res = await getGroups();
      setGroupOptions(
        res.map((group: any) => ({
          key: group,
          text: group,
          value: group
        }))
      );
    } catch (error: any) {
      toast({
        title: error.message,
        status: 'error'
      });
    }
  };
  //getModels
  const fetchModels = async () => {
    try {
      let res = await getModels();
      setModelOptions(
        res.map((model: any) => {
          return {
            id: model.id,
            group: model.owned_by
          };
        })
      );
    } catch (error: any) {
      toast({
        title: error.message,
        status: 'error'
      });
    }
  };

  const { mutate: onclickCreateOrUpdate, isLoading: creatingOrUpdating } = useRequest({
    mutationFn: async (data: any) => {
      // console.log(isEdit, data);
      if (data.base_url && data.base_url.endsWith('/')) {
        data.base_url = data.base_url.slice(0, data.base_url.length - 1);
      }
      if (data.type === 3 && data.other === '') {
        data.other = '2023-09-01-preview';
      }
      if (data.type === 18 && data.other === '') {
        data.other = 'v2.1';
      }
      // console.log(data);
      createOrUpdateChannel(data.id, data);
    },
    successToast: isEdit ? '修改成功' : '新建成功',
    errorToast: '操作失败',
    onSuccess: onCreateOrEdit
  });

  useEffect(() => {
    fetchGroups().then();
    fetchModels().then();
  }, [inputLabel, inputPrompt]);

  return (
    <MyModal
      style={{ width: '40vw' }}
      maxW={'50vw'}
      isOpen={true}
      iconSrc="/imgs/modal/key.svg"
      title={isEdit ? t('修改渠道') : t('新建渠道')}
    >
      <ModalBody>
        <FormControl mb={'30px'}>
          <FormLabel>{inputLabel.type}</FormLabel>
          <MySelect
            width={'100%'}
            list={CHANNEL_OPTIONS.map((item: any) => ({
              label: item.text,
              value: item.value
            }))}
            value={defaultValues.type}
            onchange={(val) => {
              initChannel(val);
              setDefaultValues({ ...defaultValues, type: val });
            }}
          />
          <FormHelperText fontSize={'12px'}>&nbsp;{inputPrompt.type}</FormHelperText>
        </FormControl>

        <FormControl mb={'30px'} isRequired={true}>
          <FormLabel>{inputLabel.name}</FormLabel>
          <Input
            placeholder={inputLabel.name}
            maxLength={20}
            value={defaultValues.name}
            onChange={(e) => {
              let val = e.target.value;
              setDefaultValues({ ...defaultValues, name: val });
            }}
          />
          <FormHelperText fontSize={'12px'}> &nbsp;{inputPrompt.name}</FormHelperText>
        </FormControl>

        <FormControl mb={'30px'}>
          <FormLabel>{inputLabel.base_url}</FormLabel>
          <Input
            placeholder={inputLabel.base_url}
            value={defaultValues.base_url}
            onChange={(e) => {
              let val = e.target.value;
              setDefaultValues({ ...defaultValues, base_url: val });
            }}
          />
          <FormHelperText fontSize={'12px'}> &nbsp;{inputPrompt.base_url}</FormHelperText>
        </FormControl>
        {inputPrompt.other && (
          <FormControl mb={'30px'}>
            <FormLabel>{inputLabel.other}</FormLabel>
            <Input
              placeholder={inputLabel.other}
              value={defaultValues.other}
              onChange={(e) => {
                let val = e.target.value;
                setDefaultValues({ ...defaultValues, other: val });
              }}
            />
            <FormHelperText fontSize={'12px'}>&nbsp;{inputPrompt.other}</FormHelperText>
          </FormControl>
        )}

        <FormControl mb={'30px'} isRequired={true}>
          <FormLabel>{inputLabel.groups}</FormLabel>
          <Select
            closeMenuOnSelect={false}
            placeholder={inputLabel.groups}
            options={groupOptions.map((item: any) => ({
              label: item.value,
              value: item.value
            }))}
            isMulti
            value={
              defaultValues.group &&
              defaultValues.group.split(',').map((item: any) => ({ label: item, value: item }))
            }
            onChange={(val) => {
              const arr: string[] = [];
              val.forEach((item: any, idex, array) => {
                arr.push(item.value);
              });
              setDefaultValues({ ...defaultValues, groups: arr, group: arr.join(',') });
              // console.log(defaultValues);
            }}
          />
          <FormHelperText fontSize={'12px'}> &nbsp;{inputPrompt.groups}</FormHelperText>
        </FormControl>

        <FormControl mb={'30px'} isRequired={true}>
          <FormLabel>{inputLabel.models}</FormLabel>
          <Select
            closeMenuOnSelect={false}
            placeholder={inputLabel.models}
            options={modelOptions.map((item: any) => ({
              label: item.id,
              value: item.id
            }))}
            isMulti
            value={
              defaultValues.models &&
              defaultValues.models.split(',').map((item: any) => ({ label: item, value: item }))
            }
            onChange={(val) => {
              // console.log(val);
              const arr: string[] = [];
              val.forEach((item: any, idex, array) => {
                arr.push(item.value);
              });
              setDefaultValues({ ...defaultValues, models: arr.join(',') });
            }}
          />
          <FormHelperText fontSize={'12px'}> &nbsp;{inputPrompt.models}</FormHelperText>
        </FormControl>

        <FormControl mb={'30px'}>
          <FormLabel>{inputLabel.key}</FormLabel>
          <Input
            placeholder={inputLabel.key}
            value={defaultValues.key}
            onChange={(e) => {
              let val = e.target.value;
              setDefaultValues({ ...defaultValues, key: val });
            }}
          />
          <FormHelperText fontSize={'12px'}> &nbsp;{inputPrompt.key}</FormHelperText>
        </FormControl>

        <FormControl mb={'30px'}>
          <FormLabel>{inputLabel.model_mapping}</FormLabel>
          <Textarea
            placeholder={inputLabel.model_mapping}
            value={defaultValues.model_mapping}
            onChange={(e) => {
              let val = e.target.value;
              setDefaultValues({ ...defaultValues, model_mapping: val });
            }}
          />
          <FormHelperText fontSize={'12px'}> &nbsp;{inputPrompt.model_mapping}</FormHelperText>
        </FormControl>
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button
          isLoading={creatingOrUpdating}
          onClick={() => {
            let msg = '';
            if (!defaultValues.name) {
              msg = inputLabel.name;
            } else if (!defaultValues.group) {
              msg = inputLabel.groups;
            } else if (!defaultValues.models) {
              msg = inputLabel.models;
            } else if (!isEdit && !defaultValues.key) {
              msg = inputLabel.key;
            } else if (defaultValues.model_mapping) {
              try {
                JSON.parse(defaultValues.model_mapping);
              } catch (error) {
                msg = inputLabel.model_mapping + '格式不合法';
              }
            }
            if (msg) {
              toast({
                title: defaultValues.model_mapping ? msg : msg + '不能为空',
                status: 'error'
              });
            } else {
              onclickCreateOrUpdate(defaultValues);
            }
          }}
        >
          {t('Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
}
