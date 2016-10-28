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


### Control flow

`if...else`, `while`, and `for` blocks in Python are very similar to JavaScript:

#### if...else

```python
if x > 2:
  print('hai!')
elif x > 3:
  print('bye!')
else:
  print('hey now')

if not x:
  print('x is falsy!')
```

#### while loop

```python
while (x > 0):
  print('hey now')
```

#### for loop

```python
ex_list = [1, 2, 3]

for x in ex_list:
  print(x)
```

## Types

Python's type system is a lot like JavaScript's; it's there, but it's not as
strict as other languages like Java or C#. Practically speaking, variables have
types, but you don't have to declare the types of your variables like you would
in a statically typed language like Java.

That being said, here's a quick overview of Python's built in data types:

### [Numbers](https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex)

Unlike JavaScript, Python has more than one number type:

- Integers: `1`, `2`, `3`
- Floats: `4.20`, `4e420`
- Complex numbers: `4 + 20j`
- Booleans: `True`, `False`

You can perform the same operations on numbers in Python as you can in
JavaScript, but with the addition of the exponentiation operator (\*\*).

### [Lists](https://docs.python.org/3/library/stdtypes.html#lists)

Lists in Python are similar to arrays in JavaScript. Lists can contain a mixture
of types:

```python
[4, "2", [0, "zero"]]
```

There's also a special syntax for slicing elements from lists:

```python
a_list = [1, 2, 3, 4, 5]

# 1, 2, 3
a_list[0:2]

# 4, 5
a_list[3:]

# 3, 4
a_list[2, -2]
```

And some handy built-in methods for operating on lists:

```python
# 3
len([1, 2, 3])

# 3, 2, 1
[1, 2, 3].reverse()

# a = 1, 2, 3
[1, 2].append(3)
```

You can even concatenate two lists with the `+` operator:

```python
# 1, 2, 3, 4
[1, 2] + [3, 4]
```

### [Strings](https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str)

Strings in Python are a lot like strings in JavaScript. They are immutable, and
individual characters can be accessed like elements in an array:

```python
name = 'Mario'

# a
print(name[1])

# Nope, name is still 'Mario'
name[1] = 'p'
```

### [Dictionaries](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)

Dictionaries are associative arrays, similar to objects in JavaScript. In fact,
dictionaries can be declared with JSON-like synax:

```python
# Dictionaries in python
person = {
  'name': 'Mario',
  'age': 24
}

# Mario
print(person['name'])
```

Dictionaries have a handy method for returning a default value when trying to
get the value of a non-existent key:

```python
# non-binary
person.get('gender', 'non-binary')
```

## Functions

Just like JavaScript, functions are objects in Python. That means you can pass
functions as arguments, or even assign properties to functions:

```python
def func(a, fn):
  print(a)
  fn()

func.x = 'meep'

# 'meep'
print(func.x)

def another_func():
  print('hey')

# 5
# 'hey'
func(5, another_func)
```

## Modules

## Object Oriented Programming

## Resources
