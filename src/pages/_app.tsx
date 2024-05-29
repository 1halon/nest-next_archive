import Head from "next/head"
import React from "react"
import { Provider } from "react-redux"
import store from "src/frontend/store"
import "src/frontend/styles/global.scss"
import global_scss_ from "src/frontend/styles/global.module.scss"
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

export function reportWebVitals(metric) {
  console.log(metric)
}

export const globalSCSS = global_scss_
export const instance = axios.create({ baseURL: "/api/v1" })
