import React from 'react'
import { render, FitText, FramerMotion, useCasparData } from '@nxtedition/graphics-kit'
import { motion } from 'framer-motion'
import './style.css'

const FitTextExample = () => {
  const { text, minSize, preferredSize } = useCasparData()

  return (
    <FramerMotion hide={!text}>
      <motion.div
        key={text}
        className="container"
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        exit={{
          opacity: 0,
          y: 50
        }}
      >
        <FitText preferredSize={preferredSize} minSize={minSize} text={text} /> 
      </motion.div>
    </FramerMotion>
  )
}

render(FitTextExample)
