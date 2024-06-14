import { headers } from "next/headers";
import { cookieToInitialState } from "@alchemy/aa-alchemy/config";
import "@rainbow-me/rainbowkit/styles.css";
import { AlchemyProvider, ScaffoldEthAppWithProviders, ThemeProvider } from "~~/components/providers";
import { config } from "~~/config/AlchemyConfig";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const initialState = cookieToInitialState(config, headers().get("cookie") ?? undefined);

  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <AlchemyProvider initialState={initialState}>
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </AlchemyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
