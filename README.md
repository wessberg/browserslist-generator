# Browserslist Generator
[![NPM version][npm-version-image]][npm-version-url]
[![License-mit][license-mit-image]][license-mit-url]

<a href="https://www.patreon.com/bePatron?u=11315442"><img height="30" src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" /></a>

[license-mit-url]: https://opensource.org/licenses/MIT
[license-mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[npm-version-url]: https://www.npmjs.com/package/@wessberg/browserslist-generator
[npm-version-image]: https://badge.fury.io/js/%40wessberg%2Fbrowserslist-generator.svg

## Description

A library that makes it easier to work with [browserslists](https://github.com/browserslist/browserslist).
For example, a browserslist can be generated that targets only browsers that support specific required features.
Or, a browserslist can be generated that target only browsers that *doesn't* support specific features.

## Features

##### `browsersWithSupportForFeatures (...features: string[]): string[]`

Takes any amount of [caniuse](https://caniuse.com/) features and generates a browserslist that targets all browsers that support these features

##### `browsersWithoutSupportForFeatures (...features: string[]): string[]`

Takes any amount of [caniuse](https://caniuse.com/) features and generates a browserslist that targets all browsers that *doesn't* support these features

##### `browserslistSupportsFeatures (browserslist: string[], ...features: string[]): boolean`

Returns true if the given [browserslist](https://github.com/browserslist/browserslist) supports all of the given features

#### `matchBrowserslistOnUserAgent (userAgent: string, browserslist: string[]): boolean`

Will check if the given user agent string matches the given browserslist and return true if so.

#### `userAgentSupportsFeatures (useragent: string, ...features: string[]): boolean`

Checks if the given user agent string supports all of the given [caniuse](https://caniuse.com/) features.

#### `normalizeBrowserslist (browserslist: string[]|string): string[]`

Generates a normalized Browserslist from the given one.

## Installation

`npm install @wessberg/browserslist-generator`

## Usage

```typescript
import {browsersWithSupportForFeatures} from "@wessberg/browserslist-generator";

// Generate a browserslist for browsers that support all of the given features
const browserslist = browsersWithSupportForFeatures(
	"es6-module",
	"shadowdomv1",
	"custom-elementsv1"
);
```

## Backers

[Become a backer](https://www.patreon.com/bePatron?c=1770586) and get your name, logo, and link to your site listed here. Your help is greatly appreciated!