import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { Box, Flex, Switch, type SwitchProps } from '@chakra-ui/react';
import React from 'react';
import { useTranslation } from 'next-i18next';

// external quote switch
const EQSwitch = (props: SwitchProps) => {
  const { t } = useTranslation();
  return (
    <Flex alignItems={'center'}>
      <MyIcon name={'core/chat/EQFill'} mr={2} w={'20px'} />
      <Box>{t('core.app.External Quote')}</Box>
      <Box flex={1} />
      <Switch {...props} />
    </Flex>
  );
};

export default EQSwitch;
