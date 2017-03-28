var Society = new Vue({
	el: '#society',
	data: {
		population: [],
		commodities: 0,
		day: 0
	},
	computed: {
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
		}, 500)
	},
	methods: {
		newDay: function() {
			this.day++;

			_.forEach(Society.population, function(person) {
				person.live();
			});
		}
	}
});

var Worker = Vue.extend({
	data: function() {
		return {
			firstname: _.sample(firstnames),
			lastname: _.sample(lastnames),
			LabourPowerIndividual: _.random(1,1.5) // fraction of commodity (1)
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
			Society.commodities += this.LabourPowerIndividual * this.hoursWorked;

			// Incentive to beat the competition to market
			// # Needs rationalising
			// # Needs relativising - variable incentive to improve dependent on how much weaker
			// # Needs investivising - variable ability (£ accrued) to improve dependent on how much weaker
			if(this.LabourPowerIndividual < Society.LabourPowerSocAvgUnit) {
				prodIncChance = 10
			} else {
				prodIncChance = 3
			}

			if(_.random(0,100) < 1) {
				prodInc = 1
				console.log(this.name+": \"Eureka!\"")
			} else {
				prodInc = 0.1
			}

			// Random chance of productivity increase
			if(_.random(0,100) < prodIncChance) this.LabourPowerIndividual += prodInc;
		},
		consume: function () {
			// # Needs payment/exchange of social wealth
			Society.commodities -= 1;
		},
		// # Reproduce, based on commodities available, to a limit
		live: function() {
			this.produce();
			this.consume();
		}
	}
});
