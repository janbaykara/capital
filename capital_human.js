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
			ageAdult: Society.lifecycle ? 16 : 0,
			ageInfertility: 55,
			ageElderly: 75,
			chanceOfConception: 5,
			chanceOfRandomDeath: 0,
			hungerThreshold: 100,
			hoursInDay: 24,
			adultFoodAvg: 12,
			babyFoodAvg: 6
		};
	},
	computed: {
		name: function() { return this.firstname+" "+this.lastname; },
		hoursWorked: function() {
			if(Society.equalHours) {
				return this.hoursInDay;
			} else {
				var foodRequiredPrice = Society.commodityPrice * (this.hunger + this.adultFoodAvg)
				return Math.min(this.hoursInDay, foodRequiredPrice / this.hourlyRelativeProduct); // Now, refer this to food requirements, max time available
			}
		},
		hourlyRelativeProduct: function() {
			return this.LabourPowerIndividual / Society.LabourPowerSocAvgUnit;
		},
		dailyProduct: function() {
			return this.hoursWorked * this.LabourPowerIndividual;
		},
		dailyWage: function() {
			return this.hourlyRelativeProduct * this.hoursWorked;
		}
	},
	methods: {
		produce: function() {
			// # Incentive to beat the competition to market
			if(this.age >= this.ageAdult) {
				this.wallet += this.hourlyRelativeProduct * this.hoursWorked; // Share of today's social wealth (combined congealed labour of society)
				Society.commodities += this.dailyProduct;
				this.hunger += this.adultFoodAvg;
			} else {
				this.hunger += this.babyFoodAvg; // Baby stomach
			}
		},
		consume: function () {
			var foodRequiredPrice = this.hunger * Society.commodityPrice;

			if(Society.commodities >= this.hunger && this.wallet >= foodRequiredPrice) {
				var foodAcquired = this.hunger;
			} else
			if(Society.commodities >= this.wallet && this.wallet > 0) {
				var foodAcquired = (this.wallet/foodRequiredPrice) * this.hunger;
			} else {
				var foodAcquired = 0;
			}

			Society.commodities -= foodAcquired;
			this.hunger -= foodAcquired;
			this.wallet -= foodAcquired * Society.commodityPrice; // # We need to talk in terms of value and exchange-value, not in terms of commodity 'units' (meaningless)
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
			if(!Society.lifecycle) return false;

			if(
				Society.workingPopulation.length >= 2
				&& this.age >= (this.ageAdult * _.random(0.8,1.2))
				&& this.age < (this.ageInfertility * _.random(0.8,1.2))
			) {
				var x = new Human();
				x.generation = this.generation + 1;
				// if(x.generation > 3 && _.random(0,100) < 50) {
					x.lastname = this.lastname;
				// }
				x.wallet = this.babyFoodAvg * (this.ageAdult-1); // Stipend so they can get food til' working age
				this.offspring.push(x);
				Society.population.push(x);
				console.log(this.name+" gave had child no."+this.offspring.length+": "+x.firstname+"! :)")
			}
		},
		die: function(reason) {
			if(!Society.lifecycle) return false;

			// Inheritance to offspring
			if(Society.inheritance) {
				var parent = this;
				var livingChildren = _(parent.offspring).filter('alive').value();
				var inheritance = parent.wallet / livingChildren.length;
				if(inheritance > 0) {
					livingChildren.forEach(function(child) {
						child.wallet += inheritance;
						console.log(child.name+" received an inheritance of £"+inheritance.toFixed(2)+" from their parent, "+parent.name);
					});
				}
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
				if( (Society.commodities/Society.currentPopulation.length) >= this.ageAdult
				&& _.random(0,100) < this.chanceOfConception ) {
					this.reproduce();
				}

				this.age++;
			}
		}
	}
});
