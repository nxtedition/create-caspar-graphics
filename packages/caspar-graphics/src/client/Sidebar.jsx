import React, { useState, useLayoutEffect } from 'react'
import styles from './sidebar.module.css'
import { MdArrowDropDown, MdChevronRight } from 'react-icons/md'
import { FiArrowRight, FiArrowRightCircle } from 'react-icons/fi'
import { Switch } from './Switch'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Input } from './Input'
import { Checkbox } from './Checkbox'
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuLabel,
  MenuSeparator
} from './Menu'
import { getPresets } from './'
import { IoIosSettings } from 'react-icons/io'
import { TopSettings, BottomSettings } from './Settings'
import { JsonEditor } from './JsonEditor'
import * as Tabs from '@radix-ui/react-tabs'

export const Sidebar = ({ state, dispatch, settings, onSettingsChange }) => {
  const { templates } = state

  // TODO:
  const { colorScheme = 'system' } = settings
  let colorMode = colorScheme
  if (colorMode === 'system') {
    colorMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  useLayoutEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme')
    document.body.classList.add(colorMode + '-theme')
  }, [colorMode])

  return (
    <div className={styles.sidebar} data-show={Boolean(settings.showSidebar)}>
      <TopSettings
        value={settings}
        onChange={onSettingsChange}
        colorMode={colorMode}
      />
      {settings.showSidebar && (
        <>
          <div className={styles.templates}>
            {templates.map(template => (
              <Template
                key={template.name}
                showJson={settings.showJson}
                dispatch={dispatch}
                settings={settings}
                onSettingsChange={onSettingsChange}
                {...template}
              />
            ))}
          </div>
          <BottomSettings
            value={settings}
            onChange={onSettingsChange}
            colorMode={colorMode}
          />
        </>
      )}
    </div>
  )
}

const Template = ({
  showJson,
  manifest,
  name,
  data,
  previewData,
  previewImages,
  show,
  dispatch,
  schema = {},
  preset,
  presets,
  settings,
  onSettingsChange,
  enabled,
  open,
  tab = 'data'
}) => {
  const [pending, setPending] = useState()
  const currentPreset = presets?.find(([key]) => key === preset)
  const currentData = pending ?? data
  const hasPendingUpdate =
    pending != null && JSON.stringify(pending) !== JSON.stringify(data)
  const hasImages = previewImages?.length > 0

  return (
    <Collapsible.Root
      className={styles.template}
      open={open}
      onOpenChange={() => {
        dispatch({ type: 'toggle-open', template: name })
      }}
    >
      <div
        className={styles.header}
        data-state={enabled ? 'enabled' : 'disabled'}
      >
        <Collapsible.Trigger className={styles.trigger}>
          <MdChevronRight />
          <span>{manifest?.name || name}</span>
        </Collapsible.Trigger>
        <Checkbox
          value={enabled}
          onChange={() => {
            dispatch({ type: 'toggle-enabled', template: name })
          }}
        />
        <Switch
          disabled={!enabled}
          checked={show}
          onChange={checked => {
            dispatch({
              type: checked ? 'show' : 'hide',
              template: name
            })
          }}
        />
      </div>
      <Collapsible.Content className={styles.content}>
        <Tabs.Root
          className={styles.tabs}
          value={tab}
          onValueChange={tab => {
            dispatch({ type: 'select-tab', template: name, tab })
          }}
        >
          <Tabs.List className={styles.tabList} aria-label={'Manage ' + tab}>
            <Tabs.Trigger className={styles.tabTrigger} value="data">
              Data
            </Tabs.Trigger>
            {hasImages && (
              <Tabs.Trigger className={styles.tabTrigger} value="image">
                Image
              </Tabs.Trigger>
            )}
            {presets?.length > 1 && (
              <Tabs.Trigger className={styles.tabTrigger} value="presets">
                Presets
              </Tabs.Trigger>
            )}
            {tab === 'data' && (
              <div className={styles.splitButton}>
                <button
                  className={styles.button}
                  onClick={() => {
                    dispatch({
                      type: 'caspar-update',
                      template: name,
                      data: currentData
                    })
                    setPending(null)
                  }}
                >
                  Update
                </button>
                <Menu>
                  <MenuTrigger className={styles.button}>
                    <MdArrowDropDown />
                  </MenuTrigger>
                  <MenuContent align="end" sideOffset={3}>
                    {presets?.length > 1 && (
                      <>
                        <MenuLabel>Presets</MenuLabel>
                        <MenuRadioGroup
                          value={preset}
                          onValueChange={key => {
                            dispatch({
                              type: 'preset-change',
                              template: name,
                              preset: key
                            })
                            setPending(
                              presets.find(preset => preset[0] === key)?.[1]
                            )
                          }}
                        >
                          {presets.map(([key, data]) => (
                            <MenuRadioItem key={key} value={key}>
                              {key}
                            </MenuRadioItem>
                          ))}
                        </MenuRadioGroup>
                        <MenuSeparator />
                      </>
                    )}
                    {presets?.length > 0 && (
                      <MenuItem
                        disabled={
                          currentPreset != null &&
                          currentData != null &&
                          JSON.stringify(currentPreset[1]) ===
                          JSON.stringify(currentData)
                        }
                        onSelect={() => {
                          setPending(presets[0][1])
                        }}
                      >
                        Reset
                      </MenuItem>
                    )}
                    <MenuItem
                      disabled={
                        currentData == null || !Object.keys(currentData).length
                      }
                      onSelect={() => {
                        setPending({})
                      }}
                    >
                      Clear
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </div>
            )}
          </Tabs.List>
          <Tabs.Content className={styles.tabContent} value="data">
            <form
              className={styles.data}
              onKeyDown={evt => {
                if (
                  (evt.key === 's' && evt.metaKey) ||
                  (!showJson && evt.key === 'Enter')
                ) {
                  evt.preventDefault()

                  dispatch({
                    type: 'caspar-update',
                    template: name,
                    data: pending || data
                  })
                }
              }}
              onSubmit={evt => {
                evt.preventDefault()
              }}
            >
              {showJson || !Object.keys(schema || {}).length ? (
                <JsonEditor value={currentData || {}} onChange={setPending} />
              ) : (
                Object.entries(schema).map(([key, property]) => {
                  const onChange = value => {
                    setPending({ ...currentData, [key]: value })
                  }

                  let type = property.type
                  const value = currentData?.[key]
                  const props = {
                    key,
                    id: key,
                    label: property.label ?? key,
                    value,
                    onChange
                  }

                  if (type === 'boolean') {
                    return <Checkbox {...props} />
                  }

                  if (type === 'image') {
                    type = 'string'
                  }

                  return <Input {...props} value={value || ''} type={type} />
                })
              )}
            </form>
          </Tabs.Content>
          {hasImages && (
            <Tabs.Content className={styles.tabContent} value="image">
              <div className={styles.images}>
                {previewImages.map(url => (
                  <button
                    key={url}
                    className={styles.imageToggle}
                    data-active={settings.image?.url === url ? true : undefined}
                    onClick={() => {
                      onSettingsChange(settings => ({
                        ...settings,
                        image: settings.image?.url === url ? null : { url }
                      }))
                    }}
                  >
                    <img src={url} className={styles.image} />
                  </button>
                ))}
              </div>
            </Tabs.Content>
          )}
          {presets?.length > 1 && (
            <Tabs.Content className={styles.tabContent} value="presets">
              <div className={styles.presets}>
                {presets.map(([key, data]) => (
                  <button
                    key={key}
                    className={styles.preset}
                    data-active={key === preset ? true : undefined}
                    onClick={() => {
                      dispatch({
                        type: 'preset-change',
                        template: name,
                        preset: key,
                        update: true
                      })
                    }}
                  >
                    <span>{key}</span>
                    <FiArrowRightCircle />
                  </button>
                ))}
              </div>
            </Tabs.Content>
          )}
        </Tabs.Root>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
