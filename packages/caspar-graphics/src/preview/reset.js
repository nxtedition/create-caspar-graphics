import { createGlobalStyle } from 'styled-components'

export const Reset = createGlobalStyle`
  *:focus {
    outline: none;
  }

  html,
  body,
  #root,
  #template {
   font-family: -apple-system, system-ui, sans-serif;
   overflow: hidden;
   width: 100%;
   height: 100%;
  }
`
