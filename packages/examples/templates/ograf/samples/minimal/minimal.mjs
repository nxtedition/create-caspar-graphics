class Graphic extends HTMLElement {
  async load() {
    this.style.display = 'flex'
    this.el = document.createElement('p')
    this.el.style.backgroundColor = '#ffffff'
    this.el.style.color = '#000000'
    this.el.style.display = 'inline-block'
    this.el.style.padding = '10px'
    this.el.style.border = '1px solid #000000'
    this.el.style.marginLeft = '-500px'
    this.el.style.transition = 'margin-left ease 0.5s, opacity ease 0.5s'
    this.el.innerHTML = 'Hello world!'
    this.el.id = 'foobaz'
    this.appendChild(this.el)
    return {
      statusCode: 200,
    }
  }

  async dispose() {
    this.innerHTML = ''
  }

  async updateAction() {
    // No actions are implemented in this minimal example
  }

  async playAction(_params) {
    return new Promise((resolve) => {
      // this.elText.addEventListener('ready', () => {
      this.el.style.display = 'block'
      requestAnimationFrame(()=> {

        this.el.style.marginLeft = '500px'
        this.el.addEventListener('transitionend', () => {
          console.log('[OGRAF] end')
          resolve()
        })
      })
      // })
    })
  }

  async stopAction(_params) {
    return new Promise((resolve) => {
      this.el.style.opacity = 0
      this.el.addEventListener('transitionend', () => {
        resolve()
      })
    })
  }
}

export default Graphic

// Note: The renderer will render the component
