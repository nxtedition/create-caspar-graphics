import React from 'react'
import { motion } from 'framer-motion'

export const Crawl = React.memo((props) => {
  const { play, items } = props
  const [wasStarted, setWasStarted] = React.useState(play)

  if (!wasStarted && play) {
    setWasStarted(true)
  }

  if (!items?.length || !wasStarted) {
    return null
  }

  return <CrawlPrimitive {...props} />
})

let key = 0

const CrawlPrimitive = ({
  items,
  renderItem,
  pixelsPerFrame = 5,
  frameRate = 25,
  play,
  loop = true,
  onExit,
}) => {
  const ref = React.createRef()
  const [rect, setRect] = React.useState()
  const [visibleEntries, setVisibleEntries] = React.useState([[key, items[0]]])

  React.useLayoutEffect(() => {
    setRect(ref.current.getBoundingClientRect())
  }, [])

  const onEntered = (item) => {
    // NOTE: this expects each item to have an id, which probably isn't ideal.
    const index = items.findIndex(({ id }) => id === item.id)
    const nextIndex = (index + 1) % items.length
    let nextItem = items[nextIndex]
    setVisibleEntries((items) => [...items, [++key, nextItem]])
  }

  const onExited = () => {
    if (visibleEntries.length === 1 && onExit) {
      onExit()
    }
    setVisibleEntries((items) => items.slice(1))
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {rect != null &&
        play &&
        visibleEntries.map(([key, item]) => {
          const index = items.findIndex(({ id }) => id === item.id)
          return (
            <Item
              key={key}
              item={item}
              offset={Math.round(rect.width)}
              pixelsPerSecond={pixelsPerFrame * frameRate}
              onEntered={onEntered}
              onExited={onExited}
            >
              {renderItem(item, {
                showSeparator: loop || index < items.length - 1,
              })}
            </Item>
          )
        })}
    </div>
  )
}

const Item = ({
  item,
  children,
  offset,
  pixelsPerSecond,
  onEntered,
  onExited,
}) => {
  const ref = React.useRef()
  const [width, setWidth] = React.useState()

  React.useEffect(() => {
    setWidth(ref.current.getBoundingClientRect().width)
  }, [])

  const totalDistance = offset + (width ?? 0)

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        left: offset,
      }}
      animate={
        width
          ? {
              x: -totalDistance,
              transition: {
                duration: totalDistance / pixelsPerSecond,
                ease: 'linear',
              },
            }
          : false
      }
      onAnimationStart={() => {
        window.setTimeout(
          () => {
            onEntered(item)
          },
          (width / pixelsPerSecond) * 1000,
        )
      }}
      onAnimationComplete={() => {
        onExited(item)
      }}
    >
      {children}
    </motion.div>
  )
}
