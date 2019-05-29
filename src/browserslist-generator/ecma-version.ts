export type EcmaVersion = "es3" | "es5" | "es2015" | "es2016" | "es2017" | "es2018" | "es2019" | "es2020";

export const ES5_FEATURES: string[] = ["es5"];

export const ES2015_FEATURES: string[] = [
	"es6-class",
	"const",
	"let",
	"arrow-functions",
	"rest-parameters",
	"template-literals",
	"javascript.operators.destructuring",
	"javascript.operators.spread.spread_in_arrays",
	"javascript.functions.default_parameters",
	"javascript.builtins.RegExp.sticky",
	"javascript.operators.object_initializer.shorthand_property_names",
	"javascript.operators.object_initializer.computed_property_names",
	"javascript.operators.object_initializer.shorthand_method_names"
];

export const ES2016_FEATURES: string[] = ["javascript.operators.arithmetic.exponentiation", "javascript.builtins.Array.includes"];

export const ES2017_FEATURES: string[] = [
	"async-functions",
	"javascript.builtins.Object.values",
	"javascript.builtins.Object.entries",
	"javascript.builtins.Object.getOwnPropertyDescriptors",
	"javascript.builtins.String.padStart",
	"javascript.builtins.String.padEnd"
];

export const ES2018_FEATURES: string[] = ["javascript.operators.spread.spread_in_object_literals", "javascript.builtins.Promise.finally"];

export const ES2019_FEATURES: string[] = [
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

export const ES2020_FEATURES: string[] = ["javascript.builtins.String.matchAll"];
