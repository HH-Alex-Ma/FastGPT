import React from 'react';
import { Box, Flex, Text, Image } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import MyAvatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';

const AsidePage = ({
  ownerApps,
  data,
  onEdit
}: {
  ownerApps: any;
  data: any;
  onEdit: (id: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      flexDirection={'column'}
      h={'100%'}
      py={[0, '0px']}
      pr={[0, '0px']}
      backgroundColor={'#efefef'}
      borderRight={'1px'}
      borderColor={'#e1e1e1'}
    >
      <Box mx={1} px={3} h={'60px'} pt={'12.5px'}>
        <Flex alignItems={'center'} borderRadius={'md'}>
          <MyAvatar w={'40px'} h={'40px'} mr={'5px'} borderRadius={'20px'} src={LOGO_ICON} />
          <Text fontSize="18px" fontWeight={'700'} pl={'5px'}>
            GenAI企业应用助手
          </Text>
        </Flex>
      </Box>
      <Box h={'60px'} mx={1} borderTop={'1px'} borderColor={'#e1e1e1'} pt={'5px'}>
        <Flex
          key={'default'}
          py={3}
          px={3}
          mb={3}
          cursor={'pointer'}
          borderRadius={'md'}
          alignItems={'center'}
          {...('default' === data
            ? {
                bg: 'white',
                boxShadow: 'md',
                fontWeight: '700',
                color: '#447EF2'
              }
            : {
                _hover: {
                  bg: '#fff'
                },
                onClick: () => {
                  onEdit('default');
                }
              })}
        >
          <MyIcon name={'AppList'} boxSize={'28px'} />
          <Box ml={2} className={'textEllipsis'} fontSize={'16px'}>
            {'应用列表'}
          </Box>
        </Flex>
      </Box>
      <Box
        height={'100%'}
        flex={'1 0 0'}
        mx={1}
        overflow={'overlay'}
        borderTop={'1px'}
        borderColor={'#e1e1e1'}
        pt={'5px'}
      >
        {ownerApps.map((item: any) => (
          <Flex
            key={item._id}
            py={3}
            px={3}
            mb={3}
            cursor={'pointer'}
            borderRadius={'md'}
            alignItems={'center'}
            {...(item._id === data
              ? {
                  bg: 'white',
                  boxShadow: 'md',
                  fontWeight: '700',
                  color: '#447EF2'
                }
              : {
                  _hover: {
                    bg: '#fff'
                  },
                  onClick: () => {
                    onEdit(item._id);
                  }
                })}
          >
            <MyAvatar src={item.avatar} w={'28px'} />
            <Box ml={2} className={'textEllipsis'} fontSize={'14px'}>
              {item.name}
            </Box>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};

export default AsidePage;
