import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnimation, AnimationStates } from 'caspar-graphics'

export const Flip = ({
  children,
  enter = 'up',
  exit = 'up',
  change = true
}) => {
  const [animationState, onAnimationComplete] = useAnimation()

  return (
    <div
      css={`
        overflow: hidden;
        opacity: ${animationState === AnimationStates.hidden ? 0 : 1};
      `}
    >
      <AnimatePresence
        initial={typeof enter === 'string'}
        onExitComplete={onAnimationComplete}
        key={
          animationState === AnimationStates.hidden
            ? 'hidden'
            : change
            ? children
            : 'flip'
        }
      >
        {animationState !== AnimationStates.exit && (
          <motion.div
            key={children}
            initial={{ y: enter === 'up' ? '100%' : '-100%' }}
            onAnimationComplete={onAnimationComplete}
            animate={{ y: '0%' }}
            exit={{ y: getExitY(exit) }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getExitY(direction) {
  if (direction === 'up') {
    return '-100%'
  } else if (direction === 'down') {
    return '100%'
  }
  return '0%'
}
