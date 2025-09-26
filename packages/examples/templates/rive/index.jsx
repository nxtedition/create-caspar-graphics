import React, { useEffect, useRef, useState } from 'react'
import { render, useCaspar, States } from '@nxtedition/graphics-kit'
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

export default function RiveTemplate() {
  const { data, aspectRatio } = useCaspar()
  const [artboards, setArtboard] = useState({})
  const aspectRatioRounded = Math.round(aspectRatio * 100) / 100
  const artboard = artboards[aspectRatioRounded]
  const { riveSource } = data

  if (riveSource && artboard) {
    return <RiveSourceWithArtboard src={riveSource} artboard={artboard} />
  }

  if (riveSource) {
    return (
      <RiveArtboardMatcher
        src={riveSource}
        setArtboard={setArtboard}
        aspectRatio={aspectRatioRounded}
      />
    )
  }

  return null
}

// HACK:
// The only reason we get the artboard as a separate first step, is that the Rive Layout will use
// the bounds of the artboard that gets loaded first. I.e. even if we later load a different
// artboard, the bounds from the initial artboard (the "active") will still be there.
const RiveArtboardMatcher = ({ src, setArtboard, aspectRatio, }) => {
  const { data } = useCaspar()
  const { artboard: selectedArtboard, _debug: debug } = data
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: false,
    useOffscreenRenderer: true,
  })

  useEffect(() => {
    if (!rive || !aspectRatio) {
      return
    }

    const artboard = getArtboard(rive, aspectRatio, selectedArtboard, debug)

    if (debug) {
      console.log('DEBUG: artboard', artboard?.name, {
        artboard,
        aspectRatio,
        selectedArtboard
      })
    }

    setArtboard((x) => ({ ...x, [aspectRatio]: artboard }))
  }, [rive, aspectRatio, setArtboard, selectedArtboard, debug])

  return <RiveComponent />
}

const RiveSourceWithArtboard = ({ src, artboard }) => {
  const { state, safeToRemove, data } = useCaspar()
  const { _debug: debug } = data
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
      if (debug) {
        console.log('DEBUG: onStateChange', data)
      }

      if (data.includes('exit')) {
        safeToRemove()

        if (debug) {
          console.log('DEBUG: safeToRemove()')
        }
      }
    },
    artboard: artboard.name,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.TopLeft }),
  })

  // Load the artboard.
  useEffect(() => {
    if (!rive || !src || !artboard) {
      return
    }

    const stateMachine = artboard.stateMachines[0]

    if (!stateMachine) {
      console.error('No state machine available:', rive.contents)
    }

    rive.on(EventType.Load, () => {
      rive.resizeToCanvas()
      rive.resizeDrawingSurfaceToCanvas()

      const viewModel = rive.defaultViewModel()
      const viewModelInstance = viewModel?.defaultInstance()

      if (viewModelInstance) {
        if (debug) {
          console.log(
            `DEBUG: rive.bindViewModelInstance() for view model: ${viewModel.name}`,
          )
        }

        rive.bindViewModelInstance(viewModelInstance)
      } else {
        console.log('No default view model instance found.')
      }

      setInstances({ stateMachine, viewModelInstance })
    })

    if (debug) {
      console.log('DEBUG: rive.load()', {
        src,
        artboard: artboard.name,
        stateMachines: stateMachine.name,
      })
    }

    rive.load({
      src,
      artboard: artboard.name,
      stateMachines: stateMachine.name,
      autoplay: true,
    })
  }, [rive, src, artboard, debug])

  return (
    <RiveComponent style={{ opacity: state >= States.playing ? 1 : 0 }}>
      {stateMachine ? (
        <RiveArtboard
          rive={rive}
          stateMachine={stateMachine}
          viewModelInstance={viewModelInstance}
          assetRefs={assetRefs}
          debug={debug}
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
  debug,
}) => {
  const didPlayRef = useRef(false)
  const { data, state } = useCaspar()
  const [isUpdating, setIsUpdating] = useState(false)

  // Updates from caspar
  useEffect(() => {
    const { riveSource, artboard, _debug: debug, ...casparData } = data
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

        if (debug) {
          console.log(`DEBUG: check if "${key}" needs update`, {
            currentValue,
            newValue: value,
          })
        }

        if (value === currentValue) {
          console.log('DEBUG: no change, skipping updating')
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

            if (debug) {
              if (!didPlayRef.current) {
                console.log('DEBUG: Before play, simply update', key, value)
              } else {
                console.log(
                  'DEBUG: No updateTrigger, simply update',
                  key,
                  value,
                )
              }
            }
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

          if (debug) {
            console.log('DEBUG: updateTrigger.fire()', key, value)
          }

          rive.on(EventType.RiveEvent, ({ data }) => {
            if (data.name === `update_${key}`) {
              property.value = value

              if (debug) {
                console.log(
                  `DEBUG: update_${key} received — updating value:`,
                  value,
                )
              }
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

    if (debug) {
      console.log(`DEBUG: ${triggerName}.fire()`)
    }

    if (state === States.playing) {
      didPlayRef.current = true
    }
  }, [rive, stateMachine, state, isUpdating, debug])

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

function getArtboard(rive, aspectRatio, name, debug) {
  const artboards = rive.contents.artboards

  // If there's an artboard that matches the specified name exactly, return it.
  if (name) {
    for (const a of artboards) {
      if (a.name === name) {
        if (debug) {
          console.log('DEBUG: getArtboard() matched name', name)
        }
        return a
      }
    }
  }

  // Compute aspect ratios for all artboards that have parsable ratios
  const candidates = artboards.map((a) => {
    const [w, h] = a.name
      .split(' ')[0]
      .split(':')
      .map(Number)
      .filter((x) => !isNaN(x))

    if (!w || !h) {
      return { artboard: a, ratio: null, diff: Infinity }
    }

    const artboardAspectRatio = w / h
    const diff = Math.abs(artboardAspectRatio - aspectRatio)

    return { artboard: a, ratio: artboardAspectRatio, diff }
  })

  // Pick the artboard with the smallest aspect ratio difference
  const bestMatch = candidates.reduce((best, curr) =>
    curr.diff < best.diff ? curr : best,
  )

  if (debug) {
    console.log('DEBUG: getArtboard() aspect ratios', { bestMatch, candidates })
  }

  if (!bestMatch || bestMatch.diff === Infinity) {
    if (debug) {
      console.log(
        'DEBUG: getArtboard() no matching aspect ratio. Returning first artboard.',
        artboards[0].name,
      )
    }
    return artboards[0]
  }

  // If there's a name provided, check if one with the closest aspect ratio
  // also matches the name (ignoring the leading ratio prefix).
  if (name) {
    const cleanedName = (n) => n.replace(/^\d+:\d+\s*/, '')
    const byName = candidates
      .filter((c) => cleanedName(c.artboard.name) === name)
      .reduce((best, curr) => (curr.diff < best.diff ? curr : best), {
        diff: Infinity,
      })

    if (byName && byName.diff !== Infinity) {
      if (debug) {
        console.log(
          'DEBUG: getArtboard() matched name and aspect ratio',
          byName,
        )
      }
      return byName.artboard
    }
  }

  if (debug) {
    console.log(
      'DEBUG: getArtboard() matched aspect ratio',
      bestMatch.artboard.name,
    )
  }
  return bestMatch.artboard
}

render(RiveTemplate)
