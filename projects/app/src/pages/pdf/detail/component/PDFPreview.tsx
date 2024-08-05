import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

interface PDFPreviewProps {
  file: File | null;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ file }) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeWebViewer = async () => {
      if (viewer.current && !instance) {
        try {
          const WebViewer = (await import('@pdftron/webviewer')).default;

          const newInstance = await WebViewer(
            {
              path: '/lib',
              licenseKey:
                'demo:1720778595282:7f9f54de03000000000dcbfa680bceef193d0da307b91278c372511ce2'
            },
            viewer.current as HTMLDivElement
          );

          newInstance.UI.disableElements([
            'header',
            'toolsHeader',
            'leftPanel',
            'leftPanelButton',
            'pageNavOverlay',
            'searchButton'
          ]);

          const { documentViewer } = newInstance.Core;

          documentViewer.addEventListener('pageComplete', () => {
            newInstance.UI.closeElements(['loadingModal']);
          });

          documentViewer.addEventListener('documentLoaded', () => {
            const doc = documentViewer.getDocument();
            doc.getLayersArray().then((layers: any[]) => {
              layers.forEach((layer) => {
                layer.visible = false;
              });
              doc.setLayersArray(layers);
              documentViewer.refreshAll();
              documentViewer.updateView();
            });
          });

          setInstance(newInstance);
        } catch (error) {
          console.error('Error initializing WebViewer:', error);
        }
      }
    };

    initializeWebViewer();

    return () => {
      if (instance) {
        instance.UI.dispose();
      }
    };
  }, [instance]);

  useEffect(() => {
    const loadDocument = async () => {
      if (file && instance) {
        try {
          const url = URL.createObjectURL(file);
          instance.UI.loadDocument(url);
          instance.UI.setFitMode(instance.UI.FitMode.FitWidth);
          setLoading(false);
        } catch (error) {
          console.error('Error loading document:', error);
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      if (file) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    };
  }, [file, instance]);

  return (
    <Box position="relative" height="100%">
      {loading && (
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          <Spinner size="xl" />
        </Box>
      )}
      <Box ref={viewer} height="100%" />
    </Box>
  );
};

export default PDFPreview;
