import React, { Component } from 'react'
import * as monaco from 'monaco-editor'
import Measure from 'react-measure'

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

export default class Editor extends Component {
  containerElement = React.createRef()
  editor = null

  componentDidMount = () => {
    this.editor = monaco.editor.create(this.containerElement.current, {
      value: JSON.stringify(this.props.value || {}, null, 2),
      language: 'json',
      theme: 'custom',
      lineNumbers: 'off',
      lineDecorationsWidth: 0,
      folding: false,
      glyphMargin: false,
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
  }

  getContent = () => {
    try {
      return JSON.parse(this.editor.getValue())
    } catch (err) {
      console.warn('Invalid JSON', err)
      return null
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.dispose()
    }
  }

  render() {
    return (
      <Measure
        bounds
        onResize={contentRect => {
          this.editor &&
            this.editor.layout({
              height: contentRect.bounds.height - 16,
              width: contentRect.bounds.width - 16
            })
        }}
      >
        {({ measureRef }) => (
          <div
            onKeyDown={evt => {
              if (evt.metaKey && evt.key === 's') {
                evt.preventDefault()
                this.props.onSave && this.props.onSave()
              }

              evt.stopPropagation()
            }}
            tabIndex={0}
            ref={measureRef}
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
            <div ref={this.containerElement} />
          </div>
        )}
      </Measure>
    )
  }
}
