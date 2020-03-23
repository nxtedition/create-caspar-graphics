import React from 'react'
import { useCaspar, States } from 'caspar-graphics'
import { motion } from 'framer-motion'

const FramerMotion = () => {
  const { state, data, safeToRemove } = useCaspar()
  const { text } = data
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
      {text}
    </motion.div>
  )
}

FramerMotion.previewData = { text: 'FramerMotion Text' }

export default FramerMotion
