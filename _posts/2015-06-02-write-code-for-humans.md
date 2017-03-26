---
layout: post
title:  "Write Code For Humans"
date:   2015-06-02
---

Humans are not very good at thinking about the long-term. We are always seeking instant gratification, neglecting the fact that the actions we take in the present moment may have long lasting consequences.

This is not helpful when we are trying to create something that is meant to last for a long period of time, say an app or a website. We rush to code without thinking about its structure, and thoughtlessly tack on quick and dirty hacks in order to get what we want sooner rather than later.

This results in a frankenstein of a system comprised of disjointed parts that have no relation to one another. Things are jumbled and interwoven. It’s not clear which part does what. And when you have to make a change to how the thing works, how would you go about doing it?

You end up spending hours attempting to navigate through the shit fest that is poorly thought-out and undocumented code. You make a seemingly minor change in one part of the program, and it inexplicably breaks the entire thing. You apply another fix. More things break. What you thought would take just a few minutes to accomplish is actually a never ending nightmare.

So how can we avoid the aforementioned shit fest? How do we write code that is easy to maintain?

Before we begin to answer this question, I think it will be helpful to first list some properties of maintainable code.

## Maintainable code is

- **<a href="http://en.wikipedia.org/wiki/Don%27t_repeat_yourself" target="_blank">DRY</a>**. It doesn’t repeat itself. If anything needs to be repeated, it is encapsulated in the form of a class, function, mixin, etc.

- **Well documented.** Yeah, writing comments sucks, because it’s time spent not writing code. But you know what sucks even more? Being asked to update code without having a clue as to how any of it works.

- **Sensibly structured.** Everything is where it should be. Looking for the right file to edit should be as easy as consuming pie.

- **Modular.** Updating one thing doesn’t break everything else.

So we know what maintainable code should be like. But how do we go about writing it?

## Writing maintainable code

Here are a few guidelines we can follow that will assist us in creating a codebase that is easy to work with.

### Follow the single responsibility principle

Classes and functions should <a href="http://en.wikipedia.org/wiki/Single_responsibility_principle" target="_blank">do one thing</a>, and one thing only. Changing the behavior of one object should not affect the behavior of another. At the same time, moving a piece of code from one place to another shouldn’t break the code. Keep it flexible. Keep it simple. Keep it DRY.

### Stick to a set of conventions

Pick a system for naming things. Create a file structure that best explains how the thing you are building works. Define a code style. Be consistent.

### Communicate

Leave comments, even if they are only for yourself. If working with others, ask questions when you don’t understand how a bit of code works. Ask why code was written the way it was. Hold code reviews. Talk things out. Have a beer or two.

## Empathy is key

The main thing to keep in mind when writing code is that you, or someone else, will eventually have to come back and update it. So it makes sense to ensure that the code you write is coherent, unambiguous, and consistent.
Be sure to understand that people forget things, and what is immediately obvious to you may not be immediately obvious to others (or even to your future self).

When writing code, try to think about how what you are about to write will appear to someone who is not in your current state of mind. And remember, what you write will eventually have to be maintained by a fellow human being, so let’s write it with them in mind.
