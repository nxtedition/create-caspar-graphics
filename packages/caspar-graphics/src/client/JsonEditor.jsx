import React, { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react'
import { loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import * as monaco from 'monaco-editor'
import JSON5 from 'json5'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    return new editorWorker()
  }
}

loader.config({ monaco })

export const JsonEditor = forwardRef(function JsonEditor({ value, onChange }, forwardedRef) {
  const ref = useRef()
  const [editor, setEditor] = useState()
  const stringified = JSON.stringify(value, null, 2)

  useEffect(() => {
    loader.init().then(monaco => {
      const editor = monaco.editor.create(ref.current, {
        value: stringified,
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
      })
      monaco.editor.defineTheme('custom', theme)

      editor.getModel().onDidChangeContent((event) => {
        try {
          onChange(JSON5.parse(editor.getValue()))
        } catch (err) {}
      });

      setEditor(editor)
    })
  }, [])

  useImperativeHandle(
    forwardedRef,
    () => ({
      getValue: () => {
        try {
          editor.updateOptions({ renderValidationDecorations: 'off' })
          return JSON5.parse(editor.getValue())
        } catch (err) {
          console.warn('Invalid JSON', err)
          editorRef.current.updateOptions({ renderValidationDecorations: 'on' })
          return null
        }
      }
    }),
    []
  )

  return (
    <div
      ref={ref}
      style={{
        opacity: editor ? 1 : 0,
        height: 20 + stringified.split('\n').length * 18
      }}
    />
  )
})

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
