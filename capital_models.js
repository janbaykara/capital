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
		chanceOfDeath: 0.1
	},
	computed: {
		averageAge: function() {
			return _.meanBy(this.population, 'age');
		},
		LabourPowerTotal: function() {
			return _.sumBy(this.population, 'LabourPowerIndividual');
		},
		LabourPowerSocAvgUnit: function() { // value of commodity
			return _.meanBy(this.population, 'LabourPowerIndividual');
		},
		populationOrdered: function() {
			return _.orderBy(this.population, ['LabourPowerIndividual'], ['desc']);
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
		},
		// catastrophe: function() {
		// 	if(_.random(0,100) < 0.0001) {
		// 		_.(this.population).each(function(pop) {
		// 			if(_.random(0,100) < _.random(0,100)) {
		// 				pop.die();
		// 			}
		// 		})
		// 	}
		// }
	}
});

var Human = Vue.extend({
	data: function() {
		return {
			age: 0,
			generation: 0,
			Noffspring: 0,
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
			// # Separate into produce + sell
			if(this.age >= Society.adultAge) {
				Society.commodities += this.LabourPowerIndividual * this.hoursWorked;
			}
		},
		consume: function () {
			// # Needs payment/exchange of social wealth
			// # Babies should eat less
			// # Poor (i.e. underproducers) should eat less
			Society.commodities -= 1;
		},
		improve: function() {
			// # Underproducers should have more incentive to improve
			// # Overproducers should be able to improve easier (£ investment)
			// # Link to age (older, less likely)
			if(this.LabourPowerIndividual < Society.LabourPowerSocAvgUnit) {
				prodIncChance = 5
			} else {
				prodIncChance = 1
			}

			if(this.age >= Society.adultAge && _.random(0,100) < 0.05) { // Eureka!
				prodInc = 0.1
				console.log(this.name+": \"Eureka!\"")
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
					this.Noffspring++;
					if(x.generation > 3 && _.random(0,100) < 50) {
						x.lastname = this.lastname;
					}
					console.log(this.name+" gave had child no."+this.Noffspring+": "+x.firstname+"! :)")
					Society.population.push(x);
				}
			}
		},
		die: function() {
			var index = Society.population.indexOf(this);
			if(index != -1) Society.population.splice(index, 1);
		},
		live: function() {
			// Die chance
			if(_.random(0,100) < Society.chanceOfDeath) { // Natural causes
				console.log(this.name+" died unexpectedly! :o")
				this.die();
			} else // Starvation
			if(Society.commodities <= 0) {
				if(_.random(0,100) < 10) {
					console.log(this.name+" died of starvation :(")
					this.die();
				}
			} else // Old age
			if(this.age > Society.lifeExpectancy) {
				if(_.random(0,100) < 10) {
					console.log(this.name+" died naturally at the old age of "+this.age)
					this.die();
				}
			} else {
				this.age++;
				this.consume();
				this.produce();
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
for(var i = 1, x = 10; i <= x; i++) {
	var newHuman = new Human();
	newHuman.age = _.random(Society.adultAge, 50);
	Society.population.push(newHuman);
}
Society.commodities = Society.averageAge * Society.adultAge;
