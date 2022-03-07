declare namespace AuthScssNamespace {
  export interface IAuthScss {
    link: string;
  }
}

declare const AuthScssModule: AuthScssNamespace.IAuthScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AuthScssNamespace.IAuthScss;
};

export = AuthScssModule;
