#!/usr/bin/env node

const Benchmark = require("benchmark");

const deepDiff = require("deep-diff");
const deepObjectDiff = require("deep-object-diff").diff;
const diff = require("diff").diffJson;
const jsonPatchPlus = require("@n1ru4l/json-patch-plus").diff;
const jsondiffpatch = require("jsondiffpatch").diff;
const microdiff = require("microdiff").default;
const symmetry = require("symmetry").createPatch;

let left, right;
function test(name, setup) {
  console.log(`Benchmark: ${name}`);
  setup();

  const suite = Benchmark.Suite(name, {
    onCycle: (ev) => {
      if (ev.target.error) return;
      const { length } = Buffer.from(JSON.stringify(ev.target.fn()));
      console.log(`- ${ev.target} (${length} bytes)`);
    },
    onError: (ev) => {
      console.error(ev.target.error);
    },
  })
    .add("@n1ru4l/json-patch-plus", () => jsonPatchPlus({ left, right }))
    .add("deep-diff", () => deepDiff(left, right))
    .add("deep-object-diff", () => deepObjectDiff(left, right))
    .add("diff", () => diff(left, right))
    .add("jsondiffpatch", () => jsondiffpatch(left, right))
    .add("microdiff", () => microdiff(left, right))
    .add("symmetry", () => symmetry(left, right))
    .run();

  console.log("");
}

test("Small object (baseline)", () => {
  left = {
    name: "Testing",
    propertyTwo: "Still testing...",
  };
  right = {
    name: "TestingChanged",
    propertyThree: "Still testing...",
  };
});

test("Large Object (300 properties)", () => {
  const characters = "abcdefghijklmnopqrstuvwxyz1234567890".split("");

  left = {};
  let i = 0;
  while (i < 300) {
    let randomString = "";
    for (let characterCount = 0; characterCount < 5; characterCount++) {
      randomString += characters[Math.round(Math.random() * characters.length)];
    }
    if (!left[randomString]) {
      left[randomString] = Math.random() * 100;
      i++;
    }
  }

  right = {};
  for (let randomProperty in left) {
    if (Math.random() > 0.95) {
      right[randomProperty] = Math.random() * 100;
    } else if (!Math.random() < 0.975) {
      right[randomProperty] = left[randomProperty];
    }
  }
});
