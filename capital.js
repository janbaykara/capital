/*
#Ideas: politics?
- Inheritance tax
- Income tax
- Working age laws (lower,upper)
- Fiscal laws (redistribution of food/commodities?)
- Minimum/maximum wage or prices?
- Healthcare policies?
- Education policies?
- Food/care/pension for babies and old people?

# Ideas: diversify goods?

# Ideas: institutions
- Political groups
- Families
- Genders
*/

// In the beginning...
for(var i = 1, x = 20; i <= x; i++) {
	var thisBaby = new Human();
	thisBaby.age = _.random(0, thisBaby.ageElderly);
	Society.population.push(thisBaby);
	Society.commodities = Society.averageAge * thisBaby.ageAdult;
}
