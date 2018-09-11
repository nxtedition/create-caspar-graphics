export default (container = document.getElementById('app')) => {
  const ratio = window.innerWidth / window.innerHeight
  console.log('scaleToFit')

  if (ratio >= 16 / 9 && window.innerHeight < container.offsetHeight) {
    const scale = window.innerHeight / container.offsetHeight
    container.style.transform = `scale(${scale})`
    container.style.transformOrigin = `top left`
  } else if (ratio < 16 / 9 && window.innerWidth < container.offsetWidth) {
    const scale = window.innerWidth / container.offsetWidth
    container.style.transform = `scale(${scale})`
    container.style.transformOrigin = `top left`
  }
}
