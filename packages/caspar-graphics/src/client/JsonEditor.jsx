import React, { useEffect, useState } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import styles from './json-editor.module.css'
import JSON5 from 'json5'

export function JsonEditor({ value, onChange }) {
  const monaco = useMonaco()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('custom', theme)
      monaco.editor.setTheme('custom')
      setReady(true)
    }
  }, [monaco])

  const stringified = JSON.stringify(value, null, 2)

  return (
    <div style={{ opacity: ready ? 1 : 0 }}>
      <Editor
        height={20 + stringified.split('\n').length * 18}
        language="json"
        theme="custom"
        defaultValue={stringified}
        onChange={value => {
           try {
            const parsed = JSON5.parse(value)
            onChange(parsed)
          } catch (err) {
            console.error(err)
          }
        }}
        options={{
          folding: false,
          lineNumbers: 'off',
          lineDecorationsWidth: 0,
          glyphMargin: false,
          renderValidationDecorations: 'off',
          hideCursorInOverviewRuler: true,
          highlightActiveIndentGuide: false,
          iconsInSuggestions: false,
          overviewRulerBorder: false,
          quickSuggestions: false,
          parameterHints: false,
          renderLineHighlight: 'none',
          scrollBeyondLastLine: false,
          scrollBeyondLastColumn: false,
          snippetSuggestions: 'none',
          lightbulb: {
            enabled: false
          },
          minimap: {
            enabled: false
          }
        }}
      />
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
