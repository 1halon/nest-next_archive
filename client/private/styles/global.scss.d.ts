declare namespace GlobalScssNamespace {
  export interface IGlobalScss {
    container: string;
    link: string;
    nav: string;
  }
}

declare const GlobalScssModule: GlobalScssNamespace.IGlobalScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: GlobalScssNamespace.IGlobalScss;
};

export = GlobalScssModule;
