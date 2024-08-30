export type EcmaVersion = "es3" | "es5" | "es2015" | "es2016" | "es2017" | "es2018" | "es2019" | "es2020" | "es2021" | "es2022" | "es2023" | "es2024";

export const ES5_FEATURES: string[] = [
	"javascript.builtins.Object.create",
	"javascript.builtins.Object.getPrototypeOf",
	"javascript.builtins.Object.defineProperty",
	"javascript.builtins.Object.defineProperties",
	"javascript.builtins.Object.getOwnPropertyDescriptor",
	"javascript.builtins.Object.getOwnPropertyNames",
	"javascript.builtins.Object.keys",
	"javascript.builtins.Object.preventExtensions",
	"javascript.builtins.Object.isExtensible",
	"javascript.builtins.Object.seal",
	"javascript.builtins.Object.isSealed",
	"javascript.builtins.Object.freeze",
	"javascript.builtins.Object.isFrozen",
	"javascript.builtins.Function.bind",
	"javascript.builtins.String.trim",
	"javascript.builtins.Array.isArray",
	"javascript.builtins.Array.every",
	"javascript.builtins.Array.filter",
	"javascript.builtins.Array.forEach",
	"javascript.builtins.Array.indexOf",
	"javascript.builtins.Array.lastIndexOf",
	"javascript.builtins.Array.map",
	"javascript.builtins.Array.reduce",
	"javascript.builtins.Array.some",
	"javascript.builtins.JSON.parse",
	"javascript.builtins.JSON.stringify",
	"javascript.builtins.Date.now",
	"javascript.builtins.Date.toISOString"
];

export const ES2015_FEATURES: string[] = [
	...ES5_FEATURES,
	"javascript.classes",
	"javascript.statements.const",
	"javascript.statements.let",
	"javascript.functions.arrow_functions",
	"javascript.functions.rest_parameters",
	"javascript.grammar.template_literals",
	"javascript.operators.destructuring",
	"javascript.operators.spread.spread_in_arrays",
	"javascript.functions.default_parameters",
	"javascript.builtins.RegExp.sticky",
	"javascript.operators.object_initializer.shorthand_property_names",
	"javascript.operators.object_initializer.computed_property_names",
	"javascript.operators.object_initializer.shorthand_method_names"
];

export const ES2016_FEATURES: string[] = [...ES2015_FEATURES, "javascript.operators.exponentiation", "javascript.builtins.Array.includes"];

export const ES2017_FEATURES: string[] = [
	...ES2016_FEATURES,
	"javascript.builtins.AsyncFunction",
	"javascript.builtins.Object.values",
	"javascript.builtins.Object.entries",
	"javascript.builtins.Object.getOwnPropertyDescriptors",
	"javascript.builtins.String.padStart",
	"javascript.builtins.String.padEnd"
];

export const ES2018_FEATURES: string[] = [...ES2017_FEATURES, "javascript.operators.spread.spread_in_object_literals", "javascript.builtins.Promise.finally"];

export const ES2019_FEATURES: string[] = [
	...ES2018_FEATURES,
	"javascript.builtins.Array.flat",
	"javascript.builtins.Array.flatMap",
	"javascript.builtins.Object.fromEntries",
	"javascript.builtins.String.trimStart",
	"javascript.builtins.String.trimEnd",
	"javascript.builtins.JSON.json_superset",
	"javascript.builtins.JSON.stringify.well_formed_stringify",
	"javascript.builtins.Symbol.description",
	"javascript.statements.try_catch.optional_catch_binding"
];

export const ES2020_FEATURES: string[] = [...ES2019_FEATURES, "javascript.builtins.String.matchAll"];

export const ES2021_FEATURES: string[] = [
	...ES2020_FEATURES,
	"javascript.operators.logical_or_assignment",
	"javascript.operators.nullish_coalescing_assignment",
	"javascript.operators.logical_and_assignment",
	"javascript.builtins.String.replaceAll",
	"javascript.grammar.numeric_separators",
	"javascript.builtins.Promise.any"
];

export const ES2022_FEATURES: string[] = [
	...ES2021_FEATURES,
	"javascript.builtins.Array.at",
	"javascript.builtins.String.matchAll",
	"javascript.classes.public_class_fields",
	"javascript.classes.private_class_fields",
	"javascript.classes.private_class_fields_in",
	"javascript.classes.static_class_fields",
	"javascript.operators.await.top_level",
	"javascript.builtins.RegExp.hasIndices"
];

export const ES2023_FEATURES: string[] = [
	...ES2022_FEATURES,
	"javascript.builtins.Array.findLast",
	"javascript.builtins.Array.findLastIndex",
	"javascript.grammar.hashbang_comments",
	"javascript.builtins.WeakMap.symbol_as_keys",
	"javascript.builtins.Array.toReversed",
	"javascript.builtins.Array.toSorted",
	"javascript.builtins.Array.toSpliced",
	"javascript.builtins.Array.with"
];

export const ES2024_FEATURES: string[] = [
	...ES2023_FEATURES,
	"javascript.builtins.String.isWellFormed",
	"javascript.builtins.String.toWellFormed",
	"javascript.builtins.Atomics.waitAsync",
	"javascript.builtins.ArrayBuffer.resize",
	"javascript.builtins.Object.groupBy",
	"javascript.builtins.Map.groupBy",
	"javascript.builtins.Promise.withResolvers",
	"javascript.builtins.ArrayBuffer.transfer"
];
