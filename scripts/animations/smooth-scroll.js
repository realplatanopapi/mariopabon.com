import anime from 'animejs'

export default function () {
  const links = [].slice.call(document.querySelectorAll('a[href*="#"]:not([href="#"])'))

  links.forEach(link => {
    const linkTargetId = link.getAttribute('href').slice(1)
    const target = document.getElementById(linkTargetId)

    if (target) {
      link.addEventListener('click', e => {
        e.preventDefault()
        link.blur()

        const bodyRect = document.body.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()
        const scrollTop = targetRect.top - bodyRect.top

        if (Math.abs(document.body.scrollTop - scrollTop) > 10) {
          anime({
            targets: document.body,
            scrollTop,
            duration: 750,
            easing: 'easeInOutSine'
          })
        }
      })
    }
  })
}
