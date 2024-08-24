import React from "react";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./styles/globals.css";
import { cookieToInitialState } from "@alchemy/aa-alchemy/config";
import "@rainbow-me/rainbowkit/styles.css";
import Cookies from "js-cookie";
import { createRoot } from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { AlchemyProvider, ScaffoldEthAppWithProviders } from "~~/components/providers";
import { config } from "~~/config/AlchemyConfig";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const Wrapper: React.FC = () => {
  const metadata = getMetadata({
    title: "ALVO",
    description: "Dream.Persevere.Achieve.",
  });
  const initialState = cookieToInitialState(config, Cookies.get("cookie") ?? undefined);
  return (
    <HelmetProvider>
      <Helmet>
        <title>{metadata.title}</title>
        {metadata.meta.map((item, index) => (
          <meta key={index} {...item} />
        ))}
        {metadata.link.map((item, index) => (
          <link key={index} {...item} />
        ))}
      </Helmet>
      <BrowserRouter>
        <AlchemyProvider initialState={initialState}>
          <ScaffoldEthAppWithProviders>
            <App />
          </ScaffoldEthAppWithProviders>
        </AlchemyProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Wrapper />
  </StrictMode>,
);
