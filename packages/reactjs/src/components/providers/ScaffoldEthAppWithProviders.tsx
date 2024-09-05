import { Fragment } from "react";
import { GlobalWrapper } from "../wrappers";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { VITE_SUBGRAPH_URI } from "~~/constants/EnvConsts";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();
  return (
    <Fragment>
    <div 
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
      style={{backgroundImage: "url('/alvo-background-img.jpeg')"}}
    >
      <Header />
      <main className="relative flex flex-col flex-1">
        <GlobalWrapper>{children}</GlobalWrapper>
      </main>
      <Footer />
    </div>
    <Toaster />
  </Fragment>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const apolloClient = new ApolloClient({
    uri: VITE_SUBGRAPH_URI,
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ProgressBar />
          <RainbowKitProvider avatar={BlockieAvatar} theme={lightTheme()}>
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ApolloProvider>
  );
};

export { ScaffoldEthAppWithProviders };
