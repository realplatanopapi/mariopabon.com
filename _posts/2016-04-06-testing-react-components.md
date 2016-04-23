---
layout: post
title:  "Testing React Components"
date:   2016-04-06
---

While the [React documentation](https://facebook.github.io/react/index.html) is an excellent resource for learning React, it is a bit lacking when it comes to testing. It does cover [React’s testing utilities](https://facebook.github.io/react/docs/test-utils.html), but not much more than that.

And if you're trying to learn more about shallow rendering, the current [preferred method](https://discuss.reactjs.org/t/whats-the-prefered-way-to-test-react-js-components/26) of testing React components, you will quickly find out that the React testing utilities alone are not enough to throughly test your application— enter Enzyme.

[Enyzme](https://github.com/airbnb/enzyme) is a testing utility that makes it easier to test the output of your components. It also includes a few goodies such as easy DOM traversal via [Cheerio](https://github.com/cheeriojs/cheerio) and a simple API for simulating browser events like `click` or `change`.

## An example

The testing framework I will be using is [Ava](https://github.com/sindresorhus/ava), but the concepts laid out in this article will work with other testing frameworks such as [Mocha](https://mochajs.org) or [Jasmine](http://jasmine.github.io/).

### The component

We will be testing a `MessageBox` component, which is part of an imaginary instant messaging application. This component contains a form with a single text input. The component takes a single prop, `onMessageSend`, which is a function. When the form is submitted, the `MessageBox` component invokes `onMessageSend` and passes it the value of the text input.

#### How to use MessageBox

```jsx
import React from 'react'
import MessageBox from './message-box'

export default React.createClass({
  render() {
    return (
      <MessageBox onMessageSend={function(message) {
          // TODO: Replace this alert() with something real
          alert(message)
        }} />
    )
  }
})
```

#### MessageBox component

```jsx
import React from 'react'

export default React.createClass({
  getInitialState() {
    return {
      message: ''
    }
  },
  render() {
    return (
      <form onSubmit={this.onMessageSubmit}>
        { /* Update this.state.message whenever the input value changes */ }
        <input type="text" value={this.state.message} onChange={this.onMessageChange} />
        <button>Send</button>
      </form>
    )
  },
  onMessageChange(e) {
    // Update this.state.message on message input change
    this.setState({
      message: e.target.value
    })
  },
  onMessageSubmit(e) {
    // Prevent the default form submit action
    e.preventDefault()

    // Invoke the onMessageSend handler passed down via props
    // and pass it the current value of this.state.message
    this.props.onMessageSend(
      this.state.message
    )

    // Clear the message input in the name of user experience
    this.setState({
      message: ''
    })
  }
})
```

### The test

The job of the `MessageBox` component is to invoke a function whenever its form is submitted. It doesn't actually send the message- that is the responsibility of the component that uses `MessageBox`.

So our test will focus on the user experience of filling out the form. It will also verify that the `onMessageSend` handler is being passed the message that was entered into the form.

```jsx
import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import MessageBox from '../../app/components/message-box'

test('sending a message', t => {
  // Create an onMessageSend handler from a Sinon spy
  const onMessageSend = sinon.spy()

  // Shallow render the MessageBox component with Enzyme,
  // and pass it our onMessageSend handler as a prop
  const wrapper = shallow(
    React.createElement(MessageBox, {
      onMessageSend
    })
  )

  // Fill out the form and submit it
  wrapper.find('input').simulate('change', {target: {value: 'A test message'} })
  wrapper.find('form').simulate('submit', { preventDefault(){} })

  // Check that our message handler was called with the message we entered into the form
  t.ok(onMessageSend.calledWith('A test message'))

  // Test that the form was reset
  t.same(wrapper.find('input').prop('value'), '')
})
```

First, we create a handler for `onMessageSend` from a [Sinon spy](http://sinonjs.org/docs/#spies). We do this so that later on in our test we can check that `onMessageSend` was called with the message that we input into the form rendered by `MessageBox`.

Next, we shallow render our component with Enzyme and pass it our `onMessageSend` handler as a prop. [Shallow rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md) allows us to render components without a DOM. It also restricts rendering to one level deep, which means that child components are not rendered. This ensures that we are testing our components in isolation.

Once `MessageBox` has been rendered, we find the input field within the rendered component, and simulate a browser `change` event that includes a fake message; this represents the user filling out the form. We then submit the form by querying the form element and simulating a `submit` event on it.

After the form has been submitted, we assert that the `onMessageSend` handler we created at the beginning of the test was called with the message that we just entered into the form. We also assert that the input field was reset.

## Conclusion

Enzyme provides a suite of powerful tools that allow us to thoroughly test React components without much effort. There is a lot more to Enzyme than what has been mentioned here, such as being able to [query elements with a component constructor](https://github.com/airbnb/enzyme/blob/master/docs/api/selector.md), or the ability to [render components to static html](https://github.com/airbnb/enzyme/blob/master/docs/api/render.md). I encourage you to explore the [Enzyme documentation](https://github.com/airbnb/enzyme/tree/master/docs) to learn more about how Enzyme can make testing React components a little less painful.
