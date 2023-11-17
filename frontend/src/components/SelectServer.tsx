import { chains } from "@/constants/web3";
import {
  Card,
  Divider,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAccount, useChainId, useSwitchNetwork } from "wagmi";

export const SelectServer = () => {
  const {
    switchNetwork,
    isLoading: isSwitching,
    pendingChainId,
  } = useSwitchNetwork();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <>
      <Card as={Stack}>
        <HStack justify="center">
          <Text fontWeight="bold" fontSize="2xl">
            Select World
          </Text>
        </HStack>
        <Text align="center">
          Select world for you to join. <br />
          This will be your home from now and every action you took will effect
          your world one way or another
        </Text>
        <Divider opacity={0.1} my={2} />
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
          {chains.map((chain, i) => (
            <Card
              key={i}
              bgImg="/images/scroll/bg.jpg"
              aspectRatio={3 / 2}
              w="full"
              bgPos="center"
              bgSize="cover"
              pos="relative"
              p={0}
              rounded="xl"
              _hover={{
                cursor: "pointer",
                transform: "scale(1.02)",
                _active: { transform: "scale(1.01)" },
              }}
              transition="all 0.2s ease-in-out"
            >
              <Stack
                pos="absolute"
                bottom={0}
                w="full"
                bg="blackAlpha.600"
                roundedBottom="xl"
                p={2}
                spacing={0}
                backdropFilter="blur(2px)"
              >
                <Text as="b" fontSize={{ base: "lg", md: "xl" }}>
                  {chain.world.name}
                </Text>
                <Text fontSize={{ base: "sm", md: "md" }}>
                  {chain.world.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Card>
    </>
  );
};
