declare module '@storybook/react' {
  export interface Story {
    (): JSX.Element;
  }
  
  export interface Meta {
    title: string;
    component?: React.ComponentType<any>;
    parameters?: Record<string, any>;
    argTypes?: Record<string, any>;
  }
}
