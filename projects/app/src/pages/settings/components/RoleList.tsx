import React, { useEffect, useMemo, useState } from 'react';
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
  Link,
  Input,
  MenuList,
  MenuItem,
  MenuButton,
  Menu,
  Textarea,
  IconButton
} from '@chakra-ui/react';
import Select from 'react-select';
import { getMyApps } from '@/web/core/app/api';
import { getRoles, addRole, updateRole, delRoleById } from '@/web/support/user/api';
import type { EditApiKeyProps } from '@/global/support/openapi/api.d';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import dayjs from 'dayjs';
import { AddIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { useCopyData } from '@/web/common/hooks/useCopyData';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useForm } from 'react-hook-form';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import MyTooltip from '@/components/MyTooltip';
import { getDocPath } from '@/web/common/system/doc';
import MyMenu from '@/components/MyMenu';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { number } from 'echarts';
import { UserStatusEnum, userStatusMap } from '@fastgpt/global/support/user/constant';

const defaultEditData: any = {
  name: '',
  desc: '',
  apps: []
};
const UserList = () => {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const theme = useTheme();
  const { copyData } = useCopyData();
  const { feConfigs } = useSystemStore();
  const [editData, setEditData] = useState<any>();
  const [apiKey, setApiKey] = useState('');
  const { ConfirmModal, openConfirm } = useConfirm({
    type: 'delete',
    content: '确认删除该角色，请确认！'
  });

  const { mutate: onclickRemove, isLoading: isDeleting } = useRequest({
    mutationFn: async (id: string) => delRoleById(id),
    successToast: '删除成功',
    errorToast: '删除失败',
    onSuccess() {
      refetch();
    }
  });

  const {
    data: userInfo = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getRoles'], () => getRoles());

  return (
    <Flex flexDirection={'column'} h={'100%'} position={'relative'}>
      <Box display={['block', 'flex']} py={[0, 3]} px={5} alignItems={'center'}>
        <Box flex={1}>
          <Flex alignItems={'flex-end'}>
            <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
              角色管理
            </Box>
          </Flex>
          <Box fontSize={'sm'} color={'myGray.600'}>
            {'管理角色信息'}
          </Box>
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
      <TableContainer mt={2} position={'relative'} minH={'300px'}>
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>desc</Th>
              <Th>{t('common.Create Time')}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody fontSize={'sm'}>
            {userInfo.map(({ _id, name, desc, apps, createTime }) => (
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
                            desc,
                            apps
                          })
                      },
                      {
                        label: t('common.Delete'),
                        icon: 'delete',
                        type: 'danger',
                        onClick: openConfirm(() => onclickRemove(_id))
                      }
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Loading loading={isGetting || isDeleting} fixed={false} />
      </TableContainer>

      {!!editData && (
        <EditModal
          defaultData={editData}
          onClose={() => setEditData(undefined)}
          onCreate={(id) => {
            setApiKey(id);
            refetch();
            setEditData(undefined);
          }}
          onEdit={() => {
            refetch();
            setEditData(undefined);
          }}
        />
      )}
      <ConfirmModal />
      <MyModal
        isOpen={!!apiKey}
        w={['400px', '600px']}
        iconSrc="/imgs/modal/key.svg"
        title={
          <Box>
            <Box fontWeight={'bold'} fontSize={'xl'}>
              {t('support.openapi.New api key')}
            </Box>
            <Box fontSize={'sm'} color={'myGray.600'}>
              {t('support.openapi.New api key tip')}
            </Box>
          </Box>
        }
        onClose={() => setApiKey('')}
      >
        <ModalBody pt={5}>
          <Flex
            bg={'myGray.100'}
            px={3}
            py={2}
            whiteSpace={'pre-wrap'}
            wordBreak={'break-all'}
            cursor={'pointer'}
            borderRadius={'md'}
            onClick={() => copyData(apiKey)}
          >
            <Box flex={1}>{apiKey}</Box>
            <MyIcon ml={1} name={'copy'} w={'16px'}></MyIcon>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="whiteBase" onClick={() => setApiKey('')}>
            {t('common.OK')}
          </Button>
        </ModalFooter>
      </MyModal>
    </Flex>
  );
};

export default UserList;

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
    mutationFn: async (e: any) => addRole(e),
    errorToast: '新建角色异常',
    onSuccess: onCreate
  });
  const { mutate: onclickUpdate, isLoading: updating } = useRequest({
    mutationFn: (e: any) => updateRole(e),
    errorToast: '更新角色异常',
    onSuccess: onEdit
  });

  const { data: myApps = [], isLoading: isGetting } = useQuery(['getMyApps'], () => getMyApps());
  return (
    <MyModal isOpen={true} iconSrc="/imgs/modal/key.svg" title={isEdit ? '编辑角色' : '创建角色'}>
      <ModalBody style={{ maxHeight: '70vh', minHeight: '50vh' }}>
        <Flex alignItems={'center'}>
          <Box flex={'0 0 90px'}>{'角色名'}:</Box>
          <Input
            placeholder={'请输入角色名'}
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
        <Flex alignItems={'center'} mt={4}>
          <Box flex={'0 0 90px'}>{'应用权限'}:</Box>
          <div style={{ width: '100%' }}>
            <Select
              closeMenuOnSelect={false}
              placeholder={'请选择应用权限'}
              options={myApps.map((app: any) => ({
                label: app.name,
                value: app._id
              }))}
              isMulti
              value={apps}
              onChange={(val) => setApps(val)}
            />
          </div>
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
      <Loading loading={isGetting} fixed={false} />
    </MyModal>
  );
}
