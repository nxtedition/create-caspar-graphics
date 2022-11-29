import ReactDOM from 'react-dom'
import React, { useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from 'react-router-dom'
import { Controls } from './controls'
import { States } from '../../'
import { Reset } from './reset'
import { Screen } from './screen'
import { usePersistentValue } from './use-persistent-value'
import { usePreviewState } from './use-preview-state'
import { usePreviewData } from './use-preview-data'

const templates = process.env.GRAPHIC_TEMPLATES

export const Preview = ({ template }) => {
  const [settings, setSettings] = usePersistentValue('settings', {
    autoPreview: false,
    background: '#ffffff',
    showImage: false,
    imageOpacity: 0.5
  })
  const iframeRef = useRef()
  const templateWindow =
    state === States.loading ? null : iframeRef.current?.contentWindow

  const [state, setState] = usePreviewState({
    templateWindow,
    autoPreview: settings.autoPreview
  })

  const previewData = usePreviewData({
    templateWindow,
    state
  })

  return (
    <div
      css={`
        background: white;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        display: grid;
        grid-template-rows: 1fr 240px;
        padding: 20px;
        overflow: hidden;
      `}
    >
      <Screen
        template={template}
        background={settings.background}
        iframeRef={iframeRef}
        image={{
          opacity: settings.imageOpacity,
          src: previewData?.image
        }}
        state={state}
        onLoad={() => {
          // HACK: wait for update window.update to be set.
          setTimeout(() => {
            setState(States.loaded)
          }, 0)
        }}
      />
      <div
        css={`
          align-items: stretch;
          display: flex;
          justify-content: space-between;
          padding-top: 30px;
          width: 100%;
        `}
      >
        <div
          style={{
            alignItems: 'center',
            flex: '0 0 50%',
            display: 'grid',
            gridGap: 10,
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: 50,
            paddingRight: 24,
            overflow: 'overlay',
            width: '50%'
          }}
        >
          {templates.map(name => (
            <Link
              key={name}
              to={`/${name}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 30,
                fontSize: 13,
                fontWeight: name === template ? 800 : 300,
                textTransform: 'uppercase'
              }}
            >
              {name}
            </Link>
          ))}
        </div>
        <div style={{ flex: '0 0 50%', display: 'flex' }}>
          {templateWindow != null && (
            <Controls
              templateWindow={templateWindow}
              play={() => {
                setState(States.playing)
              }}
              pause={() => {
                setState(States.paused)
              }}
              stop={() => {
                if (state === States.playing || state === States.paused) {
                  setState(States.stopped)
                }
              }}
              update={data => {
                setData(data)
              }}
              state={state}
              isPlaying={state === States.playing}
              settings={settings}
              onChangeSetting={key => value => {
                setSettings({ ...settings, [key]: value })
              }}
              previewData={previewData}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <>
      <Reset />
      <Router>
        <Switch>
          {templates.map(template => (
            <Route key={template} path={'/' + template}>
              <Preview template={template} />
            </Route>
          ))}
          <Redirect to={templates[0]} />
        </Switch>
      </Router>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
