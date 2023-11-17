import { Text, Heading, Stack, Wrap, Button, Tooltip } from "@chakra-ui/react";
import { Section, Navbar, Footer, AppHeader } from "@/components/common";
import { useAccount, useChainId, useSwitchNetwork } from "wagmi";
import { chains, web3Modal } from "@/constants/web3";
import _ from "lodash";
import { DESCRIPTION, TITLE } from "@/constants/texts";

export const HomePage = () => {
  const {
    switchNetwork,
    isLoading: isSwitching,
    pendingChainId,
  } = useSwitchNetwork();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <>
      <AppHeader title="Bounties" />
      <Section>
        <Navbar />
        <Stack>
          <Heading>{TITLE}</Heading>
          <Text>{DESCRIPTION}</Text>
          <Stack>
            <Text fontSize="lg">Supported Chains</Text>
            <Wrap spacingX={2}>
              {chains.map((c, i) => (
                <Tooltip label={c.name} key={c.id}>
                  <Button
                    gap={2}
                    isLoading={isSwitching && pendingChainId === c.id}
                    border={
                      isConnected && chainId === c.id
                        ? "1px solid gray"
                        : "none"
                    }
                    cursor={chainId === c.id ? "default" : "pointer"}
                    onClick={
                      isSwitching || chainId === c.id
                        ? undefined
                        : async () => {
                            if (!isConnected || !switchNetwork)
                              web3Modal.open();
                            else switchNetwork(c.id);
                          }
                    }
                  >
                    <Text as="b">{c.name}</Text>
                  </Button>
                </Tooltip>
              ))}
            </Wrap>
          </Stack>
        </Stack>
        <Footer />
      </Section>
    </>
  );
};
