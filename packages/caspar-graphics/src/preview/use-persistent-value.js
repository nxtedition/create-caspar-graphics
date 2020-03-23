import React, { useState, useEffect } from 'react'

export function usePersistentValue(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key)

    try {
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
    } catch (err) {
      return null
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
