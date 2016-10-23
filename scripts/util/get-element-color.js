import extend from 'object-assign'

// Helper function for getting the current value of the color style for an
// element as an object like:
// {
//   red: 255,
//   green: 120,
//   blue: 95
// }
export default function (element, alpha = false, prop = 'color') {
  // getComputedStyle() will return the value of the elements color as a string
  // like rgb(x, x, x). That is useless, so, let's convert it to an object.
  return getComputedStyle(element)[prop].slice((alpha ? 5 : 4), -1).split(',')
    // Convert each string to a number
    .map(function (val) {
      if (isNaN(val)) {
        console.log(val)
      }
      return Number(val)
    })
    // Convert each color value to an object
    .map(function mapColorValueToObject (value, index) {
      switch (index) {
        case 0:
          return {
            red: value
          }
        case 1:
          return {
            green: value
          }
        case 2:
          return {
            blue: value
          }
        case 3:
          return {
            alpha: value
          }
      }
    })
    // Combine all objects into one so we can get an object like:
    // {
    //   red: 255,
    //   green: 120,
    //   blue: 95
    //  }
    .reduce(function combineColorObjects (previousValue, nextValue) {
      return extend(previousValue, nextValue)
    }, {})
}
