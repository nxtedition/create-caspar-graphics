import React, {
  useState,
  useReducer,
  useRef,
  useEffect,
  useLayoutEffect
} from 'react'
import isPlainObject from 'lodash/isPlainObject'
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

export default function App() {
  const [data, setData] = useState()

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.send('cg:preview-ready')
      import.meta.hot.on('cg:update', ({ projectName, templates }) => {
        setData(data => ({
          projectName: projectName ?? data?.projectName,
          templates
        }))
        
        if (projectName) {
          document.title = `${projectName} | Caspar Graphics`
        }
      })
    }
  }, [])

  if (!data) {
    return null
  }

  if (!data.templates?.length) {
    return (
      <div className={styles.empty}>
        <div>No templates found</div>
      </div>
    )
  }

  return <Preview {...data} />
}

function reducer(state, action) {
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
      return updateTemplate({ state: States.loading, removed: (template.removed ?? 0) + 1 })
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

  if (Object.values(data).every(value => isPlainObject(value))) {
    return Object.entries(data)
  }

  return [['DEFAULT_KEY', data]]
}

function getInitialState(templates, snapshot) {
  if (!Array.isArray(templates)) {
    return {}
  }

  return {
    templates: templates
      .map(({ name, manifest }, index) => {
        const { previewData, previewImages, schema } = manifest || {}
        const presets = getPresets(previewData)
        const templateSnapshot = snapshot?.templates?.[name]

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
          layer: index
        }
      })
      .sort((a, b) => a.layer - b.layer)
  }
}

function Preview({
  templates,
  templatePreviews = [],
  projectName = '',
  size = { width: 1920, height: 1080 }
}) {
  const [persistedState, setPersistetState] = usePersistentValue(
    `cg.${projectName}`,
    {
      showSidebar: true,
      autoPlay: false,
      background: '#21ECAF',
      imageOpacity: 0.5,
      colorScheme: 'system'
    }
  )
  const initialState = getInitialState(templates, persistedState)
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const templates = {}

    for (const {
      name,
      enabled,
      open,
      data,
      preset,
      tab
    } of state?.templates) {
      templates[name] = { enabled, open, data, preset, tab }
    }

    setPersistetState(persisted => ({ ...persisted, templates }))
  }, [state])

  return (
    <div className={styles.container}>
      <Sidebar
        state={state}
        dispatch={dispatch}
        settings={persistedState}
        onSettingsChange={setPersistetState}
      />
      <Screen settings={persistedState} size={size}>
        {state.templates
          .filter(template => template.enabled)
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

const TemplatePreview = ({ name, show, dispatch, layer, data, ...props }) => {
  const [templateWindow, setTemplateWindow] = useState()
  const [didShow, setDidShow] = useState(false)

  if (show && !didShow) {
    setDidShow(true)
  }

  // Data Updates
  useEffect(() => {
    // TODO: in nxt we often start by sending an empty object.
    // Should we have a mode (setting?) to do the same here?
    if (templateWindow) {
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
      templateWindow.stop()
    }
  }, [templateWindow, show, didShow])

  return (
    <iframe
      src={`/templates/${name}/index.html`}
      style={{ pointerEvents: show ? 'initial' : 'none' }}
      onLoad={evt => {
        const { contentWindow } = evt.target

        contentWindow.onReady = () => {
          setTemplateWindow(contentWindow)
          dispatch({
            type: 'caspar-state',
            template: name,
            state: States.loaded
          })
        }

        // Once the template has animated off, we want to reload it.
        // This is to imitate Caspar's remove method.
        contentWindow.remove = () => {
          console.log('REMOVED')
          contentWindow.location.reload()
          setTemplateWindow(null)
          dispatch({ type: 'removed', template: name })
        }
      }}
    />
  )
}

