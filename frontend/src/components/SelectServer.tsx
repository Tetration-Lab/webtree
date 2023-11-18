import { chains } from "@/constants/web3";
import {
  Box,
  Card,
  Divider,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useChainId, useSwitchNetwork } from "wagmi";
import { AppHeader } from "./common";
import { usePlayer } from "@/stores/usePlayer";

export const SelectServer = () => {
  const toast = useToast();

  const { switchNetwork } = useSwitchNetwork();
  const chainId = useChainId();

  const { setChainId } = usePlayer();

  return (
    <>
      <AppHeader title="Select Server" />
      <Card as={Stack}>
        <HStack justify="center">
          <Heading>Select World</Heading>
        </HStack>
        <Text align="center">
          Select world for you to join. <br />
          This will be your home from now and every action you took will effect
          your world one way or another
        </Text>
        <Divider opacity={0.1} my={2} />
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
          {chains.map((chain, i) => (
            <Box pos="relative" key={i}>
              {!chain.world.contract && (
                <Text
                  pos="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={1}
                  bg="chakra-body-bg"
                  rounded="lg"
                  p={1}
                  as="b"
                  fontSize={{
                    base: "lg",
                    md: "xl",
                  }}
                >
                  Unavailable
                </Text>
              )}
              <Card
                bgImg={`/images/${chain.sn}/bg.png`}
                aspectRatio={3 / 2}
                w="full"
                bgPos="center"
                bgSize="cover"
                p={0}
                rounded="xl"
                _hover={{
                  cursor: chain.world.contract && "pointer",
                  transform: "scale(1.02)",
                  _active: { transform: "scale(1.01)" },
                }}
                transition="all 0.2s ease-in-out"
                filter={chain.world.contract ? "auto" : "blur(1px)"}
                onClick={
                  !chain.world.contract
                    ? undefined
                    : async () => {
                        try {
                          setChainId(chain.id);
                          if (chain.id === chainId) return;
                          else if (switchNetwork) switchNetwork(chain.id);
                        } catch (error: any) {
                          toast({
                            status: "error",
                            title: "Error",
                            description: error.message,
                          });
                        }
                      }
                }
              >
                {chainId === chain.id && (
                  <Text
                    pos="absolute"
                    top={0}
                    right={0}
                    bg="primary.500"
                    roundedTopRight="lg"
                    roundedBottomLeft="xl"
                    p={1}
                    as="b"
                    fontSize={{
                      base: "sm",
                      md: "md",
                    }}
                  >
                    Currently Connected
                  </Text>
                )}
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
            </Box>
          ))}
        </SimpleGrid>
      </Card>
    </>
  );
};
