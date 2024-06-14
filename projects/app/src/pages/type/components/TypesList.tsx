import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  ModalFooter,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useTheme,
  Input,
  Textarea,
  IconButton
} from '@chakra-ui/react';
import { getTypes, addType, updateType, delTypeById } from '@/web/support/user/api';
import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import dayjs from 'dayjs';
import { AddIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useForm } from 'react-hook-form';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import MyMenu from '@/components/MyMenu';

const defaultEditData: any = {
  name: '',
  desc: ''
};
const TypesList = () => {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const theme = useTheme();
  const { feConfigs } = useSystemStore();
  const [editData, setEditData] = useState<any>();
  const [removeId, setRemoveId] = useState<any>();
  const [searchText, setSearchText] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);

  const {
    data: dataInfo = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getTypes'], () => getTypes());

  let TypesData = () => {
    return dataInfo
      .filter((item: any, index) => item.name.toLowerCase().includes(searchText.toLowerCase()))
      .filter(
        (item: any, index) => index >= (currentPageNum - 1) * 10 && index < currentPageNum * 10
      );
  };
  return (
    <Flex flexDirection={'column'} h={'100%'} position={'relative'}>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <Box flex={1}>
          <Flex alignItems={'flex-end'}>
            <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
              应用分类
            </Box>
          </Flex>
          <Box fontSize={'sm'} color={'myGray.600'}>
            {'管理应用分类信息'}
          </Box>
        </Box>
        <Box>
          <Input
            placeholder="搜索"
            value={searchText}
            bg={'#fff'}
            onChange={(e) => setSearchText(e.currentTarget.value)}
          />
        </Box>
        <Box mt={[2, 0]} textAlign={'right'}>
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
            {t('common.New Create')}
          </Button>
        </Box>
      </Box>
      <TableContainer mt={2} mb={'60px'} overflowY={'auto'} position={'relative'} minH={'300px'}>
        <Table>
          <Thead>
            <Tr>
              <Th>名称</Th>
              <Th>描述</Th>
              <Th>{t('common.Create Time')}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody fontSize={'sm'}>
            {TypesData().map(({ _id, name, desc, createTime }) => (
              <Tr key={_id}>
                <Td>{name}</Td>
                <Td>{desc}</Td>
                <Td whiteSpace={'pre-wrap'}>{dayjs(createTime).format('YYYY/MM/DD\nHH:mm:ss')}</Td>
                <Td>
                  <MyMenu
                    offset={[-50, 5]}
                    Button={
                      <IconButton
                        icon={<MyIcon name={'more'} w={'14px'} />}
                        name={'more'}
                        variant={'whitePrimary'}
                        size={'sm'}
                        aria-label={''}
                      />
                    }
                    menuList={[
                      {
                        label: t('common.Edit'),
                        icon: 'edit',
                        onClick: () =>
                          setEditData({
                            _id,
                            name,
                            desc
                          })
                      },
                      {
                        label: t('common.Delete'),
                        icon: 'delete',
                        type: 'danger',
                        onClick: () =>
                          setRemoveId({
                            _id,
                            desc: `确认删除该数据(${name})？删除后将立即生效，删除请确认！`
                          })
                      }
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Loading loading={isGetting} fixed={false} />
      </TableContainer>
      <Flex
        position={'absolute'}
        bottom={'5px'}
        w={'100%'}
        p={5}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
        <Box ml={3}>
          <Flex alignItems={'center'} justifyContent={'end'}>
            <IconButton
              isDisabled={currentPageNum === 1}
              icon={<ArrowBackIcon />}
              aria-label={'left'}
              size={'smSquare'}
              onClick={() => {
                setCurrentPageNum(currentPageNum - 1);
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
                onChange={(e) => {
                  let val = e.target.value;
                  if (parseInt(val) <= 0) {
                    setCurrentPageNum(1);
                  } else {
                    let totalPage = Math.ceil(dataInfo.length / 10);
                    setCurrentPageNum(parseInt(val) >= totalPage ? totalPage : parseInt(val));
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (val === currentPageNum) return;
                  if (val < 1) {
                    setCurrentPageNum(1);
                  } else {
                    setCurrentPageNum(val - 1);
                  }
                }}
              />
              &nbsp;{t('modelCenter.pageSuf')}
            </Flex>
            <IconButton
              isDisabled={dataInfo.length <= currentPageNum * 10}
              icon={<ArrowForwardIcon />}
              aria-label={'left'}
              size={'sm'}
              w={'28px'}
              h={'28px'}
              onClick={() => {
                setCurrentPageNum(currentPageNum + 1);
              }}
            />
          </Flex>
        </Box>
      </Flex>
      {!!editData && (
        <EditModal
          defaultData={editData}
          onClose={() => setEditData(undefined)}
          onCreate={(id) => {
            refetch();
            setEditData(undefined);
          }}
          onEdit={() => {
            refetch();
            setEditData(undefined);
          }}
        />
      )}
      {!!removeId && (
        <ConfirmModal
          data={removeId}
          onClose={() => {
            setRemoveId(undefined);
            refetch();
          }}
        />
      )}
    </Flex>
  );
};

export default TypesList;

// edit link modal
function EditModal({
  defaultData,
  onClose,
  onCreate,
  onEdit
}: {
  defaultData: any;
  onClose: () => void;
  onCreate: (id: string) => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const isEdit = useMemo(() => !!defaultData._id, [defaultData]);
  const [apps, setApps] = useState(defaultData.apps);

  const {
    register,
    setValue,
    handleSubmit: submitShareChat
  } = useForm({
    defaultValues: defaultData
  });

  const { mutate: onclickCreate, isLoading: creating } = useRequest({
    mutationFn: async (e: any) => addType(e),
    errorToast: '新建异常',
    onSuccess: onCreate
  });
  const { mutate: onclickUpdate, isLoading: updating } = useRequest({
    mutationFn: (e: any) => updateType(e),
    errorToast: '更新异常',
    onSuccess: onEdit
  });

  return (
    <MyModal isOpen={true} iconSrc="/imgs/modal/edit.svg" title={isEdit ? '编辑' : '新增'}>
      <ModalBody style={{ maxHeight: '70vh', minHeight: '20vh' }}>
        <Flex alignItems={'center'}>
          <Box flex={'0 0 90px'}>{'名称'}:</Box>
          <Input
            placeholder={'请输入名称'}
            maxLength={20}
            {...register('name', {
              required: 'name is empty'
            })}
          />
        </Flex>
        <Flex alignItems={'center'} mt={4}>
          <Box flex={'0 0 90px'}>{'描述'}:</Box>
          <Textarea placeholder={'请输入描述'} maxLength={20} {...register('desc')} />
        </Flex>
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('common.Close')}
        </Button>

        <Button
          isLoading={creating || updating}
          onClick={submitShareChat((data) =>
            isEdit
              ? onclickUpdate({ ...data, id: defaultData?._id, apps: apps })
              : onclickCreate({ ...data, apps: apps })
          )}
        >
          {t('common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
}

const ConfirmModal = ({ data, onClose }: { data: any; onClose: () => void }) => {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const { mutate: onclickRemove, isLoading: isDeleting } = useRequest({
    mutationFn: async (id: string) => delTypeById(id),
    successToast: '删除成功',
    errorToast: '删除失败',
    onSuccess: onClose
  });
  return (
    <MyModal
      isOpen={true}
      onClose={onClose}
      iconSrc={'common/confirm/deleteTip'}
      title={t('common.Delete Warning')}
      maxW={['90vw', '500px']}
    >
      <ModalBody pt={5}>{data.desc}</ModalBody>
      <ModalFooter>
        <Button variant={'whiteBase'} onClick={onClose}>
          {t('common.Close')}
        </Button>

        <Button
          isLoading={isDeleting}
          bg={'red.600'}
          ml={4}
          onClick={() => onclickRemove(data._id)}
        >
          {t('common.Confirm')}
        </Button>
      </ModalFooter>
      <Loading fixed={false} />
    </MyModal>
  );
};
