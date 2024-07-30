import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  Box,
  useToast,
  Select,
} from '@chakra-ui/react';
import { getContractAnalyzeResult } from '@/web/support/pdf/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: any, file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState<string>('TechDev_PartyA');
  const [commentRiskLevel, setCommentRiskLevel] = useState<string>('all');
  const toast = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleConfirm = async () => {
    if (!file) {
      toast({
        title: '请上传文件',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onClose();

    try {
      console.log("Preparing to call getContractAnalyzeResult with:", {
        templateName,
        commentRiskLevel,
        file,
      });

      const result: any = await getContractAnalyzeResult({
        templateName,
        commentRiskLevel,
        file,
      });

      console.log("API call result:", result);

      if (result) {
        onConfirm(result, file);
        toast({
          title: '文件分析成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '文件分析失败',
          description: '请重试',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast({
        title: '文件分析失败',
        description: '请重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>上传文件</ModalHeader>
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel htmlFor="file-upload" mb={2}>
              <Box
                as="span"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={4}
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                bg="gray.50"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                transition="background-color 0.2s"
              >
                {file ? file.name : '点击选择文件'}
              </Box>
            </FormLabel>
            <Input
              id="file-upload"
              type="file"
              display="none"
              onChange={handleFileChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel htmlFor="template-name">合同类型</FormLabel>
            <Select
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            >
              <option value="Sales_PartyA">买卖合同审查-买方立场</option>
              <option value="Sales_PartyB">买卖合同审查-卖方立场</option>
              <option value="Lease_PartyA">租赁合同审查-出租方立场</option>
              <option value="Lease_PartyB">租赁合同审查-承租方立场</option>
              <option value="TechDev_PartyA">技术开发合同审查-委托方立场</option>
              <option value="TechDev_PartyB">技术开发合同审查-受托方立场</option>
              <option value="Labor_PartyA">劳动合同审查-用人单位立场</option>
              <option value="Labor_PartyB">劳动合同审查-劳动者立场</option>
              <option value="Entrustment_PartyA">委托合同审查-委托方立场</option>
              <option value="Entrustment_PartyB">委托合同审查-受托方立场</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="comment-risk-level">风险等级</FormLabel>
            <Select
              id="comment-risk-level"
              value={commentRiskLevel}
              onChange={(e) => setCommentRiskLevel(e.target.value)}
            >
              <option value="normal">一般风险</option>
              <option value="major">重大风险</option>
              <option value="all">所有风险</option>
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleConfirm} colorScheme="blue" mr={3}>确认</Button>
          <Button onClick={onClose}>取消</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal;
