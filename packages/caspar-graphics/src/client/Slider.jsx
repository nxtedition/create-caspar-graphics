import * as SliderPrimitive from '@radix-ui/react-slider'
import React from 'react'
import styles from './slider.module.css'

export const Slider = React.forwardRef(function Slider(
  { value, ...props },
  ref,
) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      className={styles.sliderRoot}
      {...props}
    >
      <SliderPrimitive.Track className={styles.sliderTrack}>
        <SliderPrimitive.Range className={styles.sliderRange} />
      </SliderPrimitive.Track>

      {value.map((_, i) => (
        <SliderPrimitive.Thumb key={i} className={styles.sliderThumb} />
      ))}
    </SliderPrimitive.Root>
  )
})
