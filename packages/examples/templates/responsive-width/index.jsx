import React from 'react'
import { render, FramerMotion, useCaspar } from '@nxtedition/graphics-kit'
import { motion } from 'framer-motion'
import './style.css'

const ResponsiveWidthExample = () => {
  const { data, aspectRatio } = useCaspar()
  const { name, title } = data

  return (
    <FramerMotion hide={!name}>
      <motion.div
        key={title}
        className="title"
        initial={{
          opacity: 0,
          [aspectRatio >= 16 / 9 ? 'x' : 'y']: 50,
        }}
        animate={{
          opacity: 1,
          transition: {
            delay: 0.2,
          },
          [aspectRatio >= 16 / 9 ? 'x' : 'y']: 0,
        }}
        exit={{
          opacity: 0,
          transition: {
            delay: 0.1,
          },
          [aspectRatio >= 16 / 9 ? 'x' : 'y']: 50,
        }}
      >
        {title}
      </motion.div>
      <motion.div
        key={name}
        className="name"
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 50,
        }}
      >
        {name}
      </motion.div>
    </FramerMotion>
  )
}

render(ResponsiveWidthExample)
