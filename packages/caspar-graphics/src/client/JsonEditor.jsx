import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react'
import Editor from '@monaco-editor/react'
import JSON5 from 'json5'

export const JsonEditor = forwardRef(function JsonEditor(
  { value, onChange },
  forwardedRef
) {
  const ref = useRef()
  const [editor, setEditor] = useState()
  const stringified = JSON.stringify(value, null, 2)

  useImperativeHandle(
    forwardedRef,
    () => ({
      getValue: () => {
        try {
          editor.updateOptions({ renderValidationDecorations: 'off' })
          return JSON5.parse(editor.getValue())
        } catch (err) {
          console.warn('Invalid JSON', err)
          return null
        }
      }
    }),
    [editor]
  )

  return (
    <div
      ref={ref}
      style={{
        opacity: editor ? 1 : 0,
        height: 20 + stringified.split('\n').length * 18
      }}
    >
      <Editor
        defaultValue={stringified}
        language="json"
        theme="custom"
        options={{
          language: 'json',
          theme: 'custom',
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
        beforeMount={monaco => {
          const theme = {
            base: 'vs-dark',
            inherit: false,
            rules: [
              { token: '', foreground: 'fafafa', background: '151718' },
              { token: 'number', foreground: 'fd9d63', fontStyle: 'bold' },
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
          monaco.editor.defineTheme('custom', theme)
        }}
        onMount={editor => {
          setEditor(editor)
        }}
        onChange={(value) => {
          try {
            onChange(JSON5.parse(value))
          } catch (err) {
            // TODO: show that the state is invalid
          }
        }}
      />
    </div>
  )
})
