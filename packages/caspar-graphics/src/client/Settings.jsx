import React, { useState } from 'react'
import styles from './settings.module.css'
import { MdMenu, MdMoreHoriz, MdMoreVert, MdSettings } from 'react-icons/md'
import { FiSun, FiMoon, FiChevronsLeft } from 'react-icons/fi'
import { IoIosSettings } from 'react-icons/io'
import { Switch } from './Switch'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import { Input } from './Input'
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem
} from './Menu'
import { ASPECT_RATIOS } from './app'

export const TopSettings = ({ value, onChange }) => {
  const {
    showSidebar = true,
    autoPlay,
    showJson,
    serverUrl,
    serverChannel,
  } = value

  if (!showSidebar) {
    return (
      <div className={styles.container}>
        <button
          className={`${styles.button} ${styles.menuButton}`}
          style={{ marginLeft: -12 }}
          onClick={() => {
            onChange((value) => ({ ...value, showSidebar: true }))
          }}
        >
          <MdMenu />
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Popover>
        <PopoverTrigger className={styles.button + ' ' + styles.settingsButton}>
          <IoIosSettings />
        </PopoverTrigger>
        <PopoverContent
          className={styles.settingsContent}
          align="start"
          sideOffset={0}
        >
          <h2>CasparCG Server</h2>
          <Input
            value={serverUrl ?? ''}
            label="Server URL"
            onChange={(serverUrl) => {
              onChange((value) => ({ ...value, serverUrl }))
            }}
          />
          <Input
            value={serverChannel ?? ''}
            label="Channel"
            type="number"
            min="1"
            onChange={(serverChannel) => {
              onChange((value) => ({ ...value, serverChannel }))
            }}
          />
        </PopoverContent>
      </Popover>
      <div className={styles.control}>
        <label htmlFor="autoPlay">Autoplay</label>
        <Switch
          labels={false}
          id="autoPlay"
          className={styles.switch}
          checked={Boolean(autoPlay)}
          onChange={(autoPlay) => {
            onChange((value) => ({ ...value, autoPlay }))
          }}
        />
      </div>
      <div className={styles.control}>
        <label htmlFor="json">JSON</label>
        <Switch
          labels={false}
          id="json"
          className={styles.switch}
          checked={Boolean(showJson)}
          onChange={(showJson) => {
            onChange((value) => ({ ...value, showJson }))
          }}
        />
      </div>
      <button
        className={`${styles.button} ${styles.menuButton}`}
        onClick={() => {
          onChange((value) => ({ ...value, showSidebar: false }))
        }}
      >
        <FiChevronsLeft />
      </button>
    </div>
  )
}

export const BottomSettings = ({
  settings,
  onSettingsChange,
  projectState,
  onProjectStateChange,
  colorMode,
}) => {
  const { colorScheme } = settings
  const { background, aspectRatio } = projectState || {}

  return (
    <div className={styles.container}>
      <div className={styles.control}>
        <label>Background</label>
        <Popover>
          <PopoverTrigger className={styles.colorPicker}>
            <span style={{ background }} />
          </PopoverTrigger>
          <PopoverContent>
            <HexColorPicker
              color={background}
              onChange={(background) => {
                onProjectStateChange((value) => ({ ...value, background }))
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Menu>
        <MenuTrigger className={styles.button} style={{ marginLeft: 'auto' }}>
          {colorMode === 'light' ? <FiSun /> : <FiMoon />}
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup
            value={colorScheme || 'system'}
            onValueChange={(colorScheme) => {
              onSettingsChange((value) => ({ ...value, colorScheme }))
            }}
          >
            <MenuRadioItem value="system">System</MenuRadioItem>
            <MenuRadioItem value="light">Light</MenuRadioItem>
            <MenuRadioItem value="dark">Dark</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger className={styles.button} title='Aspect Ratio (A)'>
          <GuideIcon />
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup
            value={aspectRatio ?? null}
            onValueChange={(aspectRatio) => {
              onProjectStateChange((value) => ({ ...value, aspectRatio }))
            }}
          >
            {Object.entries(ASPECT_RATIOS).map(([label, value]) => (
              <MenuRadioItem key={value} value={value}>{label}</MenuRadioItem>
            ))}
            <MenuRadioItem value={null}>Off</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  )
}

const GuideIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.6 4.1v7.8h10.8V4.1H2.6zm-.1-1.6A1.5 1.5 0 0 0 1 4v8a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 15 12V4a1.5 1.5 0 0 0-1.5-1.5h-11z"
        fill="currentColor"
      />
      <rect
        x="7"
        y="1.5"
        width="2"
        height="4"
        rx=".5"
        fill="currentColor"
      />
      <rect
        x="7"
        y="10.5"
        width="2"
        height="4"
        rx=".5"
        fill="currentColor"
      />
      <rect
        x="16"
        y="7"
        width="2"
        height="4"
        rx=".5"
        transform="rotate(90 16 7)"
        fill="currentColor"
      />
      <rect
        x="4"
        y="7"
        width="2"
        height="4"
        rx=".5"
        transform="rotate(90 4 7)"
        fill="currentColor"
      />
    </svg>
  )
}
