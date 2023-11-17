import { usePlayer } from "@/stores/usePlayer";
import { useAccount, useSignMessage } from "wagmi";
import { AppHeader } from "./common";
import { Button, Card, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ZERO_ADDRESS } from "@/constants/web3";

export const GeneratePassword = () => {
  const { setKey } = usePlayer();
  const { address } = useAccount();
  const { isLoading, signMessage } = useSignMessage({
    message: "Login To Web Tree 🌳",
    onSuccess: (signature) => {
      setKey({
        key: signature,
        address: address || ZERO_ADDRESS,
      });
    },
  });

  return (
    <>
      <AppHeader title="Generate Password" />
      <Card as={Stack}>
        <HStack justify="center">
          <Heading>Login</Heading>
        </HStack>
        <Text>Sign message to login</Text>
        <Button isLoading={isLoading} onClick={() => signMessage()}>
          Sign
        </Button>
      </Card>
    </>
  );
};
