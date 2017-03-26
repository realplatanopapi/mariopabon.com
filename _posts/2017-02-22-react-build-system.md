---
layout: post
title: "Create a build system for your React app in 5 minutes or less"
date: 2017-02-22
---

**Note: This post originally appeared [on Medium](https://medium.com/underdog-io-engineering/create-a-build-system-for-your-react-app-in-5-minutes-or-less-91c501a30b1d#.o2bn89e5d).**

Wanna get started with React but not sure how to set up your development environment?
This post will show you how to get up and running quickly with a minimal build system that requires a single command to create a working build: [`webpack`](https://webpack.js.org/).

## Prerequisites

Before we begin, make sure you have Node v6.9.5 or greater installed on your machine.
You must also have a working knowledge of the terminal, Node, npm, and React.

## Project structure

To make it easier to follow along, here’s the directory structure I’ll be using for this article:

```bash
| - /
  | - /app
    | - /components
      | - hello.js
    | - index.html
    | - index.js
  | -.babelrc
  | - package.json
  | - webpack.config.js
```

You may also find the [source code from this post on GitHub](https://github.com/restlessbit/react-webpack-example).
We should setup our `package.json` file so we can start adding dependencies to it. Open up `package.json` and add the following:

```json
{
  "private": true
}
```


Setting the `private` field to `false` will stop `npm` from annoying us about a missing `readme` field as we install dependencies, and will prevent us from accidentally preventing us from publishing our app to npm.

Now that that’s out of the way, we can start building our app.

## The app

Since we’re building a React app, we’re going to need to add `react` as a dependency. We should also add `react-dom`, because we want to be able to render our app in the browser. So in the root directory of the project, run the following in your terminal:

```bash
$ npm install react react-dom -S
```

Since the focus of this article is the build system, we’re going to keep the app super simple and have it consist of a single component that renders the string ‘Hello React!’.
Before we write that component, let’s create the markup that our component will be rendered in. Open up `app/index.html` and add this markup:

```html
<!-- app/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Super Dope React App</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

This markup contains a single div that has an id of `app`, which is where our app will be rendered.

Now let’s create the component that will render our ‘Hello React!’ message. Add the following JavaScript to `app/components/hello.js`:

```jsx
// app/components/hello.js

import React from 'react'

function Hello () {
  return (
    <div>
      Hello React!
    </div>
  )
}

export default Hello
```

This is a [functional component](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components) that renders our message within a div.

Next, let’s add the main entry point of our app, which will render the `<Hello />` component in our HTML. Let’s do that in `app/index.js`:

```jsx
// app/index.js
import Hello from '../app/components/hello'
import React from 'react'
import {render} from 'react-dom'

render(<Hello />, document.getElementById('app'))
```

We now have a (very simple) functioning React app.

## The build system

We’re going to base our build system off of Webpack, which will allow us to build our entire application with a single command.

We’re also going to need [Babel](http://babeljs.io/) since we are using ES2015 and JSX, which are not supported fully in most modern browsers (yet).

Let’s install all of that now:

```bash
$ npm install webpack babel-core babel-loader babel-preset-es2015 babel-preset-react -D
```

Since Webpack only understands JavaScript by default, we’re going to have to install [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) in order to handle our app/index.html file:

```bash
$ npm install html-webpack-plugin -D
```

### Configuring Webpack

Let’s set up webpack by adding our desired config in `webpack.config.js`:

```javascript
// webpack.config.js

const HtmlPlugin = require('html-webpack-plugin')

module.exports = {
  // Tell webpack to start bundling our app at app/index.js
  entry: './app',

  // Output our app to the dist/ directory
  output: {
    filename: 'app.js',
    path: 'dist'
  },

  // Emit source maps so we can debug our code in the browser
  devtool: 'source-map',

  // Tell webpack to run our source code through Babel
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },

  // Since Webpack only understands JavaScript, we need to
  // add a plugin to tell it how to handle html files.   
  plugins: [
    // Configure HtmlPlugin to use our own index.html file
    // as a template.
    // Check out https://github.com/jantimon/html-webpack-plugin
    // for the full list of options.
    new HtmlPlugin({
      template: 'app/index.html'
    })
  ]
}
```


This config will tell Webpack to start bundling our app at app/index.js. The `module.loaders` field tells webpack that if it comes across any files that have the extension `.js`, it should run those files through Babel. The `exclude` field tells Webpack that it should ignore files in the `node_modules` directory; processing those files would take an eternity, and is really not necessary because most authors already pre-compile their libraries to work with CommonJS.

We also add the [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#configuration), and configure it to use our `app/index.html` file as a template. The plugin will also automatically add a script tag that points to our bundled `app.js `file.

Both the compiled `app.js` and `index.html` file will be emitted to the `dist` directory once `webpack` is run.

But before we can create a build, we must first configure Babel.

### Configuring Babel

Babel doesn’t really do anything useful unless you tell it to, which we can do by adding `presets` to our `.babelrc` file:

```json
{
  "presets": [
    "es2015",
    "react"
  ]
}
```

This will tell Babel to convert our ES2015 and JSX to regular ES5 code that can be run in browsers.

## Creating a build

Now that everything is in place, we can create a build by running Webpack.

When installing Webpack, a binary is added to the `node_modules/.bin/webpack` directory which can be run from your terminal like:

```bash
$ ./node_modules/.bin/webpack
```

But typing all that out every time you want want to produce a new build sucks, so instead let’s add an npm script to `package.json` that will save us a whole lot of typing:

```json
{
  "private": true,
  "scripts": {
    "build": "webpack"
  },
  ... other stuff
}
```

npm will automatically look for binaries in the `node_modules/.bin` directory, so we can leave that out from our script.

Now we can create a build by running:

```bash
$ npm run build
```

This will run `webpack`, which will output `app.js`, `app.js.map`, and `index.html` to the `dist/` directory.

## Running the app

If you want to see your React app in action you can open up `index.html` directly, or if you prefer, create a simple HTTP server:

```bash
$ npm install http-server -D
$ ./node_modules/.bin/http-server dist -p 8080
```

Open up [http://localhost:8080](http://localhost:8080) in your browser, and you should see the following:

![Example app screenshot](/images/posts/2017-02-22-react-build-system/example-app-screenshot.png)

Huzzah!
That wasn’t so bad was it?

## Next steps

There are many improvements we can make to get this build system ready for production, like minifying assets and handling CSS.

If you’d like to see an example of a Webpack config that’s ready for production, check out our [React boilerplate repo](https://github.com/underdogio/react-starter) on Github.
