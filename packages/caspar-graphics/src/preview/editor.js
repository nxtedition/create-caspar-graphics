import React from 'react'
import * as monaco from 'monaco-editor'
import { useRect } from '@reach/rect'
import JSON5 from 'json5'

const theme = {
  base: 'vs',
  inherit: false,
  rules: [
    { token: '', foreground: '000000', background: 'fffffe' },
    { token: 'invalid', foreground: 'cd3131' },
    { token: 'emphasis', fontStyle: 'italic' },
    { token: 'strong', fontStyle: 'bold' },

    { token: 'variable', foreground: '001188' },
    { token: 'variable.predefined', foreground: '4864AA' },
    { token: 'constant', foreground: 'dd0000' },
    { token: 'comment', foreground: '008000' },
    { token: 'number', foreground: '09885A' },
    { token: 'number.hex', foreground: '3030c0' },
    { token: 'regexp', foreground: '800000' },
    { token: 'annotatio n', foreground: '808080' },
    { token: 'type', foreground: '008080' },

    { token: 'delimiter', foreground: '111111' },
    { token: 'string.key.json', foreground: '717070' },
    { token: 'string.value.json', foreground: '111111' },
    { token: 'string', foreground: '525252' },
    { token: 'keyword', foreground: '0000FF' },
    { token: 'keyword.json', foreground: '000000', fontStyle: 'bold' }
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000'
  }
}

monaco.editor.defineTheme('custom', theme)

export const Editor = React.forwardRef(({ value }, ref) => {
  const editorRef = React.useRef()
  const editorNodeRef = React.useRef()

  // Give parent access to ref.getContent():
  React.useImperativeHandle(
    ref,
    () => ({
      getContent: () => {
        try {
          editorRef.current.updateOptions({
            renderValidationDecorations: 'off'
          })
          return JSON5.parse(editorRef.current.getValue())
        } catch (err) {
          console.warn('Invalid JSON', err)
          editorRef.current.updateOptions({
            renderValidationDecorations: 'on'
          })
          return null
        }
      }
    }),
    []
  )

  // Setup monaco editor.
  React.useEffect(() => {
    editorRef.current = monaco.editor.create(editorNodeRef.current, {
      value: JSON.stringify(value || {}, null, 2),
      language: 'json',
      theme: 'custom',
      lineNumbers: 'off',
      lineDecorationsWidth: 0,
      folding: false,
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
      matchBrackets: false,
      lightbulb: {
        enabled: false
      },
      minimap: {
        enabled: false
      }
    })

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [editorNodeRef])

  // Sync editor content
  React.useEffect(() => {
    const editorValue = editorRef.current?.getValue()
    const stringValue = JSON.stringify(value || {}, null, 2)

    if (editorValue !== stringValue) {
      editorRef.current.setValue(stringValue)
    }
  }, [value, editorRef])

  const containerRef = React.useRef()
  const rect = useRect(containerRef)

  // Resize monaco editor when container size changes.
  React.useEffect(() => {
    if (!editorRef.current?.layout || !rect) {
      return
    }

    editorRef.current.layout({
      height: rect.height - 16,
      width: rect.width - 16
    })
  }, [rect])

  return (
    <div
      tabIndex={0}
      ref={containerRef}
      style={{
        flex: '1 0 0',
        position: 'absolute',
        height: '100%',
        padding: 8,
        top: 0,
        left: 0,
        width: '100%'
      }}
    >
      <div ref={editorNodeRef} />
    </div>
  )
})
