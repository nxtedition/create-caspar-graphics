import React, { useEffect, useState } from 'react'
import styles from './json-editor.module.css'
import JSON5 from 'json5'

export function JsonEditor({ value, onChange }) {

  return (
    <div style={{ opacity: ready ? 1 : 0 }}>
    </div>
  )
}

const theme = {
  base: 'vs-dark',
  inherit: false,
  rules: [
    { token: '', foreground: 'fafafa', background: '151718' },
    // { token: 'invalid', foreground: 'cd3131' },
    // { token: 'emphasis', fontStyle: 'italic' },
    // { token: 'strong', fontStyle: 'bold' },
    //
    // { token: 'variable', foreground: '001188' },
    // { token: 'variable.predefined', foreground: '4864AA' },
    // { token: 'constant', foreground: 'dd0000' },
    // { token: 'comment', foreground: '008000' },
    { token: 'number', foreground: 'fd9d63', fontStyle: 'bold' },
    // { token: 'number.hex', foreground: '3030c0' },
    // { token: 'regexp', foreground: '800000' },
    // { token: 'annotatio n', foreground: '808080' },
    // { token: 'type', foreground: '008080' },
    //
    { token: 'delimiter', foreground: 'fafafa' },
    { token: 'string.key.json', foreground: '73daca' },
    { token: 'string.value.json', foreground: '96c466' },
    { token: 'string', foreground: 'fafafa' },
    { token: 'keyword.json', foreground: 'fd9d63', fontStyle: 'bold' }
  ],
  colors: {
    'editor.background': '#151718',
    'editor.foreground': '#fafafa'
  }
}
