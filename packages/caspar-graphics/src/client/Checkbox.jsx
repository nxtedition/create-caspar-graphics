import React from 'react'
import * as Primitive from '@radix-ui/react-checkbox'
import styles from './checkbox.module.css'
import { MdCheck } from 'react-icons/md'

export const Checkbox = ({ value, onChange, label, id }) => {
  return (
    <div className={styles.container}>
      <Primitive.Root
        className={styles.checkbox}
        id={id}
        checked={value === true}
        onCheckedChange={onChange}
      >
        <Primitive.Indicator>
          <MdCheck />
        </Primitive.Indicator>
      </Primitive.Root>
      {label != null && (

      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      )}
    </div>
  )
}
