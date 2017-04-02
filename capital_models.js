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
		adultAge: 16,
		menopause: 55,
		lifeExpectancy: 75,
		chanceOfConception: 10,
		chanceOfDeath: 0.1,
		babyFood: 0.5
	},
	computed: {
		averageAge: function() {
			return _.meanBy(this.population, 'age');
		},
		averageWealth: function() {
			return _.meanBy(this.population, 'wallet');
		},
		LabourPowerTotal: function() {
			return _.sumBy(this.population, 'LabourPowerIndividual');
		},
		LabourPowerSocAvgUnit: function() { // value of commodity
			return _.meanBy(this.population, 'LabourPowerIndividual');
		},
		populationOrdered: function() {
			return _.orderBy(this.population, ['wallet'], ['desc']);
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
			this.day++;

			_.forEach(Society.population, function(person) {
				person.live();
			});

			// if(_.random(0,100) < 0.00001) {
			// 	this.catastrophe();
			// }
		},
		catastrophe: function() {
			console.log("We're all gonna die!")
			_(this.population).each(function(pop) {
				if(_.random(0,100) < _.random(0,100)) {
					pop.die(_.sample([
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
			health: 100,
			hunger: 0,
			wallet: 0,
			generation: 0,
			offspring: [],
			isHighlighted: false,
			firstname: _.sample(firstnames),
			lastname: _.sample(lastnames),
			LabourPowerIndividual: Society.LabourPowerSocAvgUnit * _.random(0.75,1.25) || 1 // fraction of commodity (1)
		};
	},
	computed: {
		name: function() { return this.firstname+" "+this.lastname; },
		hoursWorked: function() {
			return Society.LabourPowerSocAvgUnit / this.LabourPowerIndividual
		}
	},
	methods: {
		produce: function() {
			// # Incentive to beat the competition to market
			if(this.age >= Society.adultAge) {
				this.wallet += this.LabourPowerIndividual;
				Society.commodities += this.LabourPowerIndividual * this.hoursWorked;
				this.hunger += this.hoursWorked;
			} else {
				this.hunger += Society.babyFood; // Baby stomach
			}
		},
		consume: function () {
			if(this.age >= Society.adultAge) {
				var foodRequired = this.hunger;
			} else {
				var foodRequired = Society.babyFood;
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

			if(this.age >= Society.adultAge && _.random(0,100) < 0.05) { // Eureka!
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
				(Society.commodities/Society.population.length) >= Society.adultAge
				&& Society.population.length >= 2
				&& this.age >= (Society.adultAge * _.random(0.8,1.2))
				&& this.age < (Society.menopause * _.random(0.8,1.2))
			) {
				if(_.random(0,100) < Society.chanceOfConception) {
					var x = new Human();
					x.generation = this.generation + 1;
					// if(x.generation > 3 && _.random(0,100) < 50) {
						x.lastname = this.lastname;
					// }
					x.wallet = Society.babyFood * Society.adultAge; // Stipend so they can get food til' working age
					this.offspring.push(x);
					Society.population.push(x);
					// console.log(this.name+" gave had child no."+this.offspring.length+": "+x.firstname+"! :)")
				}
			}
		},
		die: function(reason) {
			// Inheritance to offspring
			var parent = this;
			var inheritance = parent.wallet / parent.offspring.length;
			if(inheritance > 0) {
				_.forEach(this.offspring, function(child) {
					child.wallet += inheritance;
					console.log(child.name+" received an inheritance of £"+inheritance.toFixed(2)+" from their parent, "+parent.name);
				});
			}

			// Death
			var index = Society.population.indexOf(this);
			if(index != -1) Society.population.splice(index, 1);
			console.log(_.template(reason)(this));
		},
		live: function() {
			// Die chance
			if(_.random(0,100) < Society.chanceOfDeath) {
				this.die("{{name}} died unexpectedly :o");
			} else // Starvation
			if(this.hunger >= 50 && _.random(0,100) < 30) {
				this.die("{{name}} starved of poverty :'(");
			} else // Old age
			if(this.age > Society.lifeExpectancy) {
				if(_.random(0,100) < 10) {
					this.die("{{name}} died naturally at the old age of {{age}}");
				}
			} else {
				this.age++;
				this.produce();
				this.consume();
				this.improve();

				// Reproduce chance
				if( (Society.commodities/Society.population.length) >= Society.adultAge ) {
					this.reproduce();
				}
			}
		}
	}
});

// In the beginning...
for(var i = 1, x = 20; i <= x; i++) {
	var newHuman = new Human();
	newHuman.age = _.random(Society.adultAge, 50);
	Society.population.push(newHuman);
}
Society.commodities = Society.averageAge * Society.adultAge;
