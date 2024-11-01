import React, { useEffect, useRef, useState } from 'react'
import {
  render,
  useCaspar,
  useCasparEvent,
  States,
} from '@nxtedition/graphics-kit'
import lottie from 'lottie-web'

export default function Bodymovin() {
  const containerRef = useRef()
  const updateRef = useRef()
  const animationRef = useRef()
  const didStartRef = useRef(false)
  const { data, state, isPlaying, safeToRemove } = useCaspar()
  const { jsonPath } = data
  const [json, setJson] = useState(null)
  const [animation, setAnimation] = useState(null)


  // Fetch JSON.
  useEffect(() => {
    if (!jsonPath) {
      return
    }

    async function getJson() {
      try {
        const json = await fetch(jsonPath.replace('8000', '8080')).then((res) =>
          res.json(),
        )
        setJson(json)
      } catch (err) {
        console.error(`Failed to fetch json from ${jsonPath}:`)
        console.error(err.name + ': ' + err.message)
      }
    }

    getJson()
  }, [jsonPath])

  // Handle updates
  useEffect(() => {
    if (!json) {
      return
    }

    // We haven't started playing yet, so just create a new animation.
    if (!isPlaying) {
      animationRef.current?.destroy?.()
      animationRef.current = lottie.loadAnimation({
        animationData: updateLayers(json, data),
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
      })
      setAnimation(animationRef.current)

      return
    }

    // We're playing when we got the update. Check if we should animate out before replacing the content.
    const updateOutMarker = getMarker(animation, 'updateOut')
    const updateInMarker = getMarker(animation, 'updateIn')

    // No update markers found.
    if (!updateInMarker || !updateOutMarker) {
      return
    }

    const updateAnimation = lottie.loadAnimation({
      animationData: updateLayers(json, data),
      container: updateRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
    })

    updateAnimation.addEventListener('DOMLoaded', () => {
      const outEndTime = updateOutMarker.time + updateOutMarker.duration + 1
      animationRef.current.onComplete = (frame) => {
        updateRef.current.style.opacity = 1
        // Animate in the old values.
        updateAnimation.playSegments(
          [
            updateInMarker.time,
            updateInMarker.time + updateInMarker.duration + 1,
          ],
          true,
        )

        animationRef.current = updateAnimation
        setAnimation(updateAnimation)
        containerRef.current.style.opacity = 0
      }

      // Animate out the old values.
      animationRef.current.playSegments(
        [updateOutMarker.time, outEndTime],
        true,
      )
    })

    return
    const videoLayers = updateLayers(json)

    const videos = []

    // Lottie doesn't support videos. As a workaround, we allow users to mark image layers in
    // After Effects as videos by prefixing them with `nxt-video_`. Once the image element
    // has been loaded in the DOM, we find it and replace it with a video element.
    animation.addEventListener('DOMLoaded', () => {
      for (const nxtData of videoLayers) {
        const imageEl = [...document.querySelectorAll('svg g > image')].find(
          (node) => node.getAttribute('href') === nxtData.src,
        )

        if (!imageEl) {
          continue
        }

        // Since we're inside an svg, we need to wrap our video element inside a foreginObject.
        const foreignObject = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'foreignObject',
        )
        const video = document.createElement('video')
        const source = document.createElement('source')
        foreignObject.appendChild(video)
        video.appendChild(source)
        video.loop = nxtData.loop === true
        videos.push(video)

        // Grab all the attributes, except href, from the image element and and pass them on to
        // our new video element.
        for (let i = 0; i < imageEl.attributes.length; ++i) {
          const nodeName = imageEl.attributes.item(i).nodeName
          const nodeValue = imageEl.attributes.item(i).nodeValue

          if (nodeName === 'href') {
            source.setAttribute('src', nodeValue)
          } else {
            video.setAttribute(nodeName, nodeValue)
          }

          if (nodeName === 'width' || nodeName === 'height') {
            foreignObject.setAttribute(nodeName, nodeValue)
          }
        }

        // Then replace the image with the video.
        const { parentNode } = imageEl
        parentNode.removeChild(imageEl)
        parentNode.appendChild(foreignObject)
      }
    })
  }, [json, data])

  // Play animation
  useEffect(() => {
    if (!isPlaying || !animation || didStartRef.current) {
      return
    }

    const inMarker = getMarker(animation, 'in')

    if (!inMarker) {
      console.error('No in marker found.')
      return
    }

    animation.playSegments(
      [inMarker.time, inMarker.time + inMarker.duration],
      true,
    )

    function playVideos() {
      while (videos.length > 0) {
        videos.pop().play()
      }
    }

    didStartRef.current = true
  }, [isPlaying, animation])

  // Update
  useCasparEvent('update', (data) => {
    return
    if (!isPlaying || !animation) {
      return
    }

    const updateOutMarker = getMarker(animation, 'updateOut')
    const updateInMarker = getMarker(animation, 'updateIn')

    if (!updateInMarker || !updateOutMarker) {
      return
    }

    // Stop at the end of the in marker.
    const outEndTime = updateOutMarker.time + (updateOutMarker.duration ?? 0)
    animation.playSegments([[updateOutMarker.time, outEndTime]], true)
  })

  // Stop
  useEffect(() => {
    if (state !== States.stopped) {
      return
    }

    if (animation) {
      async function stop() {
        await animateOff(animation)
        safeToRemove()
      }

      stop()
    } else {
      safeToRemove()
    }
  }, [state, animation, safeToRemove])

  const { w: width = 0, h: height = 0 } = animation?.animationData || {}
  const rescaleToProjectSize = {
    position: 'absolute',
    width,
    height,
    transform: `scale(${window.innerWidth / width})`,
    transformOrigin: 'top left',
    top: 0,
    left: 0,
  }

  return (
    <>
      <div ref={containerRef} style={rescaleToProjectSize} key={jsonPath} />
      <div
        ref={updateRef}
        style={{ rescaleToProjectSize, opacity: 0 }}
        key={jsonPath + 1}
      />
    </>
  )
}

function updateLayers(dataObj, casparData) {
  // We don't want to change the original object.
  const data = JSON.parse(JSON.stringify(dataObj))
  const videoLayers = []

  function updateLayer(layer) {
    if (!layer) {
      return
    }

    const match = layer?.nm?.match(/nxt(-*(.+))?_/)

    if (match) {
      updateNxtLayer(layer, match[2])
    }

    for (const [key, value] of Object.entries(layer)) {
      // Found an expression — add nxt data to its global $ object.
      if (key === 'x' && typeof value === 'string') {
        layer[key] = `var $ = ${JSON.stringify(data)};${value}`
      }

      if (typeof value !== 'object') {
        continue
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          updateLayer(item)
        }
      } else {
        updateLayer(value)
      }
    }
  }

  function updateNxtLayer(layer, type) {
    const nxtData = casparData[layer.nm]

    // Text/number
    if (layer.t?.d?.k[0]?.s != null) {
      // To get newlines working we need to replace \n with \r.
      layer.t.d.k[0].s.t = (nxtData ?? '')?.replace(/\n/g, '\r')
      return
    }

    const asset = animationData.assets.find((asset) => asset.id === layer.refId)

    if (!type || !asset || !nxtData?.src) {
      return
    }

    // Image/video
    asset.u = ''
    asset.p = nxtData.src

    if (type === 'video') {
      videoLayers.push(nxtData)
    }
  }

  updateLayer(data)

  return data
}

function animateOff(animation) {
  return new Promise((resolve) => {
    const endMarker = getMarker(animation, 'out')

    if (endMarker?.time) {
      animation.goToAndStop(endMarker.time, true)
    } else {
      // No end animation has been specified, run the animation backwards at 1.5x speed.
      animation.setDirection('-1')
      animation.setSpeed(1.5)
    }

    animation.onEnterFrame = null
    animation.play()

    animation.onComplete = () => {
      animation.destroy()
      resolve()
    }
  })
}

function getMarker(animation, label) {
  if (animation?.markers?.length === 1) {
    return animation.markers[0]
  }

  return animation?.markers?.find(
    ({ payload }) =>
      payload?.name?.replace(/\s/, '').replace(/\r/, '') === label,
  )
}

render(Bodymovin)
