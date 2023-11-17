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
      </Head>
      {typeof window === "undefined" || !showChild ? (
        <></>
      ) : (
        <WagmiConfig config={wagmiConfig}>
          <ChakraProvider
            theme={theme}
            toastOptions={{
              defaultOptions: {
                position: "top-right",
                isClosable: true,
                duration: 3000,
              },
            }}
          >
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
