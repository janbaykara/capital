_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

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

var Society = new Vue({
	el: '#society',
	data: {
		population: [],
		commodities: 0,
		day: 0,
		chanceOfCatastrophe: 0,
	},
	computed: {
		currentPopulation: function() {
			return _(this.population).filter('alive').orderBy(['wallet'], ['desc']).value();
		},
		averageAge: function() {
			return _.meanBy(this.currentPopulation, 'age');
		},
		averageWealth: function() {
			return _.meanBy(this.currentPopulation, 'wallet');
		},
		LabourPowerTotal: function() {
			return _.sumBy(this.currentPopulation, 'LabourPowerIndividual');
		},
		LabourPowerSocAvgUnit: function() { // value of commodity
			return _.meanBy(this.currentPopulation, 'LabourPowerIndividual');
		}
	},
	created: function() {
		// And everyday after...
		setInterval(function() {
			Society.newDay();
		}, 200);
	},
	methods: {
		newDay: function() {
			Society.day++;

			Society.currentPopulation.forEach(function(person) {
				person.live();
			});

			if(_.random(0,100) < Society.chanceOfCatastrophe) {
				Society.catastrophe();
			}
		},
		catastrophe: function() {
			console.log("We're all gonna die!")
			Society.currentPopulation.forEach(function(person) {
				if(_.random(0,100) < _.random(0,100)) {
					person.die(_.sample([
						'{{name}} was killed by a terrible earthquake! D:',
						'{{name}} was killed by deadly Zika virus! D:',
						'{{name}} was killed by a deadly killer bees! D:',
						'{{name}} drowned in a flood of frogs! D:',
						'{{name}} was eaten by a swarm of locusts! D:',
					]));
				}
			})
		}
	}
});

var Human = Vue.extend({
	data: function() {
		return {
			age: 0,
			alive: true,
			hunger: 0,
			wallet: 0,
			generation: 0,
			offspring: [],
			isHighlighted: false,
			firstname: _.sample(firstnames),
			lastname: _.sample(lastnames),
			LabourPowerIndividual: Society.LabourPowerSocAvgUnit * _.random(0.75,1.25) || 1,
			ageAdult: 16,
			ageInfertility: 55,
			ageElderly: 75,
			chanceOfConception: 10,
			chanceOfRandomDeath: 0,
			hungerThreshold: 10,
			babyFood: 0.5
		};
	},
	computed: {
		name: function() { return this.firstname+" "+this.lastname; },
		hoursWorked: function() {
			return Society.LabourPowerSocAvgUnit / this.LabourPowerIndividual;
		}
	},
	methods: {
		produce: function() {
			// # Incentive to beat the competition to market
			if(this.age >= this.ageAdult) {
				this.wallet += this.LabourPowerIndividual;
				Society.commodities += this.LabourPowerIndividual * this.hoursWorked;
				this.hunger += this.hoursWorked;
			} else {
				this.hunger += this.babyFood; // Baby stomach
			}
		},
		consume: function () {
			if(this.age >= this.ageAdult) {
				var foodRequired = this.hunger;
			} else {
				var foodRequired = this.babyFood;
			}

			if(this.wallet >= foodRequired && this.wallet > 0) {
				var foodAcquired = this.hunger;
			} else
			if(this.wallet > 0) {
				var foodAcquired = this.wallet;
			} else {
				var foodAcquired = 0;
			}

			Society.commodities -= foodAcquired;
			this.hunger -= foodAcquired;
			this.wallet -= foodAcquired;
		},
		improve: function() {
			// # Overproducers should be able to improve easier (£ investment)
			prodIncChance = (Math.pow(Society.LabourPowerSocAvgUnit,1.5) / this.LabourPowerIndividual) * 10
			// prodIncChance *= this.wage/10;

			if(this.age >= this.ageAdult && _.random(0,100) < 0.05) { // Eureka!
				prodInc = 0.1
				// console.log(this.name+": \"Eureka!\"")
			} else {
				prodInc = 0.01
			}

			// Random chance of productivity increase
			if(_.random(0,100) < prodIncChance) this.LabourPowerIndividual += prodInc;
		},
		// # Reproduce, based on commodities available, to a limit
		reproduce: function() {
			if(
				(Society.commodities/Society.currentPopulation.length) >= this.ageAdult
				&& Society.currentPopulation.length >= 2
				&& this.age >= (this.ageAdult * _.random(0.8,1.2))
				&& this.age < (this.ageInfertility * _.random(0.8,1.2))
			) {
				if(_.random(0,100) < this.chanceOfConception) {
					var x = new Human();
					x.generation = this.generation + 1;
					// if(x.generation > 3 && _.random(0,100) < 50) {
						x.lastname = this.lastname;
					// }
					x.wallet = this.babyFood * this.ageAdult; // Stipend so they can get food til' working age
					this.offspring.push(x);
					Society.population.push(x);
					console.log(this.name+" gave had child no."+this.offspring.length+": "+x.firstname+"! :)")
				}
			}
		},
		die: function(reason) {
			// Inheritance to offspring
			var parent = this;
			var livingChildren = _(parent.offspring).filter('alive').value();
			var inheritance = parent.wallet / livingChildren.length;
			if(inheritance > 0) {
				livingChildren.forEach(function(child) {
					child.wallet += inheritance;
					console.log(child.name+" received an inheritance of £"+inheritance.toFixed(2)+" from their parent, "+parent.name);
				});
			}

			// Death
			this.alive = false;
			console.log(_.template(reason)(this));
		},
		live: function() {
			if(!this.alive) { return false; } // Just to double check...

			// Die chance
			if(_.random(0,100) < this.chanceOfRandomDeath) {
				this.die("{{name}} died unexpectedly :o");
			} else // Starvation
			if(this.hunger >= this.hungerThreshold && _.random(0,100) < 30) {
				this.die("{{name}} starved of poverty :'(");
			} else // Old age
			if(this.age > this.ageElderly * _.random(0.8,1.35)) {
				if(_.random(0,100) < 10) {
					this.die("{{name}} died naturally at the old age of {{age}}");
				}
			} else {
				this.produce();
				this.consume();
				this.improve();

				// Reproduce chance
				if( (Society.commodities/Society.currentPopulation.length) >= this.ageAdult ) {
					this.reproduce();
				}

				this.age++;
			}
		}
	}
});


// In the beginning...
for(var i = 1, x = 20; i <= x; i++) {
	var thisBaby = new Human();
	thisBaby.age = _.random(thisBaby.ageAdult, 50);
	Society.population.push(thisBaby);
	Society.commodities = Society.averageAge * thisBaby.ageAdult;
}
