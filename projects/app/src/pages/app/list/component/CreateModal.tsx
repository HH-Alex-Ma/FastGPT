import React, { useCallback, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  ModalFooter,
  ModalBody,
  Input,
  Grid,
  useTheme,
  Card,
  Textarea,
  HStack,
  Tag
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useForm } from 'react-hook-form';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { postCreateApp } from '@/web/core/app/api';
import { useRouter } from 'next/router';
import { appTemplates } from '@/web/core/app/templates';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useQuery } from '@tanstack/react-query';
import { getTypes } from '@/web/support/user/api';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import MyRadio from '@/components/common/MyRadio';
import { AppSortType } from '@fastgpt/global/support/permission/constant';

type FormType = {
  avatar: string;
  name: string;
  intro: string;
  isShow: string;
  appType: string;
  templateId: string;
};

const CreateModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const { Loading } = useLoading();
  const { toast } = useToast();
  const router = useRouter();
  const theme = useTheme();
  const { isPc, feConfigs } = useSystemStore();
  const { register, setValue, getValues, handleSubmit } = useForm<FormType>({
    defaultValues: {
      avatar: '/icon/logo.svg',
      name: '',
      intro: '',
      isShow: '',
      appType: AppSortType.PERSON,
      templateId: appTemplates[0].id
    }
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file) return;
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.appAvatar,
          file,
          maxW: 300,
          maxH: 300
        });
        setValue('avatar', src);
        setRefresh((state) => !state);
      } catch (err: any) {
        toast({
          title: getErrText(err, t('common.error.Select avatar failed')),
          status: 'warning'
        });
      }
    },
    [setValue, t, toast]
  );

  const { mutate: onclickCreate, isLoading: creating } = useRequest({
    mutationFn: async (data: FormType) => {
      const template = appTemplates.find((item) => item.id === data.templateId);
      if (!template) {
        return Promise.reject(t('core.dataset.error.Template does not exist'));
      }
      return postCreateApp({
        avatar: data.avatar,
        name: data.name,
        intro: data.intro,
        isShow: data.isShow,
        appType: data.appType,
        type: template.type,
        modules: template.modules || []
      });
    },
    onSuccess(id: string) {
      router.push(
        router.pathname.startsWith('/app/list')
          ? `/app/detail?appId=${id}`
          : `/home/detail?appId=${id}`
      );
      onSuccess();
      onClose();
    },
    successToast: t('common.Create Success'),
    errorToast: t('common.Create Failed')
  });

  const {
    data: dataTypes = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getTypes'], () => getTypes());

  return (
    <MyModal
      iconSrc="/imgs/module/ai.svg"
      title={t('core.app.create app')}
      isOpen
      onClose={onClose}
      isCentered={!isPc}
    >
      <ModalBody>
        <Box color={'myGray.800'} fontWeight={'bold'}>
          {t('common.Set Name')}
        </Box>
        <Flex mt={3} alignItems={'center'}>
          <MyTooltip label={t('common.Set Avatar')}>
            <Avatar
              flexShrink={0}
              src={getValues('avatar')}
              w={['28px', '32px']}
              h={['28px', '32px']}
              cursor={'pointer'}
              borderRadius={'md'}
              onClick={onOpenSelectFile}
            />
          </MyTooltip>
          <Input
            flex={1}
            ml={4}
            autoFocus
            bg={'myWhite.600'}
            {...register('name', {
              required: t('core.app.error.App name can not be empty')
            })}
          />
        </Flex>
        <Box mt={3} mb={2} color={'myGray.800'} fontWeight={'bold'}>
          {t('core.app.App intro')}
        </Box>
        <Textarea
          rows={4}
          maxLength={500}
          placeholder={t('core.app.Make a brief introduction of your app')}
          bg={'myWhite.600'}
          {...register('intro')}
        />
        {router.pathname.startsWith('/app/list') && (
          <>
            <Box mt={3} mb={2} color={'myGray.800'} fontWeight={'bold'}>
              应用归属
            </Box>
            <MyRadio
              gridTemplateColumns={['repeat(1,1fr)', 'repeat(2,1fr)', 'repeat(3,1fr)']}
              list={[
                {
                  icon: 'core/explore/exploreLight',
                  title: '个人',
                  desc: '',
                  value: AppSortType.PERSON
                },
                {
                  icon: 'core/app/aiLight',
                  title: '公司',
                  desc: '',
                  value: AppSortType.COMPANY
                }
              ]}
              value={getValues('appType')}
              onChange={(e) => {
                setValue('appType', e);
                setRefresh(!refresh);
              }}
            />
          </>
        )}
        <Box mt={3} mb={2} color={'myGray.800'} fontWeight={'bold'}>
          应用分类
        </Box>
        <MySelect
          value={getValues('isShow')}
          list={dataTypes.map((item: any) => ({
            label: item.name,
            value: item._id
          }))}
          onchange={(val: any) => {
            setValue('isShow', val);
            setRefresh(!refresh);
          }}
        />
        {!feConfigs?.hide_app_flow && router.pathname.startsWith('/app/list') && (
          <>
            <Box mt={[4, 7]} mb={[0, 3]} color={'myGray.800'} fontWeight={'bold'}>
              {t('core.app.Select app from template')}
            </Box>
            <Grid
              userSelect={'none'}
              gridTemplateColumns={['repeat(1,1fr)', 'repeat(2,1fr)']}
              gridGap={[2, 4]}
            >
              {appTemplates.map((item) => (
                <Card
                  key={item.id}
                  border={theme.borders.base}
                  p={3}
                  borderRadius={'md'}
                  cursor={'pointer'}
                  boxShadow={'sm'}
                  {...(getValues('templateId') === item.id
                    ? {
                        bg: 'myWhite.600'
                      }
                    : {
                        _hover: {
                          boxShadow: 'md'
                        }
                      })}
                  onClick={() => {
                    setValue('templateId', item.id);
                    setRefresh((state) => !state);
                  }}
                >
                  <Flex alignItems={'center'}>
                    <Avatar src={item.avatar} borderRadius={'md'} w={'20px'} />
                    <Box ml={3} fontWeight={'bold'}>
                      {t(item.name)}
                    </Box>
                  </Flex>
                  <Box fontSize={'sm'} mt={4}>
                    {t(item.intro)}
                  </Box>
                </Card>
              ))}
            </Grid>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('common.Close')}
        </Button>
        <Button isLoading={creating} onClick={handleSubmit((data) => onclickCreate(data))}>
          {t('common.Confirm Create')}
        </Button>
      </ModalFooter>

      <File onSelect={onSelectFile} />
      <Loading loading={isGetting} fixed={false} />
    </MyModal>
  );
};

export default CreateModal;
