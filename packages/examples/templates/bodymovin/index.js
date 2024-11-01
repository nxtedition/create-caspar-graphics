import { parse, States } from '@nxtedition/graphics-kit'

let state = States.loading
let data = null
let json = null
let animation = null

window.update = async (raw) => {
  const newData = parse(raw)

  if (!newData?.jsonPath) {
    return
  }

  // Fetch JSON file.
  if (newData.jsonPath !== data?.jsonPath) {
    try {
      json = await fetch(newData.jsonPath.replace('8000', '8080')).then((res) =>
        res.json(),
      )
    } catch (err) {
      console.error(`Failed to fetch json from ${jsonPath}:`)
      console.error(err.name + ': ' + err.message)
    }
  }

  data = newData

  if (state < States.playing) {

  }
}

window.play = () => {
  timeline.fromTo('#name', { y: 50, opacity: 0 }, { y: 0, opacity: 1 }).play()
}

window.stop = () => {
  timeline
    .eventCallback('onReverseComplete', () => {
      window?.remove()
    })
    .reverse()
}

function loadAnimation() {
  // No JSON or its animation is already loaded.
  if (!json || animation != null) {
    return
  }

  const animationData = json
  const data = JSON.parse(stringifiedData)
  const videoLayers = []

  // Found a nxt layer — replace its content with data from nxt.
  function updateNxtLayer(layer, type) {
    const nxtData = data[layer.nm]

    // Text/number
    if (layer.t?.d?.k[0]?.s != null) {
      // To get newlines working we need to replace \n with \r.
      layer.t.d.k[0].s.t = (nxtData ?? '')?.replace(/\n/g, '\r')
      return
    }

    const asset = animationData.assets.find(
      (asset) => asset.id === layer.refId,
    )

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

  function traverse(layer) {
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
        layer[key] = `var $ = ${stringifiedData};${value}`
      }

      if (typeof value !== 'object') {
        continue
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          traverse(item)
        }
      } else {
        traverse(value)
      }
    }
  }

  traverse(animationData)

  async function loadAnimation() {
    // Animate out any animation currently running.
    await Promise.all(
      Object.values(animationMap).map((animation) => animateOff(animation)),
    )

    const animation = lottie.loadAnimation({
      animationData,
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
    })

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

    const inMarker = getMarker(animation, 'in') ?? getMarker(animation, 'out') // COMPAT

    function playVideos() {
      while (videos.length > 0) {
        videos.pop().play()
      }
    }

    animation.onEnterFrame = (frame) => {
      // Start video(s) when the animation starts.
      if (frame.currentTime > 0 && videos.length > 0) {
        playVideos()
      }

      if (!Number.isFinite(inMarker?.time)) {
        animation.onEnterFrame = null
        return
      }

      // Stop at the end of the in marker.
      const inEndTime = inMarker.time + (inMarker.duration ?? 0)
      if (frame.currentTime >= inEndTime) {
        animation.pause()
        animation.onEnterFrame = null
      }
    }

    setAnimationMap({ [stringifiedData]: animation })
  }

  loadAnimation()
}
