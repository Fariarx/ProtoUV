type Styles = Record<string, string>;

declare module '*.png' {
  const content: string;
  export default content;
}
