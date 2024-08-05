import React from 'react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import CollaboratorContextProvider, { MemberManagerInputPropsType } from '../MemberManager/context';
import { Box, Button, Flex, HStack, ModalBody } from '@chakra-ui/react';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
export type ConfigPerModalProps = {
  avatar?: string;
  name: string;
  managePer: MemberManagerInputPropsType;
  refetchResource?: () => void;
};

const ConfigPerModal = ({
  avatar,
  name,
  managePer,
  onClose,
  refetchResource
}: ConfigPerModalProps & {
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <MyModal
        isOpen
        iconSrc="/imgs/modal/key.svg"
        onClose={onClose}
        title={t('common:permission.Permission config')}
      >
        <ModalBody>
          <HStack>
            <Avatar src={avatar} w={'1.75rem'} borderRadius={'md'} />
            <Box>{name}</Box>
          </HStack>
          <Box mt={4}>
            <CollaboratorContextProvider {...managePer} refetchResource={refetchResource}>
              {({ MemberListCard, onOpenManageModal, onOpenAddMember }) => {
                return (
                  <>
                    <Flex
                      alignItems="center"
                      flexDirection="row"
                      justifyContent="space-between"
                      w="full"
                    >
                      <Box fontSize={'sm'}>{t('common:permission.Collaborator')}</Box>
                      <Flex flexDirection="row" gap="2">
                        <Button
                          size="sm"
                          variant="whitePrimary"
                          leftIcon={<MyIcon w="4" name="common/settingLight" />}
                          onClick={onOpenManageModal}
                        >
                          {t('common:permission.Manage')}
                        </Button>
                        <Button
                          size="sm"
                          variant="whitePrimary"
                          leftIcon={<MyIcon w="4" name="support/permission/collaborator" />}
                          onClick={onOpenAddMember}
                        >
                          {t('common:common.Add')}
                        </Button>
                      </Flex>
                    </Flex>
                    <MemberListCard mt={2} p={1.5} bg="myGray.100" borderRadius="md" />
                  </>
                );
              }}
            </CollaboratorContextProvider>
          </Box>
        </ModalBody>
      </MyModal>
    </>
  );
};

export default ConfigPerModal;
