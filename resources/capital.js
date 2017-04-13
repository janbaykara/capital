importScripts('lodash.js');
importScripts('vue.js');
importScripts('capital_helpers.js');
importScripts('capital_human.js');
importScripts('capital_society.js');

console.log("Populating society...")
for(var i = 1, x = 20; i <= x; i++) {
	var thisBaby = new Human();
	thisBaby.age = _.random(16, 75);
	Society.population.push(thisBaby);
}

Society.clockStart("In the beginning...");
