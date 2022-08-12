import axios from "axios";
import type { AppProps } from "next/app";
import Head from "next/head";
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { StrictMode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import store, { wrapper } from "../src/ts/store";

export const instance = axios.create({ baseURL: "/api", timeout: 5000 });
export const theme = responsiveFontSizes(
  createTheme({ palette: { mode: "dark" } })
);

function App({ Component, pageProps }: AppProps) {
  const [name, setName] = useState("");
  useEffect(() => {
    let session_name = sessionStorage.getItem("name");
    if (!session_name) session_name = prompt("Kimsin?");
    if (typeof session_name !== "string" || session_name.trim().length === 0)
      return location.reload();
    setName(session_name);
    sessionStorage.setItem("name", session_name);
    instance.defaults.headers.common["Authorization"] = session_name;
  }, [name]);

  return (
    <StrictMode>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Fatura Takip</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} name={name} />
      </ThemeProvider>
    </StrictMode>
  );
}

export default wrapper.withRedux(App);
