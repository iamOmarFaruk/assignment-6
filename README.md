# JavaScript Basics - FAQ

## 1) What is the difference between var, let, and const?

**var** - Old way, works in function scope. Gets hoisted.
**let** - New way, works in block scope. Can be reassigned.
**const** - Once you set a value, you can't change it. Block scope.

```javascript
var name = "John"; // function scope
let age = 25;      // block scope, changeable
const city = "NYC"; // block scope, unchangeable
```

## 2) What is the difference between map(), forEach(), and filter()?

**map()** - Modifies each element and returns a new array.
**forEach()** - Just loops through, doesn't return anything.
**filter()** - Creates a new array with elements that match a condition.

```javascript
const numbers = [1, 2, 3, 4];

numbers.map(x => x * 2);     // [2, 4, 6, 8]
numbers.forEach(x => console.log(x)); // just prints
numbers.filter(x => x > 2);  // [3, 4]
```

## 3) What are arrow functions in ES6?

Arrow functions are a new and shorter way to write functions. You use the `=>` symbol.

```javascript
// Old way
function add(a, b) {
    return a + b;
}

// New way (arrow function)
const add = (a, b) => a + b;
```

## 4) How does destructuring assignment work in ES6?

Destructuring means pulling out values from arrays or objects into separate variables.

```javascript
// Array destructuring
const [first, second] = ["John", "Jane"];

// Object destructuring
const {name, age} = {name: "Mike", age: 30};

console.log(first); // "John"
console.log(name);  // "Mike"
```

## 5) Explain template literals in ES6. How are they different from string concatenation?

Template literals are a new way to write strings using backticks (`). You can embed variables using `${}`.

```javascript
const name = "America";
const year = 1776;

// Old way (string concatenation)
const message1 = "Welcome to " + name + " since " + year;

// New way (template literals)
const message2 = `Welcome to ${name} since ${year}`;
```

Template literals also let you write multiline strings easily!
