declare namespace IndexScssNamespace {
  export interface IIndexScss {
    button: string;
    container: string;
    link: string;
    links: string;
    login: string;
    logo: string;
    nav: string;
  }
}

declare const IndexScssModule: IndexScssNamespace.IIndexScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexScssNamespace.IIndexScss;
};

export = IndexScssModule;
