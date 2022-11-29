import React from 'react'
import { useCaspar, States } from 'caspar-graphics'
import { motion } from 'framer-motion'

const FramerMotion = () => {
  const { state, data, safeToRemove } = useCaspar()
  const { text, number, showNumber } = data
  const isVisible = text && state === States.playing

  return (
    <motion.div
      initial={false}
      animate={{ y: isVisible ? 0 : 150 }}
      onAnimationComplete={() => {
        if (!isVisible) {
          safeToRemove()
        }
      }}
      style={{
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        bottom: 40,
        left: 100,
        height: 100,
        width: 600,
        background: '#673ab7',
        color: 'white',
        position: 'absolute',
        fontWeight: 'bold',
        fontSize: 44,
        borderRadius: 4
      }}
    >
      {showNumber ? number ?? 0 : null}: {text}
    </motion.div>
  )
}

export const schema = {
  text: "string",
  number: "number",
  showNumber: "boolean"
}

export const previewData = {
  Default: {
    text: 'FramerMotion Text',
    number: 5,
    showNumber: true
  },
  'Another Text': {
    text: 'FramerMotion With Another Text',
    number: 10,
    showNumber: false
  }
}

export default FramerMotion
