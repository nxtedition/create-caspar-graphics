import React, { useEffect, useRef, useState } from 'react'
import { render, States, useCaspar, useCasparEvent } from '@nxtedition/graphics-kit'
// import ografComponent from './minimal.mjs'

export default function OgrafTemplate() {
  const { data, safeToRemove, state } = useCaspar()
  const { ografMain, _debug: debug, ...ografData } = data
  const [ografRef, setOgrafRef] = useState(null)
  const [readyToPlay, setReadyToPlay] = useState(false)
  const containerRef = useRef(null);

  const log = debug ? console.log : undefined

  useCasparEvent('update', async (data) => {
    if (readyToPlay) {
      log?.('DEBUG: ograf.update()')
      const { ografMain, _debug, ...ografData } = data
      await ografRef.updateAction?.({ data: ografData })
      log?.('DEBUG: ograf.update() done')
    }
  })

  useEffect(() => {
    async function importOgraf() {
      log?.('DEBUG: Importing ograf web component:', ografMain)
      /* @vite-ignore */
      const module = await import(ografMain)
      log?.('DEBUG: Importing ograf web component done.')
      customElements.define('ograf-component', module.default)
      const component = new module.default()
      containerRef.current.appendChild(component)
      setOgrafRef(component)
    }

    if (customElements.get('ograf-component')) {
      safeToRemove()
    } else if (ografMain) {
      void importOgraf()
    }
  }, [ografMain])

  useEffect(() => {
    if (ografRef == null) {
      return
    }
    async function load() {
      log?.('DEBUG: ograd.load()')
      await ografRef.load?.({ renderType: 'realtime', data: ografData })
      log?.('DEBUG: ograd.load() done')
      setReadyToPlay(true)
    }
    load()
  }, [ografRef])

  useEffect(() => {
    if (ografRef == null || !readyToPlay) {
      return
    }
    async function handleStateChange() {
      log?.('DEBUG: Graphics state changed:', state)
      if (state === States.playing) {
        log?.('DEBUG: ograf.play()')
        await ografRef.playAction?.({})
        log?.('DEBUG: ograf.play() done')
      } else if (state === States.stopped) {
        log?.('DEBUG: ograf.stop()')
        await ografRef.stopAction?.({})
        await ografRef.dispose?.()
        log?.('DEBUG: ograf.stop() done')
        safeToRemove()
      }
    }
    void handleStateChange()
  }, [ografRef, state, readyToPlay])
  
  return <div ref={containerRef}></div>;
}

render(OgrafTemplate)
