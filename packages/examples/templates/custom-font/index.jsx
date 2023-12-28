import React from 'react'
import {
  render,
  FramerMotion,
  useCasparData,
  useFont
} from '@nxtedition/graphics-kit'
import { motion } from 'framer-motion'
import exoVF from './Exo-VariableFont_wght.ttf'
import robotoCondensedRegular from './RobotoCondensed-Regular.ttf'
import robotoCondensedBold from './RobotoCondensed-Bold.ttf'
import './style.css'

const CustomFontExample = () => {
  const { name = 'hello', title, goals } = useCasparData()

  // This is a variable font, so we only need to load one file for all styles.
  const exo = useFont({ src: exoVF })
  
  // Here we have each font style as a separate file, so we need to specify them individually.
  const roboto = useFont({
    src: [
      { path: robotoCondensedRegular, weight: '400' },
      { path: robotoCondensedBold, weight: '700' }
    ]
  })

  return (
    <FramerMotion hide={!name}>
      <motion.div
        key={name}
        className="container"
        style={exo.style}
        initial={{
          opacity: 0,
          y: 50
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
        <div className="name">{name}</div>
        <div className="title">{title}</div>
        <div className="goals" style={roboto.style}>
          <div>Goals:</div>
          <div>{goals}</div>
        </div>
      </motion.div>
    </FramerMotion>
  )
}

render(CustomFontExample)
