import React from 'react'
import { render, FramerMotion, useCasparData } from '@nxtedition/graphics-kit'
import { motion } from 'framer-motion'
import './style.css'

const FramerMotionExample = () => {
  const { name } = useCasparData()

  return (
    <FramerMotion hide={!name}>
      <motion.div
        key={name}
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
        {name}
      </motion.div>
    </FramerMotion>
  )
}

render(FramerMotionExample)
