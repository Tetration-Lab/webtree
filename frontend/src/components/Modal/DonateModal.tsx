import { WEBTREE_ABI, getContract } from "@/constants/contracts";
import { useTransactionToast } from "@/hooks/useTransactionToast";
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  chakra,
} from "@chakra-ui/react";
import _ from "lodash";
import { useMemo, useState } from "react";
import { parseEther } from "viem";
import { useChainId, useContractWrite, usePrepareContractWrite } from "wagmi";

export const DonateModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const chainId = useChainId();

  const [amount, setAmount] = useState(0n);
  const setAmountDebounced = useMemo(() => _.debounce(setAmount), []);

  const txToast = useTransactionToast();
  const { config } = usePrepareContractWrite({
    chainId,
    address: getContract(chainId),
    abi: WEBTREE_ABI,
    functionName: "donate",
    value: amount,
  });
  const { writeAsync, isLoading } = useContractWrite({
    ...config,
    onError: (error) => {
      txToast.errorMessage(error.message);
    },
    onSettled: async (tx) => {
      if (tx?.hash) {
        txToast.submitted(tx.hash);
        await txToast.waitForTransactionReceipt(tx.hash);
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay backdropFilter="blur(6px)" />
      <ModalContent as={Stack} p={4} pos="absolute">
        <Tooltip label="Good job bud!" hasArrow isOpen placement="top">
          <Box
            pos="absolute"
            h="500px"
            w="full"
            left="80%"
            zIndex={1000}
            bgImg="/images/druid.png"
            bgSize="cover"
          />
        </Tooltip>
        <HStack justify="center">
          <Heading>Donate</Heading>
        </HStack>
        <Stack textAlign="center">
          <Text>
            If you found that your world is too dirty and need some help, your
            can donate to the druid of your world to fund and help them to make
            the world a better place!
          </Text>
          <Text>
            <chakra.span as="b">Druid will act on their accord</chakra.span>{" "}
            depending on multiple factor, including their funds, action time,
            residents previous action, etc.
          </Text>

          <ModalFooter spacing={2} as={Stack}>
            <Input
              placeholder="Amount in ETH"
              onChange={(e) => {
                try {
                  if (e.target.value.trim() === "") {
                    setAmount(0n);
                    return;
                  }
                  const ether = parseEther(e.target.value);
                  setAmountDebounced(ether);
                } catch (e) {
                  setAmount(0n);
                }
              }}
            />
            <ButtonGroup w="full">
              <Button
                w="full"
                isDisabled={isLoading || txToast.isWaiting}
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                w="full"
                isLoading={isLoading || txToast.isWaiting}
                isDisabled={amount === 0n}
                colorScheme="green"
                onClick={() => writeAsync && writeAsync()}
              >
                Donate
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Stack>
      </ModalContent>
    </Modal>
  );
};
