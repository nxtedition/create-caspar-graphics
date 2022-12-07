import React, {
  useState,
  useReducer,
  useRef,
  useEffect,
  useLayoutEffect,
  createElement
} from 'react'
import { createRoot } from 'react-dom/client'
import { Screen } from './Screen'
import { Sidebar } from './Sidebar'
import { usePersistentValue } from './use-persistent-value'
import styles from './index.module.css'
import './global.css'

const States = {
  loading: 0,
  loaded: 1,
  playing: 2,
  stopped: 3
}

function App() {
  const [state, dispatch] = useReducer(reducer, {})
  const [settings, setSettings] = usePersistentValue(`caspar-graphics`, {
    showSidebar: true,
    autoPlay: false,
    background: '#21ECAF',
    imageOpacity: 0.5,
    colorScheme: 'dark'
  })
  const { projectName } = state
  const [persistedState, setPersistedState] = usePersistentValue(
    projectName ? `caspar-graphics.${projectName}` : null,
    {
      background: '#21ECAF',
      size: { width: 1920, height: 1080 },
      image: null
    }
  )

  useEffect(() => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${location.host}/updates`)

    socket.addEventListener('message', async evt => {
      try {
        const { type, payload } = JSON.parse(evt.data)
        const { projectName, templates } = payload
        document.title = `${projectName} | Caspar Graphics`

        let snapshot
        let settings

        try {
          settings = JSON.parse(window.localStorage.getItem('caspar-graphics'))
          snapshot = JSON.parse(
            window.localStorage.getItem(`caspar-graphics.${projectName}`)
          )
        } catch (err) { }

        dispatch({
          type: 'init',
          projectName,
          templates: getInitialState(templates, {
            ...(snapshot || {}),
            ...(settings || {})
          })
        })
      } catch (err) {
        console.error('Unable to get templates:', err)
      }
    })
  }, [])

  useEffect(() => {
    if (!Array.isArray(state.templates)) {
      return
    }

    const templates = {}

    for (const { name, enabled, open, data, preset, tab } of state.templates) {
      templates[name] = { enabled, open, data, preset, tab }
    }

    setPersistedState(persisted => ({ ...persisted, templates }))
  }, [state])

  return (
    <div className={styles.container}>
      <Sidebar
        state={state}
        dispatch={dispatch}
        settings={settings}
        onSettingsChange={setSettings}
        projectState={persistedState}
        onProjectStateChange={setPersistedState}
      />
      <Screen
        settings={settings}
        size={persistedState?.size}
        background={persistedState?.background || settings.background}
        image={persistedState?.image}
      >
        {state.templates
          ?.filter(template => template.enabled)
          .map(template => (
            <TemplatePreview
              key={template.name + template.removed}
              dispatch={dispatch}
              {...template}
            />
          ))}
      </Screen>
    </div>
  )
}

function reducer(state, action) {
  if (action.type === 'init') {
    return {
      ...state,
      projectName: action.projectName,
      templates: action.templates
    }
  }

  if (!action.template) {
    console.warn('The action you just dispatched is missing template:', action)
    return state
  }

  const index = state.templates.findIndex(
    template => template.name === action.template
  )

  if (index === -1) {
    return state
  }

  const template = state.templates[index]

  const updateTemplate = data => {
    const templates = [...state.templates]
    templates[index] = { ...template, ...data }
    return { ...state, templates }
  }

  switch (action.type) {
    case 'toggle-enabled':
      return updateTemplate({
        enabled: !template.enabled,
        show: template.enabled ? false : template.show
      })
    case 'toggle-open':
      return updateTemplate({ open: !template.open })
    case 'show':
      return updateTemplate({ show: true })
    case 'hide':
      return updateTemplate({ show: false })
    case 'removed':
      return updateTemplate({
        state: States.loading,
        removed: (template.removed ?? 0) + 1
      })
    case 'preset-change':
      const payload = { preset: action.preset }

      if (action.update) {
        payload.data = template.presets.find(
          ([key]) => key === action.preset
        )?.[1]
      }

      return updateTemplate(payload)
    case 'caspar-update':
      return updateTemplate({ data: action.data })
    case 'caspar-state':
      return updateTemplate({ state: action.state })
    case 'toggle-image':
      return updateTemplate({
        image:
          template.image?.url === action.url
            ? null
            : { url: action.url, opacity: 0.5 }
      })
    case 'select-tab':
      return updateTemplate({ tab: action.tab })
    default:
      return state
  }
}

export function getPresets(data) {
  if (!data) {
    return null
  }

  return Object.entries(data)
}

function getInitialState(templates, snapshot) {
  if (!Array.isArray(templates)) {
    return []
  }

  return templates
    .map(({ name, manifest }, index) => {
      const { previewData, previewImages, schema, layer } = manifest || {}
      const presets = getPresets(previewData)
      const templateSnapshot = snapshot.templates?.[name]

      return {
        name,
        manifest,
        schema,
        previewImages,
        previewData,
        presets,
        preset:
          presets?.find(([key]) => key === templateSnapshot?.preset)?.[0] ||
          presets?.[0]?.[0],
        enabled: templateSnapshot?.enabled ?? true,
        open: Boolean(templateSnapshot?.open),
        data: templateSnapshot?.data || presets?.[0]?.[1],
        show: Boolean(snapshot.autoPlay),
        tab: templateSnapshot?.tab,
        state: States.loading,
        layer: layer ?? index
      }
    })
    .sort((a, b) => a.layer - b.layer)
}

const TemplatePreview = ({ name, show, dispatch, layer, data, ...props }) => {
  const [templateWindow, setTemplateWindow] = useState()
  const [didShow, setDidShow] = useState(false)

  if (show && !didShow) {
    setDidShow(true)
  }

  // Data Updates
  useEffect(() => {
    if (templateWindow?.update) {
      templateWindow.update(data || {})
    }
  }, [templateWindow, data])

  // State Updates
  useEffect(() => {
    if (!templateWindow) {
      return
    }

    if (show) {
      templateWindow.play()
    } else if (didShow) {
      if (templateWindow.stop) {
        templateWindow.stop()
      } else {
        console.error('No window.stop found')
      }
    }
  }, [templateWindow, show, didShow])

  return (
    <iframe
      src={`/templates/${name}/index.html`}
      style={{ pointerEvents: show ? 'initial' : 'none' }}
      onLoad={evt => {
        const { contentWindow } = evt.target

        // Once the template has animated off, we want to reload it.
        // This is to imitate Caspar's remove method.
        contentWindow.remove = () => {
          contentWindow.location.reload()
          setTemplateWindow(null)
          dispatch({ type: 'removed', template: name })
        }

        // The play command might not be ready on load, so here we basically poll the template
        // to see if it has exposed a play command.
        let retries = 0

        function checkIfReady() {
          if (contentWindow.play) {
            setTemplateWindow(contentWindow)
          } else if (retries < 20) {
            setTimeout(checkIfReady, (++retries) ** 2 * 10)
          } else {
            console.error('No window.play found')
          }
        }

        checkIfReady()
      }}
    />
  )
}

if (!window.reactRoot) {
  window.reactRoot = createRoot(document.getElementById('root'))
}

window.reactRoot.render(createElement(App))
