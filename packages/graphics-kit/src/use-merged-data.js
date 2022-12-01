import React from 'react'
import { useCasparData } from './'

export const useMergedData = () => {
  const ref = React.useRef({})
  const data = useCasparData()

  React.useEffect(() => {
    ref.current = { ...ref.current, ...data }
  }, [data])

  return { ...ref.current, ...data }
}
