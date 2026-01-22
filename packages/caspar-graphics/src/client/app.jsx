import React, { useState, useReducer, useEffect, Fragment, useCallback } from 'react'
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
  stopped: 3,
}

export const ASPECT_RATIOS = {
  '16:9': '16:9',
  '9:16': '9:16',
  '4:3': '4:3',
  '1:1': '1:1'
}

export function App({ name, templates: initialTemplates }) {
  const [state, dispatch] = useReducer(reducer, {})
  const [serverState, setServerState] = useState()
  const [settings, setSettings] = usePersistentValue(`caspar-graphics`, {
    showSidebar: true,
    autoPlay: false,
    background: '#21ECAF',
    imageOpacity: 0.5,
    colorScheme: 'dark',
  })
  const { projectName, socket } = state
  const [persistedState, setPersistedState] = usePersistentValue(
    projectName ? `caspar-graphics.${projectName}` : null,
    {
      background: '#21ECAF',
      image: null,
      aspectRatio: '16:9',
    },
  )

  useEffect(() => {
    if (initialTemplates) {
      dispatch({
        type: 'init',
        ...getInitialState({ projectName: name, templates: initialTemplates }),
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
        ...getInitialState({ projectName, templates }),
      })
    }

    socket.addEventListener('message', (evt) => {
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

    setPersistedState((persisted) => ({ ...persisted, templates }))
  }, [state])

  const { serverUrl, serverChannel } = settings

  // Connect to CasparCG server.
  useEffect(() => {
    if (!socket || !serverUrl) {
      return
    }

    socket.send(JSON.stringify({ type: 'connect', url: serverUrl, channel: serverChannel }))
  }, [socket, serverUrl, serverChannel])

  const onKeyDown = useCallback(evt => {
    if (
      ['INPUT', 'SELECT', 'TEXTAREA'].includes(evt.target.tagName) ||
      evt.target.contentEditable === 'true'
    ) {
      return
    }

    switch (evt.key) {
      case 'n': {
        // Trigger next for all enabled and playing templates
        dispatch({ type: 'caspar-next-all' })
        break
      }
      case 'a':
        setPersistedState((persisted) => {
          const ratios = Object.values(ASPECT_RATIOS)
          const index = ratios.indexOf(persisted.aspectRatio)
          return {
            ...persisted,
            aspectRatio: index < ratios.length - 1 ? ratios[index + 1] : null,
          }
        })
        break
      case 'Enter':
        dispatch({ type: 'show' })
      case ' ':
        break
    }
  }, [setPersistedState])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

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
        background={persistedState?.background || settings.background}
        aspectRatio={persistedState?.aspectRatio}
        image={persistedState?.image}
        imageOpacity={persistedState?.imageOpacity}
      >
        {(screenSize) =>
          state.templates
            ?.filter((template) => template.enabled)
            .map((template) => (
              <Fragment key={template.name}>
                <TemplatePreview
                  key={template.name + template.removed}
                  dispatch={dispatch}
                  projectSize={persistedState?.size}
                  containerSize={screenSize}
                  onKeyDown={onKeyDown}
                  {...template}
                  nextExecutionId={template.nextExecutionId}
                />
                {serverState === 'connected' && (
                  <ServerTemplate
                    key={template.name}
                    socket={socket}
                    {...template}
                    nextExecutionId={template.nextExecutionId}
                  />
                )}
              </Fragment>
            ))
        }
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
      templates: action.templates,
    }
  }

  if (!action.template && action.type !== 'caspar-next-all') {
    console.warn('The action you just dispatched is missing template:', action)
    return state
  }

  // Find template index for single-template actions
  const index = state.templates.findIndex(
    (template) => template.name === action.template,
  )

  const updateTemplate = (data, idx = index) => {
    const templates = [...state.templates]
    templates[idx] = { ...state.templates[idx], ...data }
    return { ...state, templates }
  }

  switch (action.type) {
    case 'toggle-enabled':
      return updateTemplate({
        enabled: !state.templates[index].enabled,
        show: state.templates[index].enabled ? false : state.templates[index].show,
      })
    case 'toggle-open':
      return updateTemplate({ open: !state.templates[index].open })
    case 'show':
      // TODO: wait for `removed` to arrive before allowing show a second time.
      return updateTemplate({ show: true })
    case 'hide':
      return updateTemplate({ show: false })
    case 'removed':
      return updateTemplate({
        state: States.loading,
        removed: (state.templates[index].removed ?? 0) + 1,
      })
    case 'preset-change':
      const payload = { preset: action.preset }

      if (action.update) {
        payload.data = state.templates[index].presets.find(
          ([key]) => key === action.preset,
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
          state.templates[index].image?.url === action.url
            ? null
            : { url: action.url, opacity: 0.5 },
      })
    case 'select-tab':
      return updateTemplate({ tab: action.tab })
    case 'caspar-next': {
      // Bump nextExecutionId to a new value (timestamp)
      return updateTemplate({ nextExecutionId: Date.now() })
    }
    case 'caspar-next-all': {
      // Trigger next for all enabled and playing templates
      const templates = state.templates.map(t =>
        t.enabled && t.show ? { ...t, nextExecutionId: Date.now() } : t
      )
      return { ...state, templates }
    }
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
      window.localStorage.getItem('caspar-graphics'),
    )
    const projectSettings = JSON.parse(
      window.localStorage.getItem(`caspar-graphics.${projectName}`),
    )
    snapshot = { ...globalSettings, ...projectSettings }
  } catch (err) {}

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
          layer: layer ?? index,
          nextExecutionId: null,
        }
      })
      .sort((a, b) => a.layer - b.layer),
  }
}
