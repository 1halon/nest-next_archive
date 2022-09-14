import type { AppProps } from "next/app";
import Head from "next/head";
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { StrictMode } from "react";
import { wrapper } from "../src/ts/store";

export const request = (url: string, method: string, data?: any) =>
  fetch(`/api${url}`, {
    body: data,
    headers: {
      Accept: "application/json",
    },
    method,
    signal: (() => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      return controller.signal;
    })(),
  }).then(async (res) => {
    const body = await res.json().catch(() => {});
    if (res.status.toString()[0] === "2") return body;
    throw body?.message ?? res.statusText;
  });

export const theme = responsiveFontSizes(
  createTheme({ palette: { mode: "dark" } })
);

function App({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <Head>
        <meta name="description" content="Fatura Takip"></meta>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="manifest" href="/manifest.json" />
        <title>Fatura Takip</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </StrictMode>
  );
}

export default wrapper.withRedux(App);
