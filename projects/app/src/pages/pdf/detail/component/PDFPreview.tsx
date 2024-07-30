import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { WebViewerInstance } from '@pdftron/webviewer';

interface PDFPreviewProps {
  fileUrl: string | null;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ fileUrl }) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<WebViewerInstance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeWebViewer = async () => {
      if (viewer.current && !instance) {
        const WebViewer = (await import('@pdftron/webviewer')).default;

        const newInstance = await WebViewer(
          {
            path: '/lib',
            licenseKey:
              'demo:1720778595282:7f9f54de03000000000dcbfa680bceef193d0da307b91278c372511ce2'
          },
          viewer.current as HTMLDivElement
        );
        // Hide the toolbar and side panels
        newInstance.UI.disableElements([
          'header',
          'toolsHeader',
          'leftPanel',
          'leftPanelButton',
          'pageNavOverlay',
          'searchButton'
        ]);

        // Add event listeners
        const { documentViewer } = newInstance.Core;

        documentViewer.addEventListener('pageComplete', () => {
          newInstance.UI.closeElements(['loadingModal']);
          console.log('Page complete');
        });

        documentViewer.addEventListener('documentLoaded', () => {
          const doc = documentViewer.getDocument();
          doc.getLayersArray().then((layers) => {
            layers.forEach((layer, index) => {
              layers[index].visible = false;
            });
            doc.setLayersArray(layers);
            documentViewer.refreshAll();
            documentViewer.updateView();
          });
          console.log('Document loaded');
        });

        setInstance(newInstance);
        setLoading(false);
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
      if (fileUrl && instance) {
        try {
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          instance.UI.loadDocument(url);

          // Fit document to width
          instance.UI.setFitMode(instance.UI.FitMode.FitWidth);
        } catch (error) {
          console.error('Error loading document:', error);
        }
      }
    };

    loadDocument();
  }, [fileUrl, instance]);

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
