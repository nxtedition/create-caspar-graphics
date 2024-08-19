import React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import styles from './switch.module.css'
import { motion } from 'framer-motion'

export const Switch = ({ checked, onChange, className, labels, id, ...props }) => {
  return (
    <SwitchPrimitive.Root
      id={id}
      className={`${styles.root} ${className}`}
      title={checked ? 'Stop (Enter / Space)' : 'Play (Enter / Space)'}
      checked={checked}
      onCheckedChange={onChange}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          className={styles.thumb}
          initial={false}
          animate={{ x: checked ? '100%' : '0%' }}
          transition={{ type: "spring", stiffness: 400, damping: 30  }}
        />
      </SwitchPrimitive.Thumb>
      {labels !== false && (
        <>
          <div data-label='off'>
            <span>Off</span>
          </div>
          <div data-label='on'>
            <span>On</span>
          </div>
        </>
      )}
    </SwitchPrimitive.Root>
  )
}
