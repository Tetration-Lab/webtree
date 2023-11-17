import { BoxProps, Container, Stack } from "@chakra-ui/react";

export const Section = (props: BoxProps) => {
  return (
    <Container
      as={Stack}
      minH="100dvh"
      maxW="container.xl"
      mx="auto"
      px={{ base: 10, md: 20 }}
      mb={10}
      {...props}
    />
  );
};
