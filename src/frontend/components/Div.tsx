import React, { FC } from "react";

export interface Props {
  children?: any;
  className?: string;
  global?: string;
  seperateStyles?: boolean;
}

const Div: FC<Props> = ({ children, className, global, seperateStyles }) => {
  return (
    <div
      className={
        seperateStyles
          ? className ?? global
          : `${className ?? ""} ${global ?? ""}`
      }
    >
      {children}
    </div>
  );
};

export default Div;
