import React from 'react'
import Button from './button'
import Editor from './editor'
import { PlayIcon, PauseIcon, StopIcon, UpdateIcon } from './icons'
import Settings from './settings'

const Tab = ({ children, onClick, isActive }) => (
  <div
    onClick={onClick}
    style={{
      borderBottom: `1px solid ${isActive ? '#222' : 'transparent'}`,
      transition: 'border-color .2s ease-in',
      alignItems: 'center',
      transform: 'translateY(1px)',
      height: '100%',
      display: 'flex',
      padding: '0 15px'
    }}
  >
    {children}
  </div>
)

export default class Controls extends React.Component {
  state = { view: 'data', updates: 0 }

  onEditorRef = ref => {
    this.editor = ref
  }

  componentDidUpdate() {
    // Force editor to remount
    if (
      JSON.stringify(this.props.data) !==
      JSON.stringify(this.editor.getContent())
    ) {
      this.setState(state => ({ updates: state.updates + 1 }))
    }
  }

  onUpdate = () => {
    const data = this.editor.getContent()

    if (data) {
      this.props.update(data)
    }
  }

  render() {
    const {
      isPlaying,
      stop,
      play,
      pause,
      settings,
      onChangeSetting,
      mode
    } = this.props

    return (
      <div
        style={{
          flex: '1 0 0',
          display: 'flex',
          fontSize: 13,
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #eaeaea',
          borderRadius: 4
        }}
      >
        <div
          style={{
            alignItems: 'center',
            background: '#f3f3f3',
            color: '#6e6e6e',
            display: 'flex',
            fontSize: 13,
            height: 24,
            padding: '0 10px',
            borderBottom: '1px solid #ccc',
            width: '100%'
          }}
        >
          <Button
            style={{ marginRight: 5 }}
            title={isPlaying ? 'Pause (F4)' : 'Play (F2)'}
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button title="Stop (F1)" onClick={stop}>
            <StopIcon />
          </Button>
          <div
            style={{
              background: '#ccc',
              height: 16,
              margin: '0 10px',
              width: 1
            }}
          />
          <Tab
            isActive={this.state.view === 'data'}
            onClick={() => {
              this.setState({ view: 'data' })
            }}
          >
            Data
          </Tab>
          <Tab
            isActive={this.state.view === 'settings'}
            onClick={() => {
              this.setState({ view: 'settings' })
            }}
          >
            Settings
          </Tab>
          <div style={{ marginLeft: 'auto', fontWeight: 'bold', fontSize: 10 }}>
            {mode}
          </div>
        </div>
        <div
          style={{
            flex: '1 0 0',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: '100%'
          }}
        >
          {this.state.view === 'settings' ? (
            <Settings value={settings} onChange={onChangeSetting} />
          ) : (
            <React.Fragment>
              <Editor
                key={this.state.updates}
                ref={this.onEditorRef}
                value={this.props.data}
                onSave={this.onUpdate}
              />
              <Button
                title="Update"
                style={{ position: 'absolute', bottom: 3, right: 3 }}
                onClick={this.onUpdate}
              >
                <UpdateIcon />
              </Button>
            </React.Fragment>
          )}
        </div>
        <div
          style={{
            alignItems: 'center',
            color: '#6e6e6e',
            display: 'flex',
            fontSize: 12,
            height: 24,
            width: '100%',
            position: 'absolute',
            bottom: 5,
            paddingLeft: 10,
            cursor: 'pointer'
          }}
        >
          {Object.entries(this.props.previewDataList || {}).map((entry, i) => (
            <div
              key={i}
              onClick={() => {
                this.props.update(entry[1])
              }}
              style={{
                marginRight: 5,
                padding: 2,
                border: '1px solid grey',
                lineHeight: '11px'
              }}
            >
              {entry[0]}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
