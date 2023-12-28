import React, { useState, useReducer, useEffect, Fragment } from 'react'
import { Screen } from './Screen'
import { Sidebar } from './Sidebar'
import { usePersistentValue } from './use-persistent-value'
import styles from './index.module.css'
import { TemplatePreview, ServerTemplate } from './TemplatePreview'
import './global.css'

const States = {
  loading: 0,
  loaded: 1,
  playing: 2,
  stopped: 3
}

export function App({ name, templates: initialTemplates }) {
  const [state, dispatch] = useReducer(reducer, {})
  const [serverState, setServerState] = useState()
  const [settings, setSettings] = usePersistentValue(`caspar-graphics`, {
    showSidebar: true,
    autoPlay: false,
    background: '#21ECAF',
    imageOpacity: 0.5,
    colorScheme: 'dark'
  })
  const { projectName, socket } = state
  const [persistedState, setPersistedState] = usePersistentValue(
    projectName ? `caspar-graphics.${projectName}` : null,
    {
      background: '#21ECAF',
      size: { width: 1920, height: 1080 },
      image: null
    }
  )

  useEffect(() => {
    if (initialTemplates) {
      dispatch({
        type: 'init',
        ...getInitialState({ projectName: name, templates: initialTemplates })
      })
    }
  }, [initialTemplates, name])

  useEffect(() => {
    if (initialTemplates) {
      return
    }

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${location.host}/updates`)

    function init(payload) {
      const { projectName, templates } = payload
      document.title = `${projectName} | Caspar Graphics`

      dispatch({
        type: 'init',
        socket,
        ...getInitialState({ projectName, templates })
      })
    }

    socket.addEventListener('message', evt => {
      const { type, payload } = JSON.parse(evt.data)

      console.log('message', { type, payload })

      switch (type) {
        case 'init':
          init(payload)
          break
        case 'connected':
          setServerState('connected')
          break
      }
    })
  }, [initialTemplates])

  // Persist project state.
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

  const { serverUrl, serverChannel } = settings

  // Connect to CasparCG server.
  useEffect(() => {
    if (!socket || !serverUrl) {
      return
    }

    console.log('connect', serverUrl)
    socket.send(JSON.stringify({ type: 'connect', url: serverUrl }))
  }, [socket, serverUrl])

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
            <Fragment key={template.name}>
              <TemplatePreview
                key={template.name + template.removed}
                dispatch={dispatch}
                settings={settings}
                {...template}
              />
              {serverState === 'connected' && (
                <ServerTemplate
                  key={template.name}
                  socket={socket}
                  {...template}
                />
              )}
            </Fragment>
          ))}
      </Screen>
    </div>
  )
}

function reducer(state, action) {
  if (action.type === 'init') {
    return {
      ...state,
      socket: action.socket,
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
      // TODO: wait for `removed` to arrive before allowing show a second time.
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

function getInitialState({ projectName, templates }) {
  if (!Array.isArray(templates)) {
    return []
  }

  let snapshot

  try {
    const globalSettings = JSON.parse(
      window.localStorage.getItem('caspar-graphics')
    )
    const projectSettings = JSON.parse(
      window.localStorage.getItem(`caspar-graphics.${projectName}`)
    )
    snapshot = { ...globalSettings, ...projectSettings }
  } catch (err) { }

  return {
    projectName,
    templates: templates
      .map(({ name, manifest, src }, index) => {
        const { previewData, previewImages, schema, layer } = manifest || {}
        const presets = getPresets(previewData)
        const templateSnapshot = snapshot.templates?.[name]

        return {
          name,
          src,
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
}
