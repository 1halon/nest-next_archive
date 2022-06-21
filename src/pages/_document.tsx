import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div className='app' id='root'></div>
      </body>
    </Html>
  );
}
