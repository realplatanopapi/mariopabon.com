---
layout: post
title:  "Unit Testing Express Routes"
date:   2015-12-23
---

Typically when someone goes about unit testing their Express routes, they resort to using libraries such as <a href="https://www.npmjs.com/package/supertest" target="_blank">supertest</a>, which requires you to start up your entire app in order to test a single route. While this may be great for integration testing, it's not a great way to go about testing your code in isolated units. In this post I will share a better way to unit test your routes.

## The tools

The testing framework that will be used throughout this post is <a href="https://www.npmjs.com/package/ava" target="_blank">Ava</a>, but this approach to unit testing will work with any testing framework.

## The method

In order to test our code in isolated units, we have to make sure that we are testing each piece of code on its own, and not any of its dependencies. This can be done by replacing the dependencies with mocks. But in a typical Node application, modules declare their dependencies by making a call to require(). How could we override this in a test? There are several libraries like <a href="https://www.npmjs.com/package/proxyquire" target="_blank">proxyquire</a> that can automagically override calls to require() and let you replace required dependencies with mocks. But there's a better, less magical way.

## The Core & Shell Architecture

Instead of relying on magic to be able to mock dependencies, we can rewrite our modules in a way that lets us pass the module its dependencies when we initialize it, rather than having the modules declare their own dependencies internally. This principle of passing an object its dependencies is known as <a href="http://stackoverflow.com/questions/130794/what-is-dependency-injection" target="_blank">dependency injection</a>. Taking this approach, we can structure our app in two parts: a "core", and a "shell".

The "core" is the part of your app that has a bunch of dependencies, and the "shell" is the part of your app that passes dependencies to the core (this is a technique I learned from <a href="https://www.youtube.com/watch?v=fgqh-OZjpYY" target="_blank">Mattias Petter Johansson</a> on YouTube; you should <a href="https://twitter.com/mpjme" target="_blank">follow him</a> on Twitter).

Here's an example core module:

#### lib/dbInit.js (the core)

<pre><code class="language-javascript line-numbers">module.exports = function(services) {
  // Get database connection from the outside world
  const db = services.dbConnection;

  // Return a function that does things with the DB connection
  return {
    seed(cb) {
      // db.init() takes some fake data and a callback function
      // that will be invoked once init() is done doing its thing
      db.init(['a', 'b', 'c'], cb);
    }
  };
};</code></pre>

Here's an example shell module that uses the above core module:

#### app.js (the shell)

<pre><code class="language-javascript line-numbers">// Dependencies
const app = require('express')();
const dbConnection = require('db').connect('http://localhost');
const dbInit = require('./lib/dbInit');

// Pass dependencies to core
dbInit({ dbConnection });

// Now we can use the core module
dbInit.seed();</code></pre>

This makes passing mocks to our core module super simple:

#### dbInit-test.js

<pre><code class="language-javascript line-numbers">import test from 'ava';

test('dbInit.seed() invokes callback', t => {
  // Plan for 1 assertion
  t.plan(1);

  // Mock DB Connection
  const dbConnection = {
   init(data, cb) {
     cb(true);
   }
  };

  // Get our core module and pass it the mock db connection
  const dbInit = require('./lib/dbInit')({ dbConnection });

  // Perform our test
  dbInit.seed((actual) => {
    t.ok(actual, 'callback was invoked');
  });
});</code></pre>

### Why not just use a library like <a href="https://www.npmjs.com/package/proxyquire" target="_blank">proxyquire</a>?

There are a couple of reasons why rewriting code in this way is better than relying on a library like proxyquire:

- It forces us to write less tangled code
- Introducing an external library into the mix adds unneeded complexity

My last reason is a bit subjective, but I'm not a big fan of using "magical" libraries that hide what they are doing under the covers. I think it's better to be as explicit as possible with what you are doing to make it easier for other people to understand your code. But that's just me.

However, this is just my opinion. Proxyquire is quite popular and it seems to be working out for a lot of people, so if that is your cup of tea, then go for it.

## Example Express App

Here is an example Express app that makes use of the core/shell architecture. This app has a single route, "posts", that fetches a bunch of posts from a <a href="https://www.mongodb.org/" target="_blank">MongoDB</a> database and sends those posts whenever it receives a GET request.

The posts route requires a <a href="http://mongoosejs.com/docs/schematypes.html" target="_blank">Mongoose model</a> as a dependency:

#### routes/posts.js

<pre><code class="language-javascript line-numbers">const route = require('express').Route();

module.exports = function(services) {
  const PostModel = services.PostModel;

  // Add route handlers as properties on the
  // route object so that they can be tested
  route.handlers = {};

  // Handler for GET /posts
  route.handlers.get((req, res) => {

    // Find all Post models in our database
    PostModel.find({}, (error, posts) => {
      if(error) throw error;

      // Respond with the collection of posts
      res.send({ posts });
    });
  });

  // Hookup handlers to our route
  route.get('/', route.handlers.get);

  // Return our route object
  return route;
};</code></pre>

Here's the test for the posts route:

#### test/routes/posts-test.js

<pre><code class="language-javascript line-numbers">import test from 'ava';

test('Route | Posts | it responds with an array of posts', t => {
  // Plan for one assertion
  t.plan(1);

  // Stub of posts
  const postsStub = [{
    title: 'A post'
  }];

  // Mock of our database model
  const PostModel = {
    find(opts, cb) {
      // Invoke passed callback and pass it
      // our posts stub (the first parameter here, 'false',
      // indicates that no errors occurred while
      // fetching our models)
      cb(false, postsStub);
    }
  };

  // The module under test
  const postsRoute = require('../../routes/posts')({ PostModel });

  // Mock request object
  const req = {};

  // Mock response object.
  // This is where our assertion happens.
  const res = {
    send(actual) {
      // Assert that the object passed to res.send() is the
      // fake post data that we passed to our mock DB model
      t.same(actual, postsStub);
    }
  };

  // Invoke the handler that we want to test
  postsRoute.handlers.get(req, res);
});
</code></pre>

In our main app file (usually app.js for an Express app), we can hook up our routes as we normally would, and pass real objects to our route instead of mocks:

#### app.js

<pre><code class="language-javascript line-numbers">const app = require('express')();

const mongoose = require('mongoose');
const PostModel = require('./models/Post');
const postsRoute = require('./routes/posts')({ PostModel });

// Connect to DB for reals
mongoose.connect('mongodb://localhost/test');

// Hook up our routes
app.use('/posts', postsRoute);

module.exports = app;</code></pre>

Squeaky clean route, and a squeaky clean test. Beautiful.

## Final Thoughts

I have been using this approach a lot recently, and I really quite like it. My code is more modular, and I'm able to test my code in truly isolated units. If you'd like to see a real API built with a core/shell architecture, you can do that <a href="https://github.com/restlessbit/scientia-api" target="_blank">here</a>.

If you have any feedback or comments that you would like to send my way, please feel free to shout at me on Twitter <a href="https://twitter.com/restlessbit" target="_blank">@restlessbit</a>.

Happy testing.
