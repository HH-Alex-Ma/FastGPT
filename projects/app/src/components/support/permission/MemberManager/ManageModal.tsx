import {
  ModalBody,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Flex,
  IconButton
} from '@chakra-ui/react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import React from 'react';
import { useContextSelector } from 'use-context-selector';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { CollaboratorContext } from './context';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useUserStore } from '@/web/support/user/useUserStore';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import Loading from '@fastgpt/web/components/common/MyLoading';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { useTranslation } from 'next-i18next';

export type ManageModalProps = {
  onClose: () => void;
};

function ManageModal({ onClose }: ManageModalProps) {
  const { userInfo } = useUserStore();
  const { t } = useTranslation();
  const { permission, collaboratorList, onUpdateCollaborators, onDelOneCollaborator } =
    useContextSelector(CollaboratorContext, (v) => v);

  const { runAsync: onDelete, loading: isDeleting } = useRequest2((tmbId: string) =>
    onDelOneCollaborator(tmbId)
  );

  const loading = isDeleting;

  return (
    <MyModal isOpen onClose={onClose} minW="600px" title="管理协作者" iconSrc="common/settingLight">
      <ModalBody>
        <TableContainer borderRadius="md" minH="400px">
          <Table>
            <Thead bg="myGray.100">
              <Tr>
                <Th border="none">名称</Th>
                <Th border="none" w={'40px'}>
                  操作
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr h={'10px'} />
              {collaboratorList?.map((item: any) => {
                return (
                  <Tr
                    key={item.tmbId}
                    _hover={{
                      bg: 'myGray.50'
                    }}
                  >
                    <Td border="none">
                      <Flex alignItems="center">
                        <Avatar src={item.avatar} w="24px" mr={2} />
                        {item.memberName}
                      </Flex>
                    </Td>
                    <Td border="none">
                      <MyMenu
                        Button={
                          <IconButton
                            size={'xsSquare'}
                            variant={'transparentBase'}
                            icon={
                              <MyIcon name={'edit'} w={'16px'} _hover={{ color: 'primary.600' }} />
                            }
                            aria-label={''}
                          />
                        }
                        menuList={[
                          {
                            children: [
                              {
                                type: 'danger' as 'danger',
                                icon: 'delete',
                                label: t('common:common.Delete'),
                                onClick: () => onDelete(item.tmbId)
                              }
                            ]
                          }
                        ]}
                      ></MyMenu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {collaboratorList?.length === 0 && <EmptyTip text={'暂无协作者'} />}
        </TableContainer>
        {loading && <Loading fixed={false} />}
      </ModalBody>
    </MyModal>
  );
}

export default ManageModal;
