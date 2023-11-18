import { Navbar, Section } from "@/components/common";
import {
  useAccount,
  useChainId,
  useContractRead,
  useSwitchNetwork,
} from "wagmi";
import { chains, web3Modal } from "@/constants/web3";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { SelectServer } from "@/components/SelectServer";
import { Welcome } from "@/components/Welcome";
import { usePlayer } from "@/stores/usePlayer";
import { GeneratePassword } from "@/components/GeneratePassword";
import { Game } from "@/components/Game";
import { Stack } from "@chakra-ui/react";
import { WEBTREE_ABI, getContract } from "@/constants/contracts";

export const HomePage = () => {
  const { isLoading: isSwitching } = useSwitchNetwork();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  const { key, setKey, chainId: selectedChainId, setPlayer } = usePlayer();

  const correctlyConnected = useMemo(
    () =>
      !isSwitching &&
      isConnected &&
      chains.some((c) => c.id === chainId && c.world.contract) &&
      chainId === selectedChainId,
    [isSwitching, isConnected, chainId, selectedChainId, chains]
  );

  const [next, setNext] = useState(false);

  useEffect(() => {
    if (!address || key?.address !== address) {
      setKey(null);
    }
  }, [address, key?.address]);

  const [toggle, setToggle] = useState(false);
  const { data: user, isLoading: isLoadingUser } = useContractRead({
    scopeKey: `${toggle}`,
    address: getContract(chainId),
    abi: WEBTREE_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
    onSuccess: (data) => setPlayer(data),
  });

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
          ) : key === null || !user?.status ? (
            <>
              <GeneratePassword
                isLoadingUser={isLoadingUser}
                isNeedRegister={!user?.status}
                toggleQuery={() => setToggle((e) => !e)}
              />
            </>
          ) : (
            <Game toggleQuery={() => setToggle((e) => !e)} />
          )}
        </Stack>
      </Section>
    </>
  );
};
