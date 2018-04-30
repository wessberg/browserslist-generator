# Browserslist Generator

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