import { Box, Card, CardBody, CardHeader, Divider, Text, useTheme } from "@chakra-ui/react";
import { forwardRef, ReactNode } from "react";

export interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children?: ReactNode;
  content?: boolean;
  contentClass?: string;
  contentSX?: object;
  darkTitle?: boolean;
  secondary?: ReactNode | string | object;
  shadow?: string;
  sx?: object;
  title?: ReactNode;
}

const MainCard = forwardRef<HTMLDivElement, MainCardProps>(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentClass = '',
      contentSX = {},
      darkTitle,
      secondary,
      shadow,
      sx = {},
      title,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <Card
        ref={ref}
        {...others}
        sx={{
          border: border ? '1px solid' : 'none',
          borderColor: theme.colors.gray[100],
          ':hover': {
            boxShadow: boxShadow ? shadow || '0 2px 14px 0 rgb(32 40 45 / 8%)' : 'inherit'
          },
          ...sx
        }}
      >
        {/* card header and action */}
        {title && <CardHeader>{darkTitle ? <Text fontSize="lg">{title}</Text> : title}</CardHeader>}

        {/* content & header divider */}
        {title && <Divider />}

        {/* card content */}
        {content && (
          <CardBody sx={contentSX} className={contentClass}>
            {children}
          </CardBody>
        )}
        {!content && children}
      </Card>
    );
  }
);

MainCard.displayName = 'MainCard';

export default MainCard;