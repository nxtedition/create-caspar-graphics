// OGraf Web Component wrapper. Built into each template's `graphic.mjs` with
// the template's single-file HTML injected as `HTML`.
// The template runs in an iframe and is driven through the same window
// globals (update/play/stop/remove) that CasparCG uses.
// https://ograf.ebu.io/v1/specification/docs/Specification.html

const HTML = __OGRAF_HTML__
const STOP_TIMEOUT = 10000

export default class Graphic extends HTMLElement {
  constructor() {
    super()
    this.data = {}
    this.queue = Promise.resolve()
  }

  connectedCallback() {
    this.style.display = 'block'
    this.style.width = '100%'
    this.style.height = '100%'
  }

  // Run calls in order, so they're safe to make at any point in time.
  enqueue(fn) {
    const result = this.queue.then(fn)
    this.queue = result.catch(() => {})
    return result
  }

  mount() {
    this.iframe?.remove()
    this.played = false
    this.removed = false

    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe')
      iframe.setAttribute('allowtransparency', 'true')
      iframe.style.cssText =
        'width:100%;height:100%;border:none;background:transparent;color-scheme:normal;'
      iframe.srcdoc = HTML
      iframe.onload = () => {
        const win = iframe.contentWindow

        win.remove = () => {
          this.removed = true
          this.onRemove?.()
        }

        // The template's globals might not be ready on load (React sets them in an effect).
        let retries = 0
        const checkIfReady = () => {
          if (win.play && win.update) {
            this.win = win
            resolve()
          } else if (retries < 20) {
            setTimeout(checkIfReady, (++retries) ** 2 * 10)
          } else {
            reject(new Error('No window.play/window.update found'))
          }
        }
        checkIfReady()
      }
      this.iframe = iframe
      this.appendChild(iframe)
    })
  }

  sendData() {
    this.win.update(JSON.stringify(this.data))
  }

  load({ data } = {}) {
    return this.enqueue(async () => {
      this.data = { ...(data || {}) }
      try {
        await this.mount()
      } catch (err) {
        return { statusCode: 500, statusMessage: err.message }
      }
      this.sendData()
      return { statusCode: 200 }
    })
  }

  dispose() {
    return this.enqueue(async () => {
      this.iframe?.remove()
      this.iframe = null
      this.win = null
      return { statusCode: 200 }
    })
  }

  updateAction({ data } = {}) {
    return this.enqueue(async () => {
      this.data = { ...this.data, ...(data || {}) }
      if (this.win && !this.removed) {
        this.sendData()
      }
      return { statusCode: 200 }
    })
  }

  playAction(params = {}) {
    const currentStep = this.played && !this.removed ? 0 : -1
    const step = params.goto ?? currentStep + (params.delta ?? 1)

    // stepCount is 1, so any step past 0 means the end state.
    if (step > 0) {
      return this.stopAction(params).then(() => ({
        statusCode: 200,
        currentStep: 1,
      }))
    }

    return this.enqueue(async () => {
      // Once a template has been removed it can't play again, so start over.
      if (!this.win || this.removed) {
        await this.mount()
        this.sendData()
      }
      if (!this.played) {
        this.played = true
        this.win.play()
      }
      return { statusCode: 200, currentStep: 0 }
    })
  }

  stopAction({ skipAnimation } = {}) {
    return this.enqueue(async () => {
      if (!this.win || this.removed) {
        return { statusCode: 200 }
      }

      const removed = new Promise((resolve) => {
        const timeout = setTimeout(resolve, STOP_TIMEOUT)
        this.onRemove = () => {
          clearTimeout(timeout)
          resolve()
        }
      })

      this.win.stop()

      if (skipAnimation) {
        this.removed = true
        this.iframe.style.visibility = 'hidden'
      } else {
        await removed
      }

      this.onRemove = null
      return { statusCode: 200 }
    })
  }

  customAction({ id } = {}) {
    return Promise.resolve({
      statusCode: 404,
      statusMessage: `Unknown action: ${id}`,
    })
  }
}
