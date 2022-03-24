declare namespace IndexScssNamespace {
  export interface IIndexScss {
    container: string;
    greet: string;
    links: string;
    login: string;
    nav: string;
  }
}

declare const IndexScssModule: IndexScssNamespace.IIndexScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexScssNamespace.IIndexScss;
};

export = IndexScssModule;
