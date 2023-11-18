import { configureChains, createConfig } from "wagmi";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { createWeb3Modal } from "@web3modal/wagmi";
import { DESCRIPTION, TITLE } from "./texts";
import theme from "@/themes";
import { publicProvider } from "wagmi/providers/public";
import {
  baseSepolia,
  mantleTestnet,
  polygonZkEvmTestnet,
  scrollSepolia,
} from "viem/chains";
import { Address, Hex } from "viem";

const metadata = {
  name: TITLE,
  description: DESCRIPTION,
  url: "",
  icons: [""],
};

export const chains = [
  {
    ...scrollSepolia,
    world: {
      name: "Scroll Land",
      description:
        "Scroll land is a medieval world full of scrolls and path of truths.",
    },
  },
  {
    ...mantleTestnet,
    world: {
      contract: "0xE30B1924b952B3013cA62417c8Bb3EA3E79F5a27",
      name: "Mantle",
      description:
        "Mantle is a brillant futuristic world full of neon and plasma.",
    },
  },
  {
    ...polygonZkEvmTestnet,
    world: {
      name: "Polygon",
      description: "Polygon is a fantasy world full of mystic wizards.",
    },
  },
  {
    ...baseSepolia,
    world: {
      name: "Base",
      description:
        "Base is a world of the moonlight, full of elfs and a majestic world tree.",
    },
  },
];

export const getChain = (chainId: number) => {
  return chains.find((chain) => chain.id === chainId);
};

const { publicClient } = configureChains(chains, [
  publicProvider(),
  publicProvider(),
  publicProvider(),
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "",
        showQrModal: false,
        metadata,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
  ],
});

export const web3Modal = createWeb3Modal({
  defaultChain: chains[0],
  wagmiConfig,
  chains,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "",
  themeMode: theme.config.initialColorMode,
  themeVariables: {
    "--w3m-font-family": theme.fonts.heading,
    "--w3m-accent": theme.colors.primary.accent,
  },
});

export const ZERO_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export const ZERO_BYTES32: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
