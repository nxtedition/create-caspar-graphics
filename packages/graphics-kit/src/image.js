import React from 'react'
import { usePrevious } from './use-previous'
import { useTimeline } from './gsap'

export const Image = ({ src, animateOnStop, animateOnLoad, ...props }) => {
  const prevSrc = usePrevious(src)
  console.log({ src, prevSrc })

  return (
    <>
      {prevSrc != null && prevSrc !== src ? (
        <img src={prevSrc} {...props} />
      ) : null}
      {src != null ? (
        <AnimatedImage
          key={src}
          {...props}
          src={src}
          animateOnLoad={animateOnLoad}
          animateOnStop={animateOnStop}
        />
      ) : null}
    </>
  )
}

const AnimatedImage = ({ animateOnLoad, animateOnStop, ...props }) => {
  const ref = React.useRef()
  const [isReady, setIsReady] = React.useState(false)
  let onLoad = null
  let onStop = null

  if (animateOnLoad) {
    onLoad = function(timeline) {
      animateOnLoad(ref, timeline)
    }
  }

  if (animateOnStop) {
    onStop = function(timeline) {
      animateOnStop(ref, timeline)
    }
  }

  useTimeline(onLoad, onStop, { isReady })

  return (
    <img
      ref={ref}
      {...props}
      onLoad={() => {
        setIsReady(true)
      }}
      style={{ ...props.style, opacity: isReady ? 1 : 0 }}
    />
  )
}
