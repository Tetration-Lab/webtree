import { Navbar, Section } from "@/components/common";
import { useAccount, useChainId, useSwitchNetwork } from "wagmi";
import { chains, web3Modal } from "@/constants/web3";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { SelectServer } from "@/components/SelectServer";
import { Welcome } from "@/components/Welcome";
import { Button, Stack } from "@chakra-ui/react";
import { usePlayer } from "@/stores/usePlayer";
import { GeneratePassword } from "@/components/GeneratePassword";
import { generatePrivateKey } from "viem/accounts";
import { seedToChoices } from "@/utils/seed";

export const HomePage = () => {
  const { isLoading: isSwitching } = useSwitchNetwork();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  const { key, setKey, chainId: selectedChainId } = usePlayer();

  const correctlyConnected = useMemo(
    () =>
      !isSwitching &&
      isConnected &&
      chains.some((c) => c.id === chainId) &&
      chainId === selectedChainId,
    [isSwitching, isConnected, chainId, selectedChainId, chains]
  );

  const [next, setNext] = useState(false);

  useEffect(() => {
    if (!address || key?.address !== address) {
      setKey(null);
    }
  }, [address, key?.address]);

  return (
    <>
      <Section>
        <Navbar />
        <Stack justify="center" align="center" flexGrow={1}>
          {!next || !isConnected ? (
            <Welcome
              onPlay={async () => {
                setNext(true);
                if (!isConnected)
                  await web3Modal.open({
                    view: "Connect",
                  });
              }}
            />
          ) : !correctlyConnected ? (
            <SelectServer />
          ) : key === null ? (
            <>
              <GeneratePassword />
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  const random = generatePrivateKey();
                  const choices = seedToChoices(random);
                  console.log(choices);
                }}
              >
                Random
              </Button>
            </>
          )}
        </Stack>
      </Section>
    </>
  );
};
