import React from 'react'
import { Link } from 'react-router-dom'
import Caspar from '../caspar'
import Screen from './screen'
import { States } from '../constants'
import Editor from './editor'
import Button from './button'
import Controls from './controls'

const readSettings = (key, defaultValue) => {
  const value = window.localStorage.getItem(key)
  return value ? JSON.parse(value) : defaultValue
}

export default class Preview extends React.Component {
  state = {
    autoPreview: readSettings('autoPreview', true),
    background: readSettings('background', '#ffffff'),
    data: this.props.currentTemplate.component.previewData || {},
    state: null,
    screenSize: null
  }

  componentDidMount() {
    console.log('mount')
  }

  onStateChange = state => {
    this.setState({ state })
  }

  onChangeSetting = key => value => {
    this.setState({ [key]: value })
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  onScreenSizeChange = screenSize => {
    this.setState({ screenSize })
  }

  render() {
    const { templates, currentTemplate, mode } = this.props
    const { autoPreview, state, screenSize, background } = this.state

    return (
      <div
        style={{
          background: 'white',
          height: '100%',
          boxSizing: 'border-box',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Screen
          background={background}
          onSizeChange={this.onScreenSizeChange}
          height={this.props.height}
          width={this.props.width}
        >
          <Caspar
            key={currentTemplate.name}
            name={currentTemplate.name}
            ref={ref => (this.cg = ref)}
            template={currentTemplate.component}
            onStateChange={this.onStateChange}
            autoPreview={autoPreview}
          />
        </Screen>
        <div
          style={{
            alignItems: 'stretch',
            flex: '0 0 200px',
            flexDirection: 'row',
            justifyContent: 'space-between',
            display: 'flex',
            paddingTop: 30,
            margin: '0 auto',
            width: screenSize ? screenSize.width : '100%'
          }}
        >
          <div
            style={{
              alignItems: 'center',
              flex: '0 0 50%',
              display: 'grid',
              gridGap: 10,
              gridTemplateColumns: 'repeat(4, 1fr)',
              width: '50%'
            }}
          >
            {templates.map(name => (
              <Link
                key={name}
                to={`/${name}`}
                style={{
                  background: 'rgba(255, 255, 255, .4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 30,
                  fontSize: 13,
                  fontWeight: name === currentTemplate.name ? 800 : 300,
                  textTransform: 'uppercase'
                }}
              >
                {name}
              </Link>
            ))}
          </div>
          <div style={{ flex: '0 0 50%', display: 'flex' }}>
            {this.cg != null && (
              <Controls
                play={this.cg.play}
                pause={this.cg.pause}
                stop={this.cg.stop}
                update={this.cg.update}
                data={this.state.data}
                isPlaying={state === States.playing}
                background={this.state.background}
                settings={{ background, autoPreview }}
                onChangeSetting={this.onChangeSetting}
                mode={mode}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}
