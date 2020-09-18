import React from 'react'
import Parser from 'rss-parser'

export const useRssFeed = (url, transformFn) => {
  const [data, setData] = React.useState(null)

  React.useEffect(() => {
    if (!url) {
      setData(null)
      return
    }

    let isDisposed = false

    async function fetchData() {
      try {
        const data = await new Parser().parseURL(url)

        if (!isDisposed) {
          setData(data)
        }
      } catch (err) {
        console.error(`Unabel to get data from ${url}`, err)
      }
    }

    fetchData()

    return () => {
      isDisposed = true
    }
  }, [url])

  return transformFn ? transformFn(data) : data
}
