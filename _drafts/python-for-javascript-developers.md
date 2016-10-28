---
layout: post
title: "Python for JavaScript Developers"
---

So recently I began working at a little startup in New York City called
[Underdog.io](https://underdog.io), where I discovered that they had a back-end
written primarily in Python, a language that I had very little previous exposure
to.

While I was hired primarily for my experience with JavaScript and React, the
small size of our team means that I frequently have to delve into all parts of
the codebase in order to ship a feature. This meant that I had to get well
acquainted with Python, very fast.

Unfortunately, I had a hard time finding good resources for learning Python that
wasn't targeted to people who haven't programmed before. I already knew how to
program and am familiar with other languages, I just needed to learn the syntax
and paradigms of this one specific programming language, Python.

That's where this blog post comes in. To serve as a quick guide for JavaScript
developers who want to get up to speed quickly with Python, but without having
to learn what declaring a variable means or what a function is.

## Table of contents

- [Syntax](#syntax)
- [Types](#types)
- [Functions](#functions)
- [Collections](#collections)
- [Modules](#modules)
- [Object Oriented Programming](#object-oriented-programming)
- [Resources](#resources)

## Syntax

### Declaring variables

Declaring a variable in Python is super simple. Like JavaScript, you don't have
to set the type of the variable when declaring it. And you don't have to declare
the scope of the variable either (`let` vs `var`):

```python
x = 5
```

You can change the type of a variable by assigning a value of a different type:

```python
x = 5 # x has a type of Integer
x = 'Hewwo' # Now x is a String!
```

Unlike JavScript, variables in Python are block scoped rather than function
scoped.

### Blocks

Python is a bit more strict than JavaScript when it comes to syntax. In Python,
getting indentation off by a single space will prevent your programming from
even running (!). This is because Python uses indentation to create blocks
rather than braces. For example, this is how you would define a block in
JavaScript vs. Python:

### Creating a block in JavaScript

{:.line-numbers}
```javascript
function exampleFunction () {
  // This is a block
  var a = 5;
}

{
  // This is also a block
}

console.log(a);
```

### Creating a block in Python

{:.line-numbers}
```python
# This is a block with its own scope

def example_function():
  # This is also a block with its own scope
  x = 5
  print(x)
```

If the line containing `print(x)` had one or more extra spaces, the Python
interpreter would throw an `IndentationError`, because those extra spaces would
have created an invalid block.

If that same line had one or more less spaces in it, like this:

```python
def example_function():
  x = 5
 print(x)
```

The Python interpreter would throw this error:

```bash
NameError: name 'x' is not defined
```

Because `print(x)` is not in the same block as the one that `x` is
declared in.

## Types

## Functions

## Collections

## Modules

## Object Oriented Programming

## Resources
