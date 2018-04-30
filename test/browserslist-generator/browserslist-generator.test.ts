import test from "ava";
import {browsersWithSupportForFeatures} from "../../src/browserslist-generator/browserslist-generator";

test("browsersWithSupportForFeatures() => Will skip 'Android' in the generated browserslist", t => {
	t.true(!browsersWithSupportForFeatures(
		"es6-module",
		"shadowdomv1",
		"custom-elementsv1"
	).some(part => part.includes("android")));
});