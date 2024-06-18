import { Box, Grid, GridItem, Skeleton } from '@chakra-ui/react';

// ==============================|| SKELETON TOTAL GROWTH BAR CHART ||============================== //

const TotalGrowthBarChart: React.FC = () => (
  <Box boxShadow="base" p="6">
    <Grid templateColumns="repeat(12, 1fr)" gap={3}>
      <GridItem colSpan={12}>
        <Grid templateColumns="repeat(2, 1fr)" alignItems="center" justifyContent="space-between">
          <GridItem colSpan={1}>
            <Grid templateColumns="repeat(12, 1fr)" gap={1}>
              <GridItem colSpan={12}>
                <Skeleton height="20px" />
              </GridItem>
              <GridItem colSpan={12}>
                <Skeleton height="20px" />
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem colSpan={1}>
            <Skeleton height="50px" width="80px" />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem colSpan={12}>
        <Skeleton height="530px" />
      </GridItem>
    </Grid>
  </Box>
);

export default TotalGrowthBarChart;
