import React from 'react'
import * as MenuPrimitive from '@radix-ui/react-dropdown-menu'
import styles from './menu.module.css'
import { MdChevronRight } from 'react-icons/md'

export const Menu = MenuPrimitive.Root
export const MenuTrigger = MenuPrimitive.Trigger

export const MenuContent = ({ children, ...props }) => {
  return ( <MenuPrimitive.Portal>
      <MenuPrimitive.Content className={styles.content} {...props}>
        {children}
      </MenuPrimitive.Content>
    </MenuPrimitive.Portal>
  )
}

export const MenuItem = ({ children, ...props }) => {
  return (
    <MenuPrimitive.Item className={styles.item} {...props}>
      {children}
    </MenuPrimitive.Item>
  )
}

export const MenuRadioGroup = ({ children, ...props }) => {
  return (
    <MenuPrimitive.RadioGroup className={styles.radioGroup} {...props}>
      {children}
    </MenuPrimitive.RadioGroup>
  )
}

export const MenuRadioItem = ({ children, ...props }) => {
  return (
    <MenuPrimitive.RadioItem className={`${styles.item} ${styles.radioItem}`} {...props}>
      <MenuPrimitive.ItemIndicator>
        <svg
          width='15'
          height='15'
          viewBox='0 0 15 15'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z'
            fill='currentColor'
          />
        </svg>
      </MenuPrimitive.ItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export const MenuSub = MenuPrimitive.Sub

export const MenuSubContent = ({ children, ...props }) => {
  return (
    <MenuPrimitive.SubContent className={styles.content} {...props}>
      {children}
    </MenuPrimitive.SubContent>
  )
}

export const MenuSubTrigger = ({ children }) => {
  return (
    <MenuPrimitive.SubTrigger className={styles.item}>
      {children}
      <div className={styles.rightSlot}>
        <MdChevronRight />
      </div>
    </MenuPrimitive.SubTrigger>
  )
}

export const MenuLabel = ({ children }) => {
  return (
    <MenuPrimitive.Label className={styles.label}>
      {children}
    </MenuPrimitive.Label>
  )
}

export const MenuSeparator = () => {
  return <MenuPrimitive.Separator className={styles.separator} />
}

