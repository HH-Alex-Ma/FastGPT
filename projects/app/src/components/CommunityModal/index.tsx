import React from 'react';
import { Button, ModalFooter, ModalBody } from '@chakra-ui/react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import Markdown from '../Markdown';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useMarkdown } from '@/web/common/hooks/useMarkdown';

const CommunityModal = ({ onClose }: { onClose: () => void }) => {
  const { data: disclaimerIntro } = useMarkdown({ url: '/disclaimer.md' });
  const { t } = useTranslation();
  const { feConfigs } = useSystemStore();

  return (
    <MyModal isOpen={true} onClose={onClose} iconSrc="modal/concat" title={t('home.Community')}>
      <ModalBody>
        <Markdown source={disclaimerIntro} />
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} onClick={onClose}>
          关闭
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default CommunityModal;
