# Browserslist Generator
[![NPM version][npm-version-image]][npm-version-url]
[![License-mit][license-mit-image]][license-mit-url]

[license-mit-url]: https://opensource.org/licenses/MIT

[license-mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg

[npm-version-url]: https://www.npmjs.com/package/@wessberg/browserslist-generator

[npm-version-image]: https://badge.fury.io/js/%40wessberg%2Fbrowserslist-generator.svg

## Description

A library that helps with generating a [browserslist](https://github.com/browserslist/browserslist) automatically.
For example, a browserslist can be generated that targets only browsers that support specific required features.

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