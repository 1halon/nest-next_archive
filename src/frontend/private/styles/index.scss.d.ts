declare namespace IndexScssNamespace {
  export interface IIndexScss {
    app: string;
    description: string;
    grid: string;
    image: string;
    root: string;
    text: string;
  }
}

declare const IndexScssModule: IndexScssNamespace.IIndexScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexScssNamespace.IIndexScss;
};

export = IndexScssModule;
