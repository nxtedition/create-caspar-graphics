import React, { useState, useEffect } from 'react'

export function usePersistentValue(key, defaultValue) {
  const [value, setValue] = useState(defaultValue)

  if (value === undefined && key) {
    const stored = window.localStorage.getItem(key)
    setValue(stored !== null ? JSON.parse(stored) : defaultValue ?? null)
  }

  useEffect(() => {
    if (key) {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])

  return [key ? value : null, setValue]
}
