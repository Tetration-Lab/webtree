import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/themes";
import Head from "next/head";
import { DESCRIPTION, TITLE } from "@/constants/texts";
import { wagmiConfig } from "@/constants/web3";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { usePrices } from "@/stores/usePrices";

const client = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  return (
    <>
      <Head>
        <title key="title">{TITLE}</title>
        <meta name="description" content={DESCRIPTION} key="description" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Spectral:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      {typeof window === "undefined" || !showChild ? (
        <></>
      ) : (
        <WagmiConfig config={wagmiConfig}>
          <ChakraProvider theme={theme}>
            <QueryClientProvider client={client}>
              <GoogleAnalytics trackPageViews />
              <Component {...pageProps} />
            </QueryClientProvider>
          </ChakraProvider>
        </WagmiConfig>
      )}
    </>
  );
};

export default App;
