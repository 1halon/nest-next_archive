import div from "./Div";

function GetDiv(displayName: string) {
  const _div = div.bind(this) as typeof div;
  _div.displayName = displayName;
  return _div;
}

export const Box = GetDiv("Box"),
  Div = div,
  Container = GetDiv("Container"),
  Wrapper = GetDiv("Wrapper");
