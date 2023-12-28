import React from 'react'
import styles from './input.module.css'

export const Input = ({ type = 'text', id, label, onChange, ...props }) => {
  return (
    <div className={styles.container}>
      <label htmlFor={id}>{label}</label>
      <input
        className={styles.input}
        type={type}
        id={id}
        onChange={evt => {
          onChange(evt.target.value)
        }}
        {...props}
      />
    </div>
  )
}
