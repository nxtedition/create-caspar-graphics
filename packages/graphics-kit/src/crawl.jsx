import React from 'react'
import { useTimeout } from './use-timeout'

export const Crawl = React.memo((props) => {
  const { play, items } = props
  const [wasStarted, setWasStarted] = React.useState(play)

  React.useEffect(() => {
    if (!wasStarted && play) {
      setWasStarted(true)
    }
  }, [wasStarted, play])

  if (!items?.length || !wasStarted) {
    return null
  }

  return <CrawlPrimitive {...props} />
})

let count = 0

const CrawlPrimitive = ({ items, renderItem, pixelsPerFrame = 5, frameRate = 25, play }) => {
  const ref = React.createRef()
  const [rect, setRect] = React.useState()
  const [visibleItems, setVisibleItems] = React.useState([[count, items[0]]])

  React.useLayoutEffect(() => {
    setRect(ref.current.getBoundingClientRect())
  }, [])

  const onEntered = (item) => {
    const index = items.findIndex(({ id }) => id === item.id)
    const nextIndex = (index + 1) % items.length
    let nextItem = items[nextIndex]
    setVisibleItems(items => [...items, [count++, nextItem]])
  }

  const onExited = () => {
    setVisibleItems((items) => items.slice(1))
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      {rect != null &&
        visibleItems.map(([count, item]) => (
          <Item
            key={`${count}-${item.id}`}
            item={item}
            offset={rect.width}
            pixelsPerSecond={pixelsPerFrame * frameRate}
            onEntered={onEntered}
            onExited={onExited}
            play={play}
          >
            {renderItem(item)}
          </Item>
        ))}
    </div>
  )
}

const Item = ({ item, children, offset, pixelsPerSecond, onEntered, onExited, play }) => {
  const { id } = item
  const ref = React.useRef()
  const [rect, setRect] = React.useState()

  React.useLayoutEffect(() => {
    const head = document.getElementsByTagName('head')[0]
    const rect = ref.current.getBoundingClientRect()
    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = `
      @keyframes scroll-${id} {
        from {
          transform: translate3d(0px, 0px, 0px);
        }
        100% {
          transform: translate3d(-${offset + rect.width}px, 0px, 0px);
        }
      }
    `

    head.appendChild(style)
    setRect(rect)

    return () => {
      head.removeChild(style)
    }
  }, [id])

  const enterDurationMs = rect ? (rect.width / pixelsPerSecond) * 1000 : null
  const totalDurationMs = rect ? ((rect.width + offset) / pixelsPerSecond) * 1000 : null

  useTimeout(() => onEntered(item), enterDurationMs)
  useTimeout(() => onExited(item), totalDurationMs)

  let animation

  if (rect) {
    animation = {
      animationTimingFunction: 'linear',
      animationFillMode: 'backwards',
      animationIterationCount: 1,
      animationDuration: rect ? `${totalDurationMs / 1000}s` : 0,
      animationName: rect ? `scroll-${id}` : null,
      animationPlayState: play ? 'running' : 'paused'
    }
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: rect != null ? 1 : 0,
        position: 'absolute',
        left: offset,
        ...animation
      }}
    >
      {children}
    </div>
  )
}
