# :package: :sparkles: Everytask

<p>
  <a href="http://badge.fury.io/js/everytask"><img src="https://badge.fury.io/js/everytask.svg" alt="npm version"></a>
  <a href="https://github.com/iliasbhal/everytask/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Everytask is released under the MIT license." />
  </a>
</p>


The API for sheduling tasks with the event loop is very counter intuitive.
It's sometimes hard to choose between `Promise.resolve().then()`, `setTimeout()` and `queueMicrotask()`.
Don't get me started with the differences between **node**  and the **browser**.

This library aims to provide a clear isomorphic API to schdelule tasks without having to deal with all the nuances.

## Installation
```bash
yarn add everytask
```

## Usage
```ts
import * as tasks from 'everytask';

tasks.task(() => console.log('called fourth'));
tasks.microtask(() => console.log('called third'));
tasks.macrotask(() => console.log('called second'));
tasks.synchonouse(() => console.log('called first'));
```

## Tests
The package is 100% tested on node as well as on safari, firefox and chrome ( using [jest](https://github.com/facebook/jest) the awesome [playwright](https://github.com/microsoft/playwright) package ).

In order to reproduce the tests type the command below:
```
yarn build & yarn test
```

## Credit
- This package is heavility inspired from the HTTP 204 video below. While writing the package *I found out that there where some errors in the video that are fixed in this package.* 
(Source: https://www.youtube.com/watch?v=8eHInw9_U8k)
