import { Box, Skeleton } from "@chakra-ui/react";
import { FC, ReactElement } from "react";

// ==============================|| SKELETON - EARNING CARD ||============================== //

const EarningCard: FC = (): ReactElement => (
  <Box boxShadow="base" p={4} borderRadius="md">
    <Box>
      <Box>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Skeleton boxSize={44} />
          </Box>
          <Box>
            <Skeleton boxSize={34} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Skeleton my={2} h={40} />
      </Box>
      <Box>
        <Skeleton h={30} />
      </Box>
    </Box>
  </Box>
);

export default EarningCard;