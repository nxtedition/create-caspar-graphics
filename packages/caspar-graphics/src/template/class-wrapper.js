import React, { useRef } from 'react'
import { useCaspar, States } from '../'

export const ClassWrapper = ({ Template }) => {
  const { data, state, safeToRemove } = useCaspar()
  const ref = useRef()

  React.useEffect(() => {
    if (state !== States.stopped) {
      return
    }

    if (ref.current?.componentWillLeave) {
      ref.current.componentWillLeave(() => {
        safeToRemove()
      })
    } else {
      safeToRemove()
    }
  }, [state, safeToRemove])

  return <Template ref={ref} data={data} state={state} />
}
