---
layout: post
title: "Python for JavaScript Developers"
date: 2016-11-01
---

*Special thanks to [Brett Langdon](https://twitter.com/brett_langdon) for peer reviewing* 😁

So recently I began working at a little startup in New York City by the name of
[Underdog.io](https://underdog.io), where I discovered that they had a back-end
written primarily in Python, a language that I had very little previous exposure
to.

While I was hired primarily for my experience with JavaScript and React, the
small size of our team means that I frequently have to delve into all parts of
the codebase in order to ship a feature. So I had to get well
acquainted with Python, very fast.

Unfortunately, I had a hard time finding good resources for learning Python that
weren't targeted to people who haven't programmed before. I already knew how to
program and am familiar with other languages, I just needed to learn the syntax
and paradigms of this one specific programming language, Python.

That's where this blog post comes in. To serve as a quick guide for JavaScript
developers who want to get up to speed quickly with Python, but without having
to learn what declaring a variable means or what a function is.

This post is assuming you are using **[Python 3.0.1](https://www.python.org/download/releases/3.0.1/)**, so some of the
examples might not work with older versions of Python.

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

You can change the type of a variable by assigning a value of a different type
to it:

```python
x = 5 # x has a type of Integer
x = 'Hewwo' # x is now a String!
```

Unlike JavaScript, variables in Python are always block scoped.

### Blocks

Python is a bit more strict than JavaScript when it comes to syntax. In Python,
getting indentation off by a single space can prevent your programming from
even running (!). This is because Python uses indentation to create blocks
instead of braces. For example, this is how you would define a block in
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

```python
def example_function():
  x = 5

  # IndentationError!
    print(x)
```

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

Because `print(x)` is in a block that is out of scope of the one that `x` is
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
while x > 0:
  print('hey now')
```

#### for loop

For loops are like JavaScript `foreach` loops:

```python
ex_list = [1, 2, 3]

for x in ex_list:
  print(x)
```

## Types

Python's type system is a lot like JavaScript's; it's there, but it's not as
strict as in other languages like Java or C#.

Practically speaking, variables
have types, but you don't have to declare the types of your variables like you
would in a statically typed language such as Java.

Here's a quick overview of Python's built in data types:

### [Numbers](https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex)

Unlike JavaScript, Python has more than one number type:

- Integers: `1`, `2`, `3`
- Floats: `4.20`, `4e420`
- Complex numbers: `4 + 20j`
- Booleans: `True`, `False`

You can perform the same operations on numbers in Python as you can in
JavaScript. There's also an exponentiation operator (\*\*):

```python
# a = 4
a = 2 ** 2
```

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

# 1, 2, 3
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

# M
print(name[0])

# Nope, name is still 'Mario'
name[0] = 'W'
```

### [Dictionaries](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)

Dictionaries are associative arrays, similar to objects in JavaScript. In fact,
dictionaries can be declared with a JSON-like syntax:

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
# Because `gender` is not defined, non-binary will be returned
person.get('gender', 'non-binary')
```

### [None](https://docs.python.org/3/library/constants.html#None)

`None` is equivalent to `null` in JavaScript. It signifies the absence of a
value, and is considered "falsy".

```python
x = None

if not x:
  print('x is falsy!')
```

## Functions

Like JavaScript, functions are objects in Python. That means you can pass
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

Modules in Python aren't that far off from modules in ES6.

### Defining a module

A module in Python is simply a file that contains some Python code.

```python
# my_module.py
hey = 'heyyy'

def say_hey():
  print(hey)
```

Unlike JavaScript, you don't have to declare what is being exported; everything
is exported by default.

### Importing a module

You can import an entire module in Python:

```python
# importing my_module.py from another_module.py; both files are in the same
# directory
import my_module

# Do things
my_module.say_hey()
print(my_module.hey)
```

Or import individual items from a module:

```python
# another_module.py
from my_module import hey, say_hey

# Do things
say_hey()
print(hey)
```

You can also install modules other people have written with
[pip](https://pypi.python.org/pypi/pip), a package manager for Python.

```bash
pip install simplejson
```

## Object Oriented Programming

Python has support for object oriented programming with classes and classical
inheritance, unlike JavaScript which has prototypes with prototypal inheritance.

### [Classes](https://docs.python.org/3/tutorial/classes.html#classes)

```python
# Defining a class
class Animal:
  # Variable that is shared by all instances of the Animal class
  default_age = 1

  # Constructor
  def __init__(self, name):
    # Defining a publicly available variable
    self.name = name

    # You can define private variables and methods by prepending the variable
    # name with 2 underscores (__):
    self.__age = default_age

  # Public method
  def get_age(self):
    return self.__age

  # Private method
  def __meow():
    print('meowwww')

  # Defining a static method with the `staticmethod` decorator
  @staticmethod
  def moo():
    print('moooo')

# Creating an Animal object
animal = Animal()

# Accessing public variables and methods
print(animal.name)
print(animal.default_age)
print(animal.get_age())

# Accessing a static method
Animal.moo()

# ERR!!!! .__age is private, so this won't work:
print(animal.__age)
```

### [Inheritance](https://docs.python.org/3/tutorial/classes.html#inheritance)

Classes can inherit from other classes:

```python
# Inheriting from the Animal class
class Human(Animal):
  def __init__(self, name, ssn):
    # Must call the __init__ method of the base class
    super().__init__(name)
    self.__ssn = ssn

  def get_ssn(self):
    return self.__ssn

# Using the Human class
human = Human('Mario', 123456789)

# Human objects have access to methods defined in the Animal base class
human.get_age()
human.get_ssn()
```

## Resources

There is a lot more to Python than what's in this guide. I highly
recommend you check out the [Python docs](https://docs.python.org/3/)
for tutorials and details about other language features.

And remember, the best way to learn a language is to write it, a lot. So get
to coding!

*P.S.: If you need an idea for a project, maybe try creating a simple API with
[Flask](http://flask.pocoo.org/)?*
