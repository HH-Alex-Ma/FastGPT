import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

interface PDFPreviewProps {
  file: File | null;
  positions?: { page: number; coords: { x: number; y: number }[] }[];
}

const PDFPreview = forwardRef(({ file, positions = [] }: PDFPreviewProps, ref) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useImperativeHandle(ref, () => ({
    jumpToPosition: (page: number, x: number, y: number) => {
      if (instance) {
        const { documentViewer } = instance.Core;
        documentViewer.setCurrentPage(page);
        const pageRect = documentViewer.getPageView(page).getPage().getBoundingClientRect();
        const scrollX = x + pageRect.left - viewer.current!.offsetWidth / 2;
        const scrollY = y + pageRect.top - viewer.current!.offsetHeight / 2;
        viewer.current!.scrollTo(scrollX, scrollY);
      }
    }
  }));

  useEffect(() => {
    const initializeWebViewer = async () => {
      if (viewer.current && !instance) {
        try {
          const WebViewer = (await import('@pdftron/webviewer')).default;

          const newInstance = await WebViewer(
            {
              path: '/lib',
              licenseKey: 'demo:1720778595282:7f9f54de03000000000dcbfa680bceef193d0da307b91278c372511ce2'
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

            newInstance.UI.setFitMode(newInstance.UI.FitMode.FitWidth);
            setLoading(false);
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

  useEffect(() => {
    if (instance && positions.length > 0) {
      const { documentViewer } = instance.Core;
      positions.forEach(({ page, coords }) => {
        documentViewer.setCurrentPage(page);
        const pageRect = documentViewer.getPageView(page).getPage().getBoundingClientRect();
        coords.forEach(({ x, y }) => {
          const highlight = documentViewer.getDocument().createAnnotation({
            type: 'highlight',
            pageNumber: page,
            rect: [x + pageRect.left, y + pageRect.top, x + pageRect.left + 100, y + pageRect.top + 20] // Adjust width and height as needed
          });
          documentViewer.getAnnotationManager().addAnnotation(highlight);
        });
      });
    }
  }, [positions, instance]);

  return (
    <Box position="relative" height="100%">
      {loading && (
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          <Spinner size="xl" />
        </Box>
      )}
      <Box ref={viewer} height="100%" width="100%" />
    </Box>
  );
});

export default PDFPreview;
