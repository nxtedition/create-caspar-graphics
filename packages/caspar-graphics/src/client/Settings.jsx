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

export const TopSettings = ({ value, onChange }) => {
  const {
    showSidebar = true,
    autoPlay,
    showJson,
    serverUrl,
    serverChannel
  } = value

  if (!showSidebar) {
    return (
      <div className={styles.container}>
        <button
          className={`${styles.button} ${styles.menuButton}`}
          style={{ marginLeft: -12 }}
          onClick={() => {
            onChange(value => ({ ...value, showSidebar: true }))
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
            onChange={serverUrl => {
              onChange(value => ({ ...value, serverUrl }))
            }}
          />
          <Input
            value={serverChannel ?? ''}
            label="Channel"
            type="number"
            min="1"
            onChange={serverChannel => {
              onChange(value => ({ ...value, serverChannel }))
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
          onChange={autoPlay => {
            onChange(value => ({ ...value, autoPlay }))
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
          onChange={showJson => {
            onChange(value => ({ ...value, showJson }))
          }}
        />
      </div>
      <button
        className={`${styles.button} ${styles.menuButton}`}
        onClick={() => {
          onChange(value => ({ ...value, showSidebar: false }))
        }}
      >
        <FiChevronsLeft />
      </button>
    </div>
  )
}

export const BottomSettings = ({ value, onChange, colorMode }) => {
  const { background, colorScheme } = value

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
              onChange={background => {
                onChange(value => ({ ...value, background }))
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Menu>
        <MenuTrigger className={styles.button}>
          {colorMode === 'light' ? <FiSun /> : <FiMoon />}
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup
            value={colorScheme || 'system'}
            onValueChange={colorScheme => {
              onChange(value => ({ ...value, colorScheme }))
            }}
          >
            <MenuRadioItem value="system">System</MenuRadioItem>
            <MenuRadioItem value="light">Light</MenuRadioItem>
            <MenuRadioItem value="dark">Dark</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  )
}
