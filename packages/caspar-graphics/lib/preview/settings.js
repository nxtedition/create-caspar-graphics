import React from 'react'
import { ChromePicker as ColorPicker } from 'react-color'

const Row = ({ children }) => (
  <div style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
    {children}
  </div>
)

export default class Settings extends React.Component {
  state = { showColorPicker: false }

  onRef = ref => {
    if (!ref) {
      return
    }

    this.node = ref

    setTimeout(() => {
      ref.focus()
    })
  }

  render() {
    const { value, onChange } = this.props
    const { background, autoPreview } = value
    const { showColorPicker } = this.state

    return (
      <div style={{ padding: 8 }}>
        <Row>
          Background:
          <div
            onClick={() => {
              this.setState({ showColorPicker: true })
            }}
            style={{
              background,
              border: '1px solid #ccc',
              borderRadius: 4,
              marginLeft: 6,
              position: 'relative',
              height: 20,
              width: 20
            }}
          >
            {showColorPicker && (
              <div
                ref={this.onRef}
                tabIndex={0}
                onKeyDown={evt => {
                  if (evt.key === 'Enter') {
                    this.setState({ showColorPicker: false })
                  }
                }}
                onBlur={evt => {
                  setTimeout(() => {
                    if (
                      this.node &&
                      !this.node.contains(document.activeElement)
                    ) {
                      this.setState({ showColorPicker: false })
                    }
                  })
                }}
                style={{ position: 'absolute', bottom: 10, left: 10 }}
              >
                <ColorPicker
                  disableAlpha
                  color={background}
                  onChange={({ hex }) => {
                    onChange('background')(hex)
                  }}
                />
              </div>
            )}
          </div>
        </Row>
        <Row>
          <input
            id="autoPreview"
            type="checkbox"
            style={{ marginRight: 5 }}
            checked={autoPreview}
            onChange={evt => {
              onChange('autoPreview')(evt.target.checked)
            }}
          />
          <label htmlFor="autoPreview">Auto Preview</label>
        </Row>
      </div>
    )
  }
}
