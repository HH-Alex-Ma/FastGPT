import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { WebViewerInstance } from '@pdftron/webviewer';

interface PDFPreviewProps {
  file: { name: string; dataUrl: string; taskId: string };
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ file }) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<WebViewerInstance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!viewer.current) return;

    let isMounted = true;

    const initializeWebViewer = async () => {
      try {
        const WebViewer = (await import('@pdftron/webviewer')).default;
        const instance = await WebViewer(
          {
            path: '/lib',
            licenseKey: 'demo:1720778595282:7f9f54de03000000000dcbfa680bceef193d0da307b91278c372511ce2',
            fullAPI: true,
          },
          viewer.current as HTMLDivElement
        );

        if (!isMounted) return;

        setInstance(instance);
        const { documentViewer } = instance.Core;

        instance.UI.setTheme('dark');
        instance.UI.disableElements(['toolbarGroup-Annotate', 'toolbarGroup-Edit', 'toolbarGroup-Fill']);

        if (file.dataUrl) {
          try {
            await instance.UI.loadDocument(file.dataUrl);
          } catch (error) {
            console.error('Document loading failed:', error);
          }
        }

        documentViewer.addEventListener('pageComplete', () => {
          if (isMounted) {
            instance.UI.closeElements(['loadingModal']);
            setLoading(false);
          }
        });

        documentViewer.addEventListener('documentLoaded', () => {
          const doc = documentViewer.getDocument();
          doc.getLayersArray().then(layers => {
            layers.forEach(layer => layer.visible = false);
            doc.setLayersArray(layers);
            documentViewer.refreshAll();
            documentViewer.updateView();
          });
        });

      } catch (error) {
        console.error('WebViewer initialization failed:', error);
      }
    };

    initializeWebViewer();

    return () => {
      isMounted = false;
      if (instance?.UI) {
        instance.UI.dispose();
      }
    };
  }, [file.dataUrl]);

  return (
    <Box position="relative" height="100%">
      {file.dataUrl ? (
        <>
          {loading && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            >
              <Spinner size="xl" />
            </Box>
          )}
          <Box ref={viewer} height="100%" />
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          bg="gray.100"
        >
          <Text fontSize="xl" color="gray.500">
            请上传PDF文件进行分析
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default PDFPreview;
