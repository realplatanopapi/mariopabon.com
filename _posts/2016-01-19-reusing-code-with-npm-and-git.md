---
layout: post
title:  "Reusing code with npm and Git"
date:   2016-01-19
---

Have you ever wanted to share code between your projects, but didn’t want to deal with publishing it to npm? It turns out that if you properly setup a repository to work with npm, you can require that repo in your package.json file as a dependency.

#### Requiring a Git repo as a repository in package.json

```json
{
  "dependencies": {
    "custompackage": "git://url-to-repo.com/user/repo.git"
  }
}
```

Or, if your repo is on GitHub, you can use this shortcut:

```json
{
  "dependencies": {
    "custompackage": "githubname/reponame"
  }
}
```


Check out the <a href="https://docs.npmjs.com/cli/install" target="_blank">npm docs</a> for more info on installing packages from sources other than npm.

Of course, this won’t work with any old repo. You’re first going to have to properly configure a package.json so that your repo can be installed as an npm package.

## Preparing the repo that you want to share

Preparing a repo to work with npm is as simple as creating a package.json file and setting the private and name properties:

#### package.json for a private package

```json
{
  “private”: true,
  “name”: “custompackage”
}
```

If you’re making a JavaScript library, you probably want to make it so that you can require or import your library with CommonJS or ES6 modules. If so, set the “main” property of package.json:

#### Specifying the main file for CommonJS or ES6 modules

```json
{
  “main”: “filename.js”
}
```

Just make sure that whatever file you specify is actually exporting something. Then, you can require/import your package as you would any other npm dependency.

## Using a private package in another project

First, install your private package with npm:

```bash
$ npm install -S git://url-to-repo.com/user/repo.git
```

Now your entire repo will be available in your node_modules directory as an npm package, under the name you configured in the package’s package.json file.

If you created a package to be used with a JavaScript module system like CommonJS or ES6 modules, you can require your package with the package’s name:

#### CommonJS

```jsx
const aFunction = require(‘custompackage’);
aFunction(); // yay
```

#### ES6 Modules

```jsx
import aFunction from ‘custompackage’;
aFunction(); // more yay
```

Slick, right?
