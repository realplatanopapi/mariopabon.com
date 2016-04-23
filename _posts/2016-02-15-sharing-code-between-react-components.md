---
layout: post
title:  "Sharing code between React components"
date:   2016-02-15
---

You may come across a situation where you want to share functionality between multiple React components, such as requiring a user to be authenticated before rendering. This is achievable with **high order components**.

## What’s a high order component?

A high order component is a function that takes a component, and returns a new component that makes use of the passed component.

Here’s what it looks like:

**HighOrderComponent.js**

<pre class="language-jsx"><code>import React from 'react';
import { fetchData } from './api';

// Take a component
export default (InnerComponent) => {

  // Return another component that uses InnerComponent.
  return React.createClass({
    getInitialState() {
      return {
        data: false
      };
    },
    componentDidMount() {
      // Fetch some data
      fetchData().then(data => {
        this.setState({ data });
      });
    },
    render() {
      // Display loading message while data is being fetched.
      if (!this.state.data) {
        return (
          &lt;div&gt;We busy...&lt;/div&gt;
        );
      }

      // Render InnerComponent once we have the data.
      return &lt;InnerComponent data={this.state.data} /&gt;;
    }
  });
};</code></pre>

**AnotherComponent.js**

<pre class=“language-jsx”><code>import { HighOrderComponent } from './high-order-component';

const AnotherComponent = ({ data }) => {
  return (
    &lt;div&gt;{ data.whatever }&lt;/div&gt;
  );
};

const EnhancedComponent = HighOrderComponent(AnotherComponent);
// &lt;EnhancedComponent /&gt;</code></pre>

Now whenever you render EnhancedComponent it will fetch data when it is mounted, display a loading message while it is fetching data, and then render the data once it has loaded.

## Authentication Example

Another use case for high order components is authentication. You may not want to display a certain component unless the user has been authenticated.

You could either render another component (like say, a sign in form) in place of the component that requires authentication, or, if you are using <a href="https://github.com/reactjs/react-router" target="_blank">React Router</a>, you could navigate to another route within your app.

Here’s an example using React Router:

**AuthenticatedComponent.js**

<pre class="language-jsx"><code>import React from 'react';
import { browserHistory } from 'react-router';

// Example user object singleton that emits a change event
// whenever its status changes.
import user from './user';

export default (InnerComponent) => {
  return React.createClass({
    checkAuth() {
      // Go to login route if user is not set.
      if(!user) {  
        browserHistory.push('/login');
      }
    },
    componentDidMount() {
      // Check if user is authenticated on initial render
      this.checkAuth();

      // Check user object on change
      user.on('change', this.checkAuth);
    },
    componentWillUnmount() {
      // Remove our event listener
      user.off('change', this.checkAuth);
    },
    render() {
      // Render InnerComponent
      return (
        &lt;InnerComponent /&gt;
      );
    }
  });
};</code></pre>

Example “Dashboard” component that requires an authenticated user:

**Dashboard.js**

<pre class="language-jsx"><code>import React from 'react';

const SomeOtherComponent = ({ user }) => {
  return (
    &lt;h1&gt;Hello, { user.name }!&lt/h1&gt;
  );
};

export default SomeOtherComponent;</code></pre>

Tying everything together:

**App.js**

<pre class="language-jsx"><code>import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Root from './root';
import Dashboard from './dashboard';
import Login from './login';

import Authenticated from './authenticated-component';

ReactDOM.render(
  &lt;Router history={browserHistory}&gt;
   &lt;Route path=&quot;/&quot; component={Root}&gt;
     &lt;IndexRoute component={Authenticated(Dashboard)} /&gt;
     &lt;Route path=&quot;login&quot; component={Login}/&gt;
   &lt;/Route&gt;
 &lt;/Router&gt;,
 document.getElementById('root')
);</code></pre>

Whenever a non-signed in user tries to visit the app’s index route, they will be redirected to the login route instead.

## Resuability FTW

While high order components make it easy share the same logic between multiple components, it may not always make sense to use one.

But if the logic that you are trying to reuse is tied to your component lifecycle methods, then you may want to look into using a high order component to keep that logic in one place.
