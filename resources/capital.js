// In the beginning...
for(var i = 1, x = 20; i <= x; i++) {
	var thisBaby = new Human();
	thisBaby.age = _.random(16, 75);
	Society.population.push(thisBaby);
}
