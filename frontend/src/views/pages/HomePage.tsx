import {
  Text,
  Heading,
  Stack,
  Wrap,
  Button,
  Tooltip,
  Center,
} from "@chakra-ui/react";
import { Section, Navbar, Footer, AppHeader } from "@/components/common";
import { useAccount, useChainId, useSwitchNetwork } from "wagmi";
import { chains, web3Modal } from "@/constants/web3";
import _ from "lodash";
import { DESCRIPTION, TITLE } from "@/constants/texts";
import { useMemo } from "react";
import { SelectServer } from "@/components/SelectServer";

export const HomePage = () => {
  const { isLoading: isSwitching } = useSwitchNetwork();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const correctlyConnected = useMemo(
    () => !isSwitching && isConnected && chains.some((c) => c.id === chainId),
    [isSwitching, isConnected, chainId]
  );

  return (
    <>
      <AppHeader title="Bounties" />
      <Section>
        <Navbar />
        <Stack justify="center" align="center" flexGrow={1}>
          <SelectServer />
        </Stack>
        <Footer />
      </Section>
    </>
  );
};
