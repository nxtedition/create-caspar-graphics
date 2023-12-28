import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useCaspar } from './use-caspar'

export const FramerMotion = ({ children, hide, mode = 'wait' }) => {
  const { isPlaying, safeToRemove, isStopped } = useCaspar()

  return (
    <AnimatePresence mode={mode} onExitComplete={isStopped ? safeToRemove : null}>
      {!hide && isPlaying ? children : null}
    </AnimatePresence>
  )
}
