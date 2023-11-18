import { usePlayer } from "@/stores/usePlayer";
import {
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useSignMessage,
} from "wagmi";
import { AppHeader } from "./common";
import { Button, Card, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ZERO_ADDRESS } from "@/constants/web3";
import { WEBTREE_ABI, getContract } from "@/constants/contracts";
import { useTransactionToast } from "@/hooks/useTransactionToast";

export const GeneratePassword = ({
  isLoadingUser,
  isNeedRegister,
  toggleQuery,
}: {
  isLoadingUser: boolean;
  isNeedRegister: boolean;
  toggleQuery: () => void;
}) => {
  const { setKey, key } = usePlayer();
  const { address } = useAccount();
  const { isLoading: isSigning, signMessage } = useSignMessage({
    message: "Login To Web Tree 🌳",
    onSuccess: (signature) => {
      setKey({
        key: signature,
        address: address || ZERO_ADDRESS,
      });
    },
  });

  const chainId = useChainId();
  const txToast = useTransactionToast();
  const { config } = usePrepareContractWrite({
    address: getContract(chainId),
    account: address,
    abi: WEBTREE_ABI,
    functionName: "join",
    args: key ? [key.commitment, key.publicKey] : undefined,
  });
  const { writeAsync, isLoading: isRegistering } = useContractWrite({
    ...config,
    onError: (error) => {
      txToast.errorMessage(error.message);
    },
    onSettled: async (tx) => {
      if (tx?.hash) {
        txToast.submitted(tx.hash);
        await txToast.waitForTransactionReceipt(tx.hash);
        toggleQuery();
      }
    },
  });

  return (
    <>
      <AppHeader title="Generate Password" />
      <Card as={Stack} align="center" textAlign="center">
        <HStack justify="center">
          <Heading>Login</Heading>
        </HStack>
        <Text>Sign message to login</Text>
        <Text>
          If you are choosing this server for the first time you will also need
          to register to the contract.
        </Text>
        <Button
          isLoading={isSigning}
          onClick={() => signMessage()}
          isDisabled={!!key}
        >
          Sign
        </Button>
        <Button
          isLoading={isRegistering || isLoadingUser || txToast.isWaiting}
          onClick={() => writeAsync && writeAsync()}
          isDisabled={!key || !isNeedRegister}
        >
          Register
        </Button>
      </Card>
    </>
  );
};
