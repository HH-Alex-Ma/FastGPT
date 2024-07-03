import { Box, Flex, Grid, Tag, TagLabel } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MdImage from '@/components/Markdown/img/Image';
import { UserInputFileItemType } from '@/components/ChatBox/type';

const FilesBlock = ({ files }: { files: UserInputFileItemType[] }) => {
  return (
    <Grid gridTemplateColumns={files.length === 1 ? '1fr' : ['1fr', '1fr 1fr']} gap={4}>
      {files.map(({ id, type, name, url }, i) => {
        if (type === 'image') {
          return (
            <Box key={i} rounded={'md'} flex={'1 0 0'} minW={'120px'}>
              <MdImage src={url} />
            </Box>
          );
        } else if (type === 'file') {
          return (
            <Tag size="lg" colorScheme="facebook" borderRadius="full" marginBottom={'8px'}>
              <MyIcon boxSize="20px" name={'text'} color={'myGray.600'} />
              <TagLabel>{name}</TagLabel>
            </Tag>
          );
        }
        return null;
      })}
    </Grid>
  );
};

export default FilesBlock;
