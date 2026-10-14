// OGraf Web Component wrapper. Built into each template's `graphic.mjs` with
// the template's single-file HTML injected as `HTML`.
// The template runs in an iframe and is driven through the same window
// globals (update/play/stop/remove) that CasparCG uses.
// https://ograf.ebu.io/v1/specification/docs/Specification.html

const HTML = __OGRAF_HTML__
const STOP_TIMEOUT = 10000
const READY_TIMEOUT = 10000

// Runs inside the iframe. Renderers may load graphics from an opaque ("null")
// origin, which makes the iframe cross-origin, so we can't touch its window
// directly. Instead the bridge forwards calls over a MessageChannel.
function bridge() {
  var port = null
  var removed = false

  window.remove = function () {
    removed = true
    if (port) port.postMessage({ type: 'removed' })
  }

  window.addEventListener('message', function (event) {
    if (
      event.source !== window.parent ||
      event.data !== 'ograf:connect' ||
      !event.ports[0]
    ) {
      return
    }

    port = event.ports[0]
    port.onmessage = function (message) {
      var data = message.data
      try {
        if (typeof window[data.method] !== 'function') {
          throw new Error(
            'window.' +
              data.method +
              ' is not defined, the template may have crashed',
          )
        }
        window[data.method].apply(window, data.args || [])
        port.postMessage({ id: data.id })
      } catch (err) {
        port.postMessage({ id: data.id, error: String(err && err.message) })
      }
    }

    // The template's globals might not be ready yet (React sets them in an effect).
    var retries = 0
    function checkIfReady() {
      if (window.play && window.update) {
        port.postMessage({ type: 'ready' })
        if (removed) port.postMessage({ type: 'removed' })
      } else if (retries < 20) {
        setTimeout(checkIfReady, Math.pow(++retries, 2) * 10)
      } else {
        port.postMessage({
          type: 'error',
          message: 'No window.play/window.update found',
        })
      }
    }
    checkIfReady()
  })
}

const BRIDGE = `<script>(${bridge})()<\/script>`
const SRCDOC = /<head[^>]*>/i.test(HTML)
  ? HTML.replace(/<head[^>]*>/i, (head) => head + BRIDGE)
  : BRIDGE + HTML

const ok = (result) => ({ statusCode: 200, ...result })
const fail = (err) => ({
  statusCode: 500,
  statusMessage: err?.message || String(err),
})

export default class Graphic extends HTMLElement {
  constructor() {
    super()
    this.data = {}
    this.queue = Promise.resolve()
    this.pending = new Map()
    this.nextId = 0
  }

  connectedCallback() {
    this.style.display = 'block'
    this.style.width = '100%'
    this.style.height = '100%'
  }

  // Run calls in order, so they're safe to make at any point in time.
  // Errors are returned as a 500 payload and never thrown.
  enqueue(fn) {
    const result = this.queue.then(fn).catch(fail)
    this.queue = result
    return result
  }

  unmount() {
    this.port?.close()
    this.port = null
    this.iframe?.remove()
    this.iframe = null
    for (const { reject } of this.pending.values()) {
      reject(new Error('Graphic was unmounted'))
    }
    this.pending.clear()
  }

  mount() {
    this.unmount()
    this.played = false
    this.removed = false

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timed out waiting for the template to load')),
        READY_TIMEOUT,
      )
      const iframe = document.createElement('iframe')
      iframe.setAttribute('allowtransparency', 'true')
      iframe.style.cssText =
        'width:100%;height:100%;border:none;background:transparent;color-scheme:normal;'
      iframe.srcdoc = SRCDOC
      iframe.onload = () => {
        const { port1, port2 } = new MessageChannel()
        this.port = port1
        port1.onmessage = ({ data }) => {
          if (data.type === 'ready') {
            clearTimeout(timeout)
            resolve()
          } else if (data.type === 'error') {
            clearTimeout(timeout)
            reject(new Error(data.message))
          } else if (data.type === 'removed') {
            this.removed = true
            this.onRemove?.()
          } else if (this.pending.has(data.id)) {
            const { resolve, reject } = this.pending.get(data.id)
            this.pending.delete(data.id)
            data.error ? reject(new Error(data.error)) : resolve()
          }
        }
        iframe.contentWindow.postMessage('ograf:connect', '*', [port2])
      }
      this.iframe = iframe
      this.appendChild(iframe)
    })
  }

  call(method, ...args) {
    return new Promise((resolve, reject) => {
      const id = ++this.nextId
      this.pending.set(id, { resolve, reject })
      this.port.postMessage({ id, method, args })
    })
  }

  sendData() {
    return this.call('update', JSON.stringify(this.data))
  }

  load({ data } = {}) {
    return this.enqueue(async () => {
      this.data = { ...(data || {}) }
      await this.mount()
      await this.sendData()
      return ok()
    })
  }

  dispose() {
    return this.enqueue(async () => {
      this.unmount()
      return ok()
    })
  }

  updateAction({ data } = {}) {
    return this.enqueue(async () => {
      this.data = { ...this.data, ...(data || {}) }
      if (this.port && !this.removed) {
        await this.sendData()
      }
      return ok()
    })
  }

  playAction(params = {}) {
    return this.enqueue(async () => {
      const currentStep = this.played && !this.removed ? 0 : -1
      const step = params.goto ?? currentStep + (params.delta ?? 1)

      // stepCount is 1, so any step past 0 means the end state.
      if (step > 0) {
        await this.stop(params)
        return ok({ currentStep: 1 })
      }

      // Once a template has been removed it can't play again, so start over.
      if (!this.port || this.removed) {
        await this.mount()
        await this.sendData()
      }
      if (!this.played) {
        this.played = true
        await this.call('play')
      }
      return ok({ currentStep: 0 })
    })
  }

  stopAction(params = {}) {
    return this.enqueue(async () => {
      await this.stop(params)
      return ok()
    })
  }

  async stop({ skipAnimation } = {}) {
    if (!this.port || this.removed) {
      return
    }

    const removed = new Promise((resolve) => {
      const timeout = setTimeout(resolve, STOP_TIMEOUT)
      this.onRemove = () => {
        clearTimeout(timeout)
        resolve()
      }
    })

    try {
      await this.call('stop')
      if (!skipAnimation) {
        await removed
      }
    } finally {
      // Whether the template removed itself, the animation was skipped or it never
      // called remove() (the timeout), it's done now. The next play starts over.
      this.onRemove = null
      this.removed = true
      if (this.iframe) {
        this.iframe.style.visibility = 'hidden'
      }
    }
  }

  customAction({ id } = {}) {
    return Promise.resolve({
      statusCode: 404,
      statusMessage: `Unknown action: ${id}`,
    })
  }
}
