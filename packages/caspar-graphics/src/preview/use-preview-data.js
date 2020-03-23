import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import isPlainObject from 'lodash/isPlainObject'
import queryString from 'query-string'
import { States } from '..'

export function usePreviewData(name, { templateWindow, state }) {
  const [previewData, setPreviewData] = useState(null)
  const [previewImages, setPreviewImages] = useState(null)
  const history = useHistory()
  const location = useLocation()
  const params = queryString.parse(location.search)
  const selectedDataKey = params.dataKey

  // Get preview data for the current template.
  useEffect(() => {
    if (state === States.loaded && templateWindow?.previewData) {
      setPreviewData(templateWindow.previewData)
      setPreviewImages(templateWindow.previewImages)
    }
  }, [state])

  const values = Object.values(previewData || {})
  const hasManyPreviewSets =
    values.length > 1 && values.every(value => isPlainObject(value))

  // Make sure we have a selected data key (if there are any).
  useEffect(() => {
    if (!hasManyPreviewSets || previewData?.[selectedDataKey]) {
      return
    }

    const firstKey = Object.keys(previewData)[0]
    history.replace(`${location.pathname}?dataKey=${firstKey}`)
  }, [hasManyPreviewSets, previewData, selectedDataKey])

  let data = null

  if (isPlainObject(location?.state?.data)) {
    // Always use the user's own edits if there are any.
    data = location.state.data
  } else if (
    hasManyPreviewSets &&
    isPlainObject(previewData?.[selectedDataKey])
  ) {
    // Get the selected preview set.
    data = previewData[selectedDataKey]
  } else if (isPlainObject(previewData)) {
    // There's only a single object for the preview data.
    data = previewData
  }

  // Update template with new data.
  useEffect(() => {
    if (templateWindow?.update) {
      templateWindow.update(data || {})
    }
  }, [templateWindow, data])

  return {
    selectedDataKey,
    selectedImageKey: params.imageKey,
    data: data || {},
    images: previewImages,
    image: previewImages?.[params.imageKey],
    dataKeys: hasManyPreviewSets ? Object.keys(previewData) : null,
    clearChanges: () => {
      setUserData(undefined)
    },
    onChange: ({ type, value }) => {
      if (type === 'data') {
        if (typeof value === 'string') {
          const query = { ...params, dataKey: value || undefined }
          history.push(`${location.pathname}?${queryString.stringify(query)}`)
        } else if (isPlainObject(value)) {
          history.replace({ ...location, state: { data: value } })
        }
      } else if (type === 'image') {
        const query = { ...params, imageKey: value || undefined }
        history.push(`${location.pathname}?${queryString.stringify(query)}`)
      }
    }
  }
}
