import extend from 'object-assign'
import getElementColor from '../util/get-element-color'
import getRandomInt from '../util/get-random-int';

// Animates a single color (red, green, or blue) for an element
function animateElementColor ({
  element, property, targetColorName, targetColorValue, onComplete
}) {
  return function animate () {
    // Get the current value of the color that is being animated for the element
    const currentColorObj = getElementColor(element, true, property)
    const currentColorValue = currentColorObj[targetColorName]

    let newColorValue

    // Increase or decrease the value of the color by 1, depending on if the
    // current color value is greater than or lesser than the value we are
    // animating to (`targetColorValue`)
    if (currentColorValue > targetColorValue) {
      newColorValue = currentColorValue - 1
    } else if (currentColorValue < targetColorValue) {
      newColorValue = currentColorValue + 1
    } else {
      // Color value has reached or is out of bounds of `targetColorValue`,
      // which means that we're done animating!!
      return onComplete()
    }

    // Only update the element's color if the new color value is a valid color
    if (newColorValue >= 0 && newColorValue <= 255) {
      const newColor = extend({}, currentColorObj)
      newColor[targetColorName] = newColorValue

      element.style[property] = 'rgba(' + newColor.red + ', ' + newColor.green + ', ' + newColor.blue + ', 0.99)'

      return setTimeout(function () {
        requestAnimationFrame(animate)
      }, 100)
    }

    // Call onComplete just in case we end up here
    onComplete()
  }
}

// Helper function for starting the never ending color animation
function animateColor (elements, color) {
  // Animate all elements to the same color
  const targetColorValue = getRandomInt(0, 256);

  elements.forEach(element => {
    const propertyToAnimate = element.dataset.rainbowProperty || 'color'

    return requestAnimationFrame(
      animateElementColor({
        element,
        property: propertyToAnimate,
        targetColorName: color,
        targetColorValue,
        onComplete () {
          // Run the animation again with a new color value
          animateColor(elements, color)
        }
      })
    )
  })
}

export default function () {
  const elements = [].slice.call(document.querySelectorAll('.js-rainbow'))

  // Animate each color individually to avoid getting a gray color 😬
  animateColor(elements, 'blue')
  animateColor(elements, 'green')
  animateColor(elements, 'red')
}
