import React, { useEffect, useRef, useState } from 'react'
import { render, useCaspar, States, useClock } from '@nxtedition/graphics-kit'
import riveWASMResource from '@rive-app/canvas/rive.wasm?url'
import {
  useRive,
  RuntimeLoader,
  EventType,
  StateMachineInputType,
  Layout,
  Fit,
  Alignment,
  decodeImage,
} from '@rive-app/react-canvas'

RuntimeLoader.setWasmUrl(riveWASMResource)

export default function Rive() {
  const { data } = useCaspar()
  const { riveSource } = data

  if (riveSource) {
    return <RiveSource src={riveSource} />
  }

  return null
}

const RiveSource = ({ src }) => {
  const { state, safeToRemove, data, aspectRatio } = useCaspar()
  const [{ stateMachine, viewModelInstance }, setInstances] = useState({})
  const assetRefs = useRef(new Map())
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: false,
    assetLoader: (asset, bytes) => {
      // We replace the asset only if it's marked as a referencein Rive.
      const shouldLoadAsset = !bytes.length && !asset.cdnUuid.length
      assetRefs.current.set(asset.name, { asset })
      return shouldLoadAsset
    },
    onStateChange: ({ data }) => {
      if (data.includes('exit')) {
        safeToRemove()
      }
    },
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.TopLeft }),
  })

  // Load the artboard.
  useEffect(() => {
    if (!rive || !src || !aspectRatio) {
      return
    }

    const artboard = getArtboard(rive, aspectRatio, data.artboard)
    const stateMachine = artboard?.stateMachines[0]

    if (!stateMachine) {
      console.error('No state machine available:', rive.contents)
    }

    rive.on(EventType.Load, () => {
      rive.resizeDrawingSurfaceToCanvas()

      const viewModel = rive.defaultViewModel()
      const viewModelInstance = viewModel?.defaultInstance()

      if (viewModelInstance) {
        rive.bindViewModelInstance(viewModelInstance)
      } else {
        console.log('No default view model instance found.')
      }

      setInstances({ stateMachine, viewModelInstance })
    })

    rive.load({
      src,
      artboard: artboard.name,
      stateMachines: stateMachine.name,
      autoplay: true,
    })
    rive.resizeToCanvas()
  }, [rive, src, aspectRatio, data.artboard])

  return (
    <RiveComponent style={{ opacity: state >= States.playing ? 1 : 0 }}>
      {stateMachine ? (
        <RiveArtboard
          rive={rive}
          stateMachine={stateMachine}
          viewModelInstance={viewModelInstance}
          assetRefs={assetRefs}
        />
      ) : null}
    </RiveComponent>
  )
}

const RiveArtboard = ({
  rive,
  stateMachine,
  viewModelInstance,
  children,
  assetRefs,
}) => {
  const didPlayRef = useRef(false)
  const { data, state } = useCaspar()
  const [isUpdating, setIsUpdating] = useState(false)

  // Updates from caspar
  useEffect(() => {
    const { riveSource, artboard, ...casparData } = data
    const vmi = viewModelInstance

    if (!vmi) {
      return
    }

    async function updateFields() {
      setIsUpdating(true)

      const keys = Object.keys(casparData)

      for (const { name } of vmi.properties) {
        if (!keys.includes(name)) {
          keys.push(name)
        }
      }

      for (const key of keys) {
        if (key.startsWith('_')) {
          continue
        }

        const type = vmi.properties.find(({ name }) => name === key)?.type
        const value =
          casparData[key] ??
          {
            string: '',
            number: 0,
            boolean: false,
            color: 0xff000000 | 0,
          }[type]

        const assetRef = assetRefs.current.get(key)
        const asset = assetRef?.asset

        const property = vmi[type]?.(key)

        if (!assetRef && !property) {
          console.log(
            `Can't update ${key} since no asset or property was found with that key.`,
          )
          continue
        }

        const currentValue = assetRef ? assetRef.value : property?.value

        console.log(key, { currentValue, value })

        if (value === currentValue) {
          continue
        }

        const updateTrigger = rive
          .stateMachineInputs(stateMachine.name)
          ?.find(
            ({ type, name }) =>
              type === StateMachineInputType.Trigger &&
              name === `update_${key}`,
          )

        // We don't want animations before play — just update the data.
        // The same is true if there's no update trigger set up.
        if (!didPlayRef.current || !updateTrigger) {
          if (asset) {
            const update = await loadImage(asset, value, assetRefs)
            update()
          } else {
            property.value = value
          }

          continue
        }

        // Unsure if this is a good idea or not. Let's start without it...
        // We previusly didn't have a value — but now we do. Here we need to update the data binding
        // or image before firing the update. 
        // if (!currentValue && value) {
        //   if (asset) {
        //     const update = await loadImage(asset, value, assetRefs)
        //     update()
        //   } else {
        //     property.value = value
        //   }
        //
        //   updateTrigger.fire()
        //   continue
        // }

        if (asset) {
          // Update image:
          // 1. Make sure the new image is loaded and decoded before we do anything.
          // 2. Fire the update trigger (which allows the user to animate the image off).
          // 3. Wait for an event with the same name to fire, and then replace the image.
          const updateImage = await loadImage(asset, value, assetRefs)
          updateTrigger.fire()
          rive.on(EventType.RiveEvent, ({ data }) => {
            if (data.name === `update_${key}`) {
              updateImage()
            }
          })
        } else {
          // Update text:
          // 1. Fire the update trigger (which allows the user to animate the value off).
          // 3. Wait for an event with the same name to fire, and then replace the value.
          updateTrigger.fire()

          rive.on(EventType.RiveEvent, ({ data }) => {
            if (data.name === `update_${key}`) {
              property.value = value
            }
          })
        }
      }

      setIsUpdating(false)
    }

    updateFields()
  }, [rive, stateMachine, viewModelInstance, data])

  // Play/Stop
  useEffect(() => {
    if (isUpdating && state === States.playing) {
      return
    }

    let triggerName
    if (state === States.playing) {
      triggerName = 'play'
    } else if (state === States.stopped) {
      triggerName = 'stop'
    } else {
      return
    }

    const trigger = rive
      .stateMachineInputs(stateMachine.name)
      ?.find(
        (input) =>
          input.type === StateMachineInputType.Trigger &&
          input.name.toLowerCase() === triggerName,
      )

    trigger?.fire()

    if (state === States.playing) {
      didPlayRef.current = true
    }
  }, [rive, stateMachine, state, isUpdating])

  return children
}

async function loadImage(asset, src, refs) {
  if (!src) {
    return () => {
      refs.current.set(asset.name, { asset, value: null })
    }
  }

  const image = await fetch(src).then(async (res) =>
    decodeImage(new Uint8Array(await res.arrayBuffer())),
  )

  return () => {
    asset.setRenderImage(image)
    refs.current.set(asset.name, { asset, value: src })
    image.unref()
  }
}

function getArtboard(rive, aspectRatio, name) {
  // If there's an artboard that matches the specified name exactly we use that.
  if (name) {
    for (const a of rive.contents.artboards) {
      if (a.name === name) {
        return a
      }
    }
  }

  // Find all artboards with matching aspect ratios.
  const matchingAspectRatios = rive.contents.artboards.filter(({ name }) => {
    const [w, h] = name
      .split(' ')[0]
      .split(':')
      .map(Number)
      .filter((x) => !isNaN(x))

    if (!w || !h) {
      return false
    }

    const artboardAspectRatio = w / h

    return Math.abs(artboardAspectRatio - aspectRatio) <= 0.01
  })

  if (!matchingAspectRatios.length) {
    return rive.contents.artboards[0]
  }

  // Only one match, so we return it.
  if (matchingAspectRatios.length === 1) {
    return matchingAspectRatios[0]
  }

  // Check if there's one that matches both aspect ratio and name.
  for (const a of matchingAspectRatios) {
    if (name === a.name.replace(/^\d+:\d+\s/, '')) {
      return a
    }
  }

  return rive.contents.artboards[0]
}

render(Rive)
