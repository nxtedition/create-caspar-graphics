import React, { useState } from 'react'
import {
  render,
  useFetch,
  useCasparData,
  FramerMotion,
  useInterval,
} from '@nxtedition/graphics-kit'
import { motion } from 'framer-motion'
import './style.css'

const Webscreen = () => {
  const { name, slideDuration = 10, maxItems = 10, feedUrl } = useCasparData()
  const [index, setIndex] = useState(0)
  const feed = useFetch(feedUrl, { interval: 300 })
  const items = feed?.data?.data?.slice(0, maxItems)
  const item = items?.[index]

  useInterval(() => {
    setIndex((index) => (index + 1) % items.length)
  }, slideDuration * 1000)

  return (
    <FramerMotion hide={!item}>
      {item && (
        <Item
          title={item.title}
          summary={item.summary}
          label={item.description}
          trumpet={item.trumpet}
          date={item.date_published_at}
          imageUrl={item.media?.[0]?.content?.image?.download_url}
        />
      )}
    </FramerMotion>
  )
}

const Item = ({ title, imageUrl, summary, trumpet, label, date }) => {
  return (
    <div className="item">
      <div className="title">
        {trumpet && <span className="trumpet">{trumpet}</span>}
        <span>{title}</span>
      </div>
      <div className="summary">{summary}</div>
      <div className="date">{date}</div>
      <img src={imageUrl} />
    </div>
  )
}

render(Webscreen)
