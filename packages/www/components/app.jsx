import { useState, useEffect } from 'react'
import { App as CasparGraphicsApp } from '@nxtedition/caspar-graphics'
import '@nxtedition/caspar-graphics/dist/style.css'
import styles from './app.module.css'

const templates = [
  {
    name: 'framer-motion',
    src: '/examples/framer-motion',
    manifest: {
      previewData: {
        'Thierry Henry': {
          name: 'Thierry Henry'
        },
        'Dennis Bergkamp': {
          name: 'Dennis Bergkamp'
        }
      },
      schema: {
        name: {
          type: 'string',
          label: 'Name'
        }
      }
    }
  }
]

export function App() {
  const [templates, setTemplates] = useState()

  useEffect(() => {
    async function getTemplates() {
      try {
        const data = await fetch('/examples/data.json').then(res => res.json())
        const templates = await Promise.all(
          data.templates.map(async name => {
            const src = `/examples/${name}`
            const manifest = await fetch(src + '/manifest.json').then(res => res.json())
            return { name, src, manifest }
          })
        )
        setTemplates(templates)
      } catch (err) {
        console.error('Unable to get templates:', { err })
      }
    }
    getTemplates()
  }, [])

  return (
    <div className={styles.container}>
      {Array.isArray(templates) && (
        <CasparGraphicsApp name="examples" templates={templates} />
      )}
    </div>
  )
}
