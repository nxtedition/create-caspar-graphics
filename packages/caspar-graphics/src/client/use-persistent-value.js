import React, { useState, useEffect, useCallback } from 'react'

export function usePersistentValue(key, defaultValue) {
  const [value, setValue] = useState()

  if (value === undefined && key) {
    const stored = window.localStorage.getItem(key)
    setValue(stored !== null ? JSON.parse(stored) : defaultValue ?? null)
  }

  const onChange = valueOrFn => {
    const newValue =
      typeof valueOrFn === 'function' ? valueOrFn(value) : valueOrFn

    setValue(newValue)

    if (key) {
      window.localStorage.setItem(
        key,
        newValue != null ? JSON.stringify(newValue) : undefined
      )
    }
  }

  return [key ? value || defaultValue : null, onChange]
}
