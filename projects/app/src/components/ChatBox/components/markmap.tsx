// src/components/MarkmapViewer.tsx

import React, { useRef, useEffect, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';
import { Flex } from '@chakra-ui/react';

interface MarkmapViewerProps {
  markdown?: string;
}

const MarkmapViewer: React.FC<MarkmapViewerProps> = ({
  markdown = `
# Default Markmap

## Section 1
- Item 1
- Item 2

## Section 2
- Item A
- Item B
`
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const transformer = new Transformer();
  const { root } = transformer.transform(markdown);

  // State to hold Markmap instance
  const [markmapInstance, setMarkmapInstance] = useState<Markmap | null>(null);

  useEffect(() => {
    if (svgRef.current && !markmapInstance) {
      const markmap = Markmap.create(svgRef.current, {
        embedGlobalCSS: true,
        autoFit: true
      });

      markmap.setData(root);
      markmap.fit();

      setMarkmapInstance(markmap);

      // Optional: load additional assets like front-end JS libraries
      //loadCSS('https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css');
      //loadJS('https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js');
      //loadJS('https://cdn.jsdelivr.net/npm/markmap-lib/dist/markmap-view.js');
    }

    return () => {
      if (markmapInstance) {
        markmapInstance.destroy();
        setMarkmapInstance(null);
      }
    };
  }, [markdown, root, markmapInstance]);

  // Cleanup Markmap instance on component unmount
  useEffect(() => {
    return () => {
      if (markmapInstance) {
        markmapInstance.destroy();
      }
    };
  }, [markmapInstance]);

  return (
    <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </Flex>
  );
};

export default MarkmapViewer;
