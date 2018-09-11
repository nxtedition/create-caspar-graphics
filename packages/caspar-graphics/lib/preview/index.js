import ReactDOM from 'react-dom'
import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import Preview from './preview'

const templates = process.env.GRAPHIC_TEMPLATES
const mode = process.env.MODE
const is720 = mode.startsWith('720')
const width = is720 ? 1280 : 1920
const height = is720 ? 720 : 1080

const container = document.getElementById('app')
container.style.height = height
container.style.width = width

const App = ({ components }) => (
  <Router>
    <Switch>
      {templates.map((name, idx) => (
        <Route
          key={name}
          path={`/${name}`}
          render={({ match }) => (
            <Preview
              templates={templates}
              currentTemplate={{ name, component: components[idx] }}
              mode={mode}
              height={height}
              width={width}
            />
          )}
        />
      ))}
      <Route render={() => <Redirect to={`${templates[0]}`} />} />
    </Switch>
  </Router>
)

Promise.all(
  templates.map(name => import(process.env.DEV_TEMPLATES_DIR + '/' + name))
)
  .then(components => {
    ReactDOM.render(
      <App components={templates.map((n, idx) => components[idx].default)} />,
      container
    )
  })
  .catch(err => console.log(err))
