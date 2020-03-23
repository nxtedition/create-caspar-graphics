import React, { useRef, useState, useEffect } from 'react'
import Button from './button'
import { Editor } from './editor'
import {
  Tabs,
  TabList,
  Tab as ReachTab,
  TabPanels,
  TabPanel
} from '@reach/tabs'
import { PlayIcon, PauseIcon, StopIcon, UpdateIcon } from './icons'
import Settings from './settings'
import { Select, SelectOption } from './select'
import '@reach/tabs/styles.css'
import isPlainObject from 'lodash/isPlainObject'
import { usePersistentValue } from './use-persistent-value'
import isHotkey from 'is-hotkey'
import { States } from '../../'

export const Controls = ({
  isPlaying,
  stop,
  play,
  pause,
  settings,
  onChangeSetting,
  previewData,
  templateWindow,
  state
}) => {
  const { data, images } = previewData
  const tabs = isPlainObject(images)
    ? ['data', 'images', 'settings']
    : ['data', 'settings']
  const [updates, setUpdates] = useState(0)
  const [selectedTab, setSelectedTab] = usePersistentValue('selectedTab')
  const selectedTabIndex = Math.max(0, tabs.indexOf(selectedTab))
  const editorRef = useRef()

  const onUpdate = () => {
    const data = editorRef.current.getContent()

    if (data) {
      previewData.onChange({ type: 'data', value: data })
    }
  }

  // Keybindings
  useEffect(() => {
    const isSaveHotkey = isHotkey('mod+s')

    const onKeyDown = evt => {
      if ((isSaveHotkey(evt) || evt.key === 'F6') && onUpdate) {
        evt.preventDefault()
        onUpdate()
      } else if (evt.key === 'F2' && play) {
        evt.preventDefault()
        play()
      } else if (evt.key === 'F3' && pause) {
        evt.preventDefault()
        pause()
      } else if (evt.key === 'F1' && stop) {
        evt.preventDefault()
        stop()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    if (templateWindow) {
      templateWindow.document.addEventListener('keydown', onKeyDown)
    }

    return () => {
      document.removeEventListener

      if (templateWindow) {
        templateWindow.document.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [templateWindow])

  return (
    <Tabs
      index={selectedTabIndex}
      onChange={index => {
        setSelectedTab(tabs[index])
      }}
      css={`
        display: flex;
        flex: 1 0 0;
        font-size: 13px;
        flex-direction: column;
        border: 1px solid #eaeaea;
        border-radius: 4px;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          background: #f3f3f3;
          height: 24px;
          padding: 0 10px;
          border-bottom: 1px solid #ccc;
          width: 100%;
        `}
      >
        <Button
          style={{ marginRight: 5 }}
          disabled={
            ![States.playing, States.loaded, States.paused].includes(state)
          }
          title={isPlaying ? 'Pause (F4)' : 'Play (F2)'}
          onClick={() => {
            if (isPlaying) {
              pause()
            } else {
              play()
            }
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          style={{ marginRight: 5 }}
          disabled={state !== States.playing && state !== States.paused}
          title="Stop (F1)"
          onClick={() => {
            stop()
          }}
        >
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
        <TabList
          css={`
            background: transparent;
            display: flex;
            align-items: center;
            align-self: stretch;
          `}
        >
          <Tab>Data</Tab>
          {isPlainObject(images) ? <Tab>Images</Tab> : null}
          <Tab>Settings</Tab>
        </TabList>
      </div>
      <TabPanels
        css={`
          flex: 1 0 0;
          display: flex;
          flex-direction: column;
          width: 100%;

          & > div:not([hidden]) {
            flex: 1 0 0;
            display flex;
            flex-direction: column;
          }
        `}
      >
        <TabPanel>
          <div
            css={`
              display: grid;
              grid-template-rows: 24px 1fr;
              grid-template-columns: 1fr;
              align-content: stretch;
              align-items: stretch;
              flex: 1 0 0;
              width: 100%;
            `}
          >
            <div
              css={`
                background: #f3f3f3;
                border-bottom: 1px solid #ccc;
                display: flex;
                align-items: center;
                justify-content: space-between;
                grid-gap: 10px;
                font-size: 12px;
                padding: 0 15px;
              `}
            >
              {Array.isArray(previewData.dataKeys) && (
                <Select
                  value={previewData.selectedDataKey || ''}
                  onChange={value => {
                    previewData.onChange({ type: 'data', value })
                  }}
                >
                  {previewData.dataKeys.map(key => (
                    <SelectOption
                      key={key}
                      css={`
                        cursor: default;
                        font-weight: ${key === previewData.selectedDataKey
                          ? 'bold'
                          : 'normal'};
                      `}
                      value={key}
                    >
                      {key}
                    </SelectOption>
                  ))}
                </Select>
              )}
              <div
                css={`
                  flex: 1 0 0;
                  font-size: 10px;
                  display: flex;
                  justify-content: flex-end;
                `}
              >
                <Button
                  title={`Update (${getPrettySequence('mod+s')}, F6)`}
                  onClick={() => {
                    onUpdate()
                  }}
                >
                  <UpdateIcon />
                </Button>
              </div>
            </div>
            <div
              css={`
                position: relative;
              `}
            >
              <Editor ref={editorRef} value={data} onSave={onUpdate} />
            </div>
          </div>
        </TabPanel>
        {isPlainObject(images) ? (
          <TabPanel
            css={`
              overflow: overlay;
            `}
          >
            <div
              css={`
                display: grid;
                grid-gap: 10px;
                padding: 10px;
                justify-content: start;
                grid-template-columns: repeat(
                  auto-fit,
                  minmax(150px, max-content)
                );
              `}
            >
              {Object.entries(images).map(([key, url]) => (
                <img
                  key={key}
                  title={key}
                  src={url}
                  onClick={() => {
                    previewData.onChange({
                      type: 'image',
                      value: key === previewData.selectedImageKey ? null : key
                    })
                  }}
                  css={`
                    border-radius: 4px;
                    border: 1px solid white;
                    display: block;
                    max-width: 288px;
                    width: 100%;
                    height: auto;

                    ${key === previewData.selectedImageKey
                      ? 'box-shadow: 0 0 0 2px #1b73e8'
                      : 'box-shadow: 0 0 0 1px #ddd;'};
                  `}
                />
              ))}
            </div>
          </TabPanel>
        ) : null}
        <TabPanel>
          <Settings value={settings} onChange={onChangeSetting} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

const Tab = ({ children }) => (
  <ReachTab
    css={`
      &[data-reach-tab] {
        transition: border-color 0.2s ease-in;
        border-bottom: 1px solid transparent;
        color: #444;
        display: flex;
        align-items: center;
        transform: translateY(1px);
        height: 100%;
        display: flex;
        padding: 0 12px;
      }

      &[data-reach-tab][data-selected] {
        border-color: #1b73e8;
        color: #222;
      }
    `}
  >
    {children}
  </ReachTab>
)

const getNavigator = () => {
  const { userAgent, platform } = window.navigator

  return {
    isMac: /Mac|iPod|iPhone|iPad/.test(platform),
    isElectron: /Electron/.test(userAgent)
  }
}

const getPrettySequence = sequence => {
  if (typeof sequence !== 'string') {
    return ''
  }

  const { isMac } = getNavigator()

  return sequence
    .toUpperCase()
    .replace(/mod\+/gi, isMac ? '⌘' : 'Ctrl+')
    .replace(/alt\+/gi, isMac ? '⌥' : 'Alt+')
    .replace(/ctrl\+/gi, isMac ? '⌃' : 'Ctrl+')
    .replace(/del/gi, isMac ? '⌦' : 'Del')
    .replace(/shift\+/gi, '⇧')
}
