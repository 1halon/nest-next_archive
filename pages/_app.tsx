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
  }).then((res) => res.json());

export const theme = responsiveFontSizes(
  createTheme({ palette: { mode: "dark" } })
);

function App({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <Head>
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
