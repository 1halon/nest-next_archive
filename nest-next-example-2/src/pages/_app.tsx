import Head from "next/head"
import React from "react"
import { Provider } from "react-redux"
import store from "src/frontend/ts/store"
import "src/frontend/styles/global.scss"
// @ts-ignore
import GlobalSCSS from "src/frontend/styles/global.module.scss"
import axios from "axios"

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>
          Meet | The Place Where You Meet The Simplicity of Technology
        </title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  )
}

export const globalSCSS = GlobalSCSS
export const instance = axios.create({ baseURL: "/api/v1" })
