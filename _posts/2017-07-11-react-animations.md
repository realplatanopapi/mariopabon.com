---
layout: post
title: "Adding animations to your React app with React Transition Group"
date: 2017-07-11
---

*Heads up*: This post originally appeared on [dev.to](https://dev.to/underdogio/adding-animations-to-your-react-app-with-react-transition-group).

Adding [functional animations](https://www.smashingmagazine.com/2017/01/how-functional-animation-helps-improve-user-experience/) to your app can be a great way to enhance its user experience. When used correctly, animation can help guide the user's attention to certain parts of your app, help re-enforce relationships within the interface, and prevent [change blindness](https://en.wikipedia.org/wiki/Change_blindness).

An example of an animation that can improve the user's experience is fading in an item when it is added to a list. The steps for this animation might look something like this:

1. Render the new item.
2. Prepare the item for the animation. In this case, set its opacity to `0`.
3. Transition the opacity of the element from `0` to `1` over a period of time.

And for removing the item:

1. Mark the item for removal.
2. Transition the opacity of the element from `1` to `0` over a period of time.
3. Remove the element once the transition has completed.

Managing all of these states can get cumbersome, so let's try to find a library that can handle it for us. Enter [React Transition Group](https://github.com/reactjs/react-transition-group/tree/867cc33d79791d7d880092031adcf4cc378ce23e).

React Transition Group contains a set of components that manage the state of a component mounting and un-mounting over time. It doesn't dictate how our components behave as they are mounted or unmounted– that part is up to us. This minimalism gives us the flexibility to define our animations however we want.

In this article we are going to add transition animations to a board of cards, animating cards as they are added to and removed from the board.

Here's the finished result:

![End result](https://thepracticaldev.s3.amazonaws.com/i/kasojw34xb5u4552i7lk.gif)

You can see a live demo of the animation [here](https://restlessbit.github.io/react-transition-demo/index.html).

## Prerequisites

You should have a basic understanding of [React](https://facebook.github.io/react/) and [CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions).

### Packages used

1. [react v15.6.1](https://github.com/facebook/react/tree/v15.6.1)
2. [react-dom v15.6.1](https://github.com/facebook/react/tree/v15.6.1)
3. [react-transition-group v2.0.2](https://github.com/reactjs/react-transition-group/tree/v2.0.2)

## Getting set up

Before we can add animations to our app, we're going to need an app to animate!

The app we're going to be creating is fairly simple as it consists of just 3 components:

1. `<Card />`
    - The component that will be animated in and out of existence.
2. `<Board />`
    - Renders a list of `<Card/>` items.
3. `<Application />`
    - The root of our application. Manages the state of cards to be rendered in a `<Board />`, and contains buttons for adding and removing cards.

Here's the source code for these components:

### `<Card/>`

```jsx
function Card ({children, onRemove}) {
  return (
    <div className="card">
      {children}
      <button onClick={onRemove}>Remove</button>
    </div>
  )
}
```

### `<Board />`

```jsx
function Board ({children}) {
  return (
    <ul className="board">
      {children}
    </ul>
  )
}
```

### `<Application/>`

```jsx
class Application extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      cards: []
    }

    this.addCard = this.addCard.bind(this)
    this.removeCard = this.removeCard.bind(this)
    this.removeLastCard = this.removeLastCard.bind(this)
  }

  render () {
    const {cards} = this.state

    return (
      <main className="container">
        <h1>React Transition Demo</h1>
        <button onClick={this.addCard}>Add a card</button>
        <button onClick={this.removeLastCard}>Remove a card</button>
        <Board>
          {
            cards.map(card => {
              return (
                <li className="board__item" key={card.id}>
                  <Card onRemove={() => {
                    this.removeCard(card.id)
                  }}>{card.content}</Card>
                </li>
              )
            })
          }
        </Board>
      </main>
    )
  }

  addCard () {
    const {cards} = this.state
    const id = cards.length + 1
    const newCard = {
      id,
      content: `Card ${id}`
    }
    this.setState({
      cards: cards.concat([newCard])
    })
  }

  removeCard (id) {
    const {cards} = this.state
    this.setState({
      cards: cards.filter(card => card.id !== id)
    })
  }

  removeLastCard () {
    const {cards} = this.state
    this.setState({
      cards: cards.slice(0, -1)
    })
  }
}
```

You can get the styles for these components [from GitHub](https://github.com/restlessbit/react-transition-demo/blob/master/styles.css).

If you run this app as-is, you will be able to add and remove cards (exciting stuff!). But the way the cards just pop in and out of existence isn't visually appealing. Let's fix that by adding transition animations.

## Adding animations

We want to make adding and removing cards feel seamless. We can do by fading and sliding cards as they are added and removed, like so:

![Slide and fade](https://thepracticaldev.s3.amazonaws.com/i/raviwyzxqre7a04pjrtx.gif)

But before we can animate card transitions, we need a way to track the state of cards as they are added and removed from our `<Board />`, and run the appropriate animation as cards enter and exit.

The card enter animation should run as soon as a card is added to the list. The card exit animation should run when a card is removed from the list, but the card should remain in the DOM until the animation is finished. Once the animation has completed, the card should be removed from the DOM.

This sounds like a lot of work. So rather than implementing this functionality ourselves, let's use the `<TransitionGroup />` component provided by React Transition Group.

### Using `<TransitionGroup />`

`<TransitionGroup />` should be wrapped around the list of elements to be animated. So let's replace the `<Board />` component in the render method of `<Application />` with `<TransitionGroup />`.

By default `<TransitionGroup />` will wrap its list of child elements in a `<span />`, but we can have it wrap our cards in a `<Board />` instead by setting the `component` prop:

```jsx
import TransitionGroup from 'react-transition-group/TransitionGroup'

// ...

<TransitionGroup component={Board}>
  {
    cards.map(card => {
      return (
	<li className="board__item" key={card.id}>
	  <Card onRemove={() => {
	    this.removeCard(card.id)
          }}>{card.content}</Card>
	</li>
      )
    })
  }
</TransitionGroup>

// ...
```

But if you run the app and start adding cards, you will notice that cards still pop in and out of existence like before. This is because we haven't yet defined how our cards should behave as they are added or removed. In order to do that, we need to wrap each of our cards in a `<Transition />` component.

### Using `<Transition />`

The `<Transition />` component from React Transition Group allows us to define how a component should behave when it is rendered or about to be removed from the DOM.

The state of a component being added or removed is handled via an `in` prop. This prop is a `boolean` value that indicates if the component should be shown or not. A value of `true` means the component should be shown, and `false` means the component should be hidden.

The value of `in` is provided by `<TransitionGroup />`, which will set this prop to `true` when a component is being added, and to `false` when a component is removed.

A change in the value of the `in` prop will trigger a series of status changes over a period of time. These status changes allow us to animate a component by applying different styles to it as the status of the transition changes.

We're going to create a `<FadeAndSlideTransition />` component that can be used to apply a transition animation to a component as it is mounted and unmounted.

Here is the code for that component:

```jsx
import Transition from 'react-transition-group/Transition'

// <FadeAndSlideTransition /> is a component that wraps children in
// a <Transition /> component.
// 'children' is the element to be animated.
// 'duration' is the duration of the animation in milliseconds.
// The `in` prop will be provided by <TransitionGroup />.
function FadeAndSlideTransition ({children, duration, in: inProp}) {
  // Styles to set on children which are necessary in order
  // for the animation to work.
  const defaultStyle = {
    // Transition "opacity" and "transform" CSS properties.
    // Set duration of the transition to the duration of the animation.
    transition: `${duration}ms ease-in`,
    transitionProperty: 'opacity, transform'
  }

  // Styles that will be applied to children as the status
  // of the transition changes. Each key of the
  // 'transitionStyles' object matches the name of a
  // 'status' provided by <Transition />.
  const transitionStyles = {
    // Start with component invisible and shifted up by 10%
    entering: {
      opacity: 0,
      transform: 'translateY(-10%)'
    },
    // Transition to component being visible and having its position reset.
    entered: {
      opacity: 1,
      transform: 'translateY(0)'
    },
    // Fade element out and slide it back up on exit.
    exiting: {
      opacity: 0,
      transform: 'translateY(-10%)'
    }
  }

  // Wrap child node in <Transition />.
  return (
    <Transition in={inProp} timeout={{
      // Set 'enter' timeout to '0' so that enter animation
      // will start immediately.
      enter: 0,

      // Set 'exit' timeout to 'duration' so that the 'exited'
      // status won't be applied until animation completes.
      exit: duration
    }}>
      {
        // Children is a function that receives the current
        // status of the animation.
        (status) => {
          // Don't render anything if component has 'exited'.
          if (status === 'exited') {
            return null
          }

          // Apply different styles to children based
          // on the current value of 'status'.
          const currentStyles = transitionStyles[status]
          return React.cloneElement(children, {
            style: Object.assign({}, defaultStyle, currentStyles)
          })
        }
      }
    </Transition>
  )
}
```

We can apply our fade and slide transition to our cards by wrapping each `<Card />` in a `<FadeAndSlideTransition />` component:

```jsx
// render method of <Application />
<TransitionGroup component={Board}>
  {
    cards.map(card => {
      return (
        <FadeAndSlideTransition duration={150} key={card.id}>
          <li className="board__item">
            <Card onRemove={() => {
              this.removeCard(card.id)
            }}>{card.content}</Card>
          </li>
        </FadeAndSlideTransition>
      )
    })
  }
</TransitionGroup>
```

If you rerun the app now, you will see that a nice animation will be applied to cards as they are added and removed from the board.

Here's a break down of how this all works.

Whenever a card is added:

1. `<TransitionGroup />` will render a new `<FadeAndSlideTransition />` component, which renders a `<Card />` contained within a `<Transition />`.

2. Each `<Card />` immediately has its `transition` styles set, which will cause the `opacity` and `transform` styles to be animated whenever they are changed.

3. The `in` prop of `<FadeAndSlideTransition />` is set to `true`, which causes the `children` function of the `<Transition />` component to be called with a status of `entering`. The styles from `transitionStyles.entering` are then applied to `<Card />`.

4. Because the timeout of the enter animation is set to `0`, `children` will be called again immediately with a status of `entered`. This updates the `<Card />`'s `opacity` and `transform` styles, which triggers a CSS transition.

Whenever a card is removed:

1. `<TransitionGroup />` will set the `in` prop of the `<FadeAndSlideTransition />` component that the card is rendered within to `false`.
2.  The `children` function of the `<Transition />` component will be called with a status of `exiting`. `exiting` styles are applied to the `<Card />` which causes it to fade out and slide up.
3.  Once the `duration` of the animation has elapsed, `children` is invoked with a status of `exited`. We return `null` in order to remove the `<Card />` from the DOM.

Applying inline styles is just one way of creating an animation. You could also use the `status` variable from the `<Transition />` `children` function to apply a CSS class:

```jsx
<Transition in={inProp} timeout={{
  enter: 0,
  exit: duration
  }}>
    {
      (status) => {
        // Don't render anything if component has "exited".
        if (status === 'exited') {
          return null
        }

        return <Card className={`fade fade-${status}`} />
      }
   }
</Transition>
```

You would then create a CSS class for each status:

```css
.fade {
  transition: ease-in 0.15s;
  transition-property: opacity, transform;
}

.fade-entering {
  opacity: 0
  transform: translateY(-10%);
}
```

Because `<Transition />` only manages the status of our animation, we're free to implement our animation how ever we see fit. Hopefully these two examples are enough for you to get started on a few animations of your own.

If you'd like to see a working example with some code, you can check out the source code for this example [on GitHub](https://github.com/restlessbit/react-transition-demo).

And if you'd like to learn more about React Transition Group, check out the [GitHub repo](https://github.com/reactjs/react-transition-group) and [documentation](https://reactcommunity.org/react-transition-group/).
