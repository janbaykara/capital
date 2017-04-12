var Human = Vue.extend({
	data: function() {
		return {
			// UI
			isHighlighted: false,
			// static lifetime
			generation: 0,
			firstname: _.sample(firstnames),
			lastname: _.sample(lastnames),
			DNA: Array(20+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 20),
			// dynamic lifetime
			alive: true,
			age: 0,
			hunger: 0,
			savings: 0,
			offspring: [],
			productivityIndividual: Society.day > 1 ? Society.productivityAvg * _.random(1,1.25) : _.random(1,1.25),
			// Human nature
			agePuberty: Society.lifecycle ? 16 : 0,
			ageInfertility: 55,
			ageLimit: 75,
			chanceOfConception: 5,
			chanceOfRandomDeath: 0,
			hungerThreshold: 100,
			hoursInDay: 24,
			adultFoodAvg: 5,
			babyFoodAvg: 2.5
		};
	},
	computed: {
		name: function() { return this.firstname+" "+this.lastname; },
		hoursWorked: function() {
			if(!this.workingAge) return 0;
			if(Society.equalHours) return this.hoursInDay;

			var foodMoneyRequired = (this.hunger + this.dailyFoodRequired) * Society.productivityAvg;
			return Math.min(Society.hoursWorkMax, Math.max(Society.hoursWorkMin, foodMoneyRequired / this.hourlyRelativeProduct ) );
		},
		hourlyRelativeProduct: function() {
			return this.productivityIndividual / Society.productivityAvg;
		},
		dailyProduct: function() {
			return this.hoursWorked * this.productivityIndividual;
		},
		dailyFoodRequired: function() {
			return this.age < this.agePuberty ? this.babyFoodAvg : this.adultFoodAvg
		},
		workingAge: function() {
			return Society.ageWorkMax >= this.age && this.age >= Society.ageWorkMin;
		}
	},
	methods: {
		produce: function() {
			if(this.workingAge) {
				Society.commodityStock += this.dailyProduct;
				this.savings += this.hourlyRelativeProduct * this.hoursWorked; // Share of today's social wealth (combined congealed labour of society)
			}

			this.hunger += this.dailyFoodRequired;
		},
		consume: function () {
			var foodAvailable = Math.max(0, Society.commodityStock);
			var foodWanted = Math.min(this.hunger, foodAvailable);
			var foodAffordable = this.workingAge ? this.savings / Society.productivityAvg : foodWanted // Kids and pensioners don't pay for food
			var foodToBuy = Math.min(foodAffordable, foodWanted)

			Society.commodityStock -= foodToBuy;
			this.hunger -= foodToBuy;
			if(this.workingAge) this.savings -= foodToBuy * Society.productivityAvg;
		},
		improve: function() {
			// # Overproducers should be able to improve easier (£ investment)
			prodIncChance = (Math.pow(Society.productivityAvg,1.5) / this.productivityIndividual) * 10
			// prodIncChance *= this.wage/10;

			if(this.workingAge && _.random(0,100) < 0.05) { // Eureka!
				prodInc = 0.1
				// console.log(this.name+": \"Eureka!\"")
			} else {
				prodInc = 0.01
			}

			// Random chance of productivity increase
			if(_.random(0,100) < prodIncChance) this.productivityIndividual += prodInc;
		},
		// # Reproduce, based on commodities available, to a limit
		reproduce: function() {
			if(!Society.lifecycle) return false;

			if(
				Society.workingPopulation.length >= 2
				&& this.age >= (this.agePuberty * _.random(0.8,1.2))
				&& this.age < (this.ageInfertility * _.random(0.8,1.2))
			) {
				var x = new Human();
				x.generation = this.generation + 1;
				x.lastname = this.lastname;
				this.offspring.push(x.DNA);
				Society.population.push(x);
				console.log(this.name+" had child no."+this.offspring.length+": "+x.firstname+"! :)")
			}
		},
		die: function(reason) {
			if(!Society.lifecycle) return false;

			// Death
			this.alive = false;
			console.log(_.template(reason)(this));

			// Inheritance to offspring
			var parent = this;
			if(Society.inheritance && Society.banking && this.savings > 0.01) {
				var livingChildren = _(parent.offspring).map(function(childDNA) {
					return _.find(Society.currentPopulation, ['DNA', childDNA]);
				}).value().filter(String);
				var inheritance = parent.savings / livingChildren.length;
				if(inheritance > 0) {
					livingChildren.forEach(function(child) {
						child.savings += inheritance;
						console.log(child.name+" received an inheritance of £"+inheritance.toFixed(2)+" from their parent, "+parent.name);
					});
				}
			}
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
			if(this.age > this.ageLimit * _.random(0.8,1.35)) {
				if(_.random(0,100) < 10) {
					this.die("{{name}} died naturally at the old age of {{age}}");
				}
			} else {
				this.produce();
				this.consume();
				this.improve();

				// Reproduce chance
				if( Society.lifecycle
				&& (Society.commodityStock/Society.currentPopulation.length) >= this.agePuberty
				&& _.random(0,100) < this.chanceOfConception ) {
					this.reproduce();
				}

				if(!Society.banking) this.savings = 0;

				this.age++;
			}
		}
	}
});
