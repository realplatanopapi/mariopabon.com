import anime from 'animejs'
import extend from 'extend'
import getElementColor from '../util/get-element-color'

function fadeBackground (element) {
  const color = getElementColor(element, true, 'backgroundColor')
  const newColor = extend({}, color, {
    alpha: (color.alpha - 0.01)
  })

  if (newColor.alpha <= 0) {
    return false;
  }

  element.style.background = 'rgba(' + newColor.red + ', ' + newColor.green + ', ' + newColor.blue + ',' + newColor.alpha + ')'
  requestAnimationFrame(function () {
    fadeBackground(element)
  })
}

function startAnimation (element, rotateAxis, duration) {
  setTimeout(function () {
    requestAnimationFrame(function () {
      fadeBackground(element)
    })
  }, 3000)

  anime({
    easing: 'linear',
    targets: element,
    [rotateAxis]: 360,
    duration: duration,
    loop: true
  })
}

export default function () {
  // Get bits
  const bits = document.querySelectorAll('.bits__bit')

  // Animate bits
  if (bits.length == 2) {
    startAnimation(bits[0], 'rotateX', 30000)
    startAnimation(bits[1], 'rotateY', 45000)
  }
}
