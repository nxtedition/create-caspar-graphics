Table of Contents
=================

   * [Create Caspar Graphics]()
      * [Creating a Graphics Project]()
         * [npx]()
         * [npm]()
         * [Yarn]()
         * [npm start or <code>yarn start</code>]()
         * [npm run build or <code>yarn build</code>]()
      * [Developing Graphics]()
         * [Props]()
            * [data]()
            * [state]()
         * [componentWillLeave(onComplete)]()
         * [static previewData]()
         * [Example (using GSAP)]()
         * [Viewing your graphic]()
            * [With development UI]()
            * [Without development UI]()
            * [Query parameters]()
      * [Extras]()

# Create Caspar Graphics

Create graphics for [CasparCG](https://www.casparcg.com/) using [React](https://reactjs.org/) — with no build configuration.

* [Creating a Graphics Project](#creating-a-graphics-project) – How to create a new graphics project.
* [Developing Graphics](#developing-graphics) – How to develop graphics for a project bootstrapped with Create Caspar Graphics.

Create Caspar Graphics works on macOS, Windows, and Linux.<br>
If something doesn’t work, please [file an issue](https://github.com/nxtedition/create-caspar-graphics/issues/new).

## Creating a Graphics Project

To create a new app, you can choose one of the following methods:

### npx

```sh
npx create-caspar-graphics my-graphics
```

*[npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher*

### npm

```sh
npm init caspar-graphics my-graphics
```
*`npm init` is available in npm 6+*

### Yarn

```sh
yarn create caspar-graphics my-graphics
```
*`yarn create` is available in Yarn 0.25+*

It will create a directory called `my-graphics` inside the current folder.<br>

> **Note**: this will create a project for 1080p. If you're developing for 720, you can pass `--mode 720p` as an argument. It can also be changed later in your package.json.

Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-graphics
├── node_modules
├── package.json
├── .gitignore
└── src
    └── templates
      └── example
          └── index.js
```

No configuration or complicated folder structures. Just one `src/templates` folder where you put all your graphics. Once the installation is done, you can open your project folder:

```sh
cd my-graphics
```

Inside the newly created project, you can run some built-in commands:

### `npm start` or `yarn start`

Runs the app in development mode.<br>
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

<p align='center'>
<img width="1237" alt="dev-preview" src="https://user-images.githubusercontent.com/3599069/46212164-98db6c00-c335-11e8-93ed-d18cddd0c3bf.png" alt="Development View">
</p>

Every template that you've added to the `/templates` folder will automatically be picked up, and turned into a CasparCG template that you can interact with.
Use the GUI to view your graphics, change their preview data, send commands (e.g. play, pause, stop) and change background.

The page will automatically reload if you make changes to the code.<br>
And you will see the build errors and lint warnings in the console.

### `npm run build` or `yarn build`

Builds your graphics for production to the `dist` folder.<br>

It correctly bundles React in production mode and optimizes the build for the best performance, and then inlines every graphic into itws own HTML file.

> **Tip**: use `--include` (shorthand `-i`) or `--exlude` (shorthand `-e`)  to control which graphics get built.


Your graphics are now ready to be played in CasparCG!

## Developing Graphics

Start by adding a new folder to your `src/templates` folder, with the name of your new graphic. Then add an index.js file in the folder you just created,
and make sure it exports a [React Component](https://reactjs.org/docs/react-component.html), and you're done! 💫

> Note: you have to stop webpack and run `yarn start` again for it to pick up your new template.

If you know React, you already know almost everything you need to know.
The only thing different from a "normal" React component, is that you have one extra lifecycle method, and a two extra props.

### Props

#### `data`
> object | defaults to `{}`

Contains the data sent by CasparCG. Every time a new `update()` is performed, you'll receive the new data in `props.data`.

#### `state`
> string | defaults to `"LOADING"`

The current Caspar state. All available states are exported under the `States` namespace:

```js
States = {
  loading: 'LOADING',
  loaded: 'LOADED',
  playing: 'PLAYING',
  paused: 'PAUSED',
  stopping: 'STOPPING',
  stopped: 'STOPPED'
}
```

Usually, you only have to care about the states `playing` and `pausing`, since everything else is handled for you.

### `componentWillLeave(onComplete)`
> function

When Caspar sends the `stop()` command, `props.state` will change to `"STOPPING"`. If you don't do anything, your graphic will just be removed.
Usually though, you'd want to take off your graphic with an animation. The lifceycle method `componentWillLeave` is your chance to just that.

It's important that you call the `onComplete` callback once your out animation is complete, since this is what will actually remove the graphic.

### `static previewData`

When developing your graphic, you often need example data. This can be really tedious to add manually, and also runs the risk of making it into production.
We've made this easy for you — simply specify a static property called `previewData` in your class, and you'll automatically get it as `props.data` when developing.

### Example (using GSAP)
```js
import React, { Component } from 'react'
import { TimelineMax } from 'gsap'
import { States } from 'caspar-graphics'

export default class Example extends Component {
  static previewData = {
    leftText: 'Live',
    rightText: 'nxtedition demo'
  }

  componentDidMount() {
    this.timeline = new TimelineMax({ paused: true })
      .from(this.element, 0.6, { x: '100%', opacity: 0 })

    this.setState({ didMount: true }) // Make sure componentDidUpadte() is called
  }

  componentDidUpdate() {
    if (this.state.state === this.props.state) {
      return
    }

    if (this.props.state === States.playing) {
      this.timeline.play()
      this.setState({ state: States.playing })
    } else if (this.props.state === States.paused) {
      this.timeline.pause()
      this.setState({ state: States.paused })
    }
  }

  componentWillLeave(onComplete) {
    this.timeline
      .eventCallback('onReverseComplete', onComplete)
      .timeScale(2)
      .reverse()
  }

  componentWillUnmount() {
    this.timeline.kill()
  }

  render() {
    const { leftText, rightText } = this.props.data

    return (
      <div ref={ref => (this.element = ref)}>
        <div>{leftText}</div>
        <div>{rightText}</div>
      </div>
    )
  }
}
```

### Viewing your graphic

#### With development UI

To view your graphic, just go to [http://localhost:8080/example](http://localhost:8080/example).

#### Without development UI

If you want to view it outside of the provided GUI, e.g. directly in CasparCG,
you can also go to [http://localhost:8080/example.html](http://localhost:8080/example.html).

> Tip: use your local IP instead of localhost to view it in CasparCG.

#### Query parameters

You can pass a few query parameters:

**_fit**
> boolean | defaults to `false`

If true, your graphic will be scaled down to fit your browsers window (useful when developing on smaller screens).

**_bg**
> string or boolean

Add a background to your graphic's container. Either pass true, for a green color, or pass your own e.g. "#ffff00".

**_autoPreview**
> boolean | defaults to `false`

If true, the graphic will be played immediately when mounted.  

**e.g.**
> http://localhost:8080/example.html?_fit=true&_bg="#ff0000"&_autoPreview=true

## Extras

Your new project comes installed with [Prettier](https://prettier.io/) and [lint-staged](https://github.com/okonet/lint-staged).
By default, lint-staged will run prettier for staged files when running `git commit`. You can change the behavior, or disable it completely.
