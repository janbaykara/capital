var Society = new Vue({
	el: '#society',
	data: {
		// UI
		table: true,
		graphs: true,
		wholegraph: true,
		// config
		lifecycle: true,
		inheritance: false,
		banking: false,
		equalHours: false,
		catastrophes: false,
		// time
		day: 0,
		clock: null,
		clockTicking: false,
		tickSpeed: 500,
		speedOptions: [1000,500,250,100,10,1],
		// runtime
		population: [],
		commodityStock: 0,
		statistics: {},
		// laws
		ageWorkMin: 16,
		ageWorkMax: 120,
		hoursWorkMin: 0,
		hoursWorkMax: 12
	},
	computed: {
		currentPopulation: function() {
			return _(this.population).filter('alive').orderBy(['productivityIndividual'], ['desc']).value();
		},
		workingPopulation: function() {
			return _(this.currentPopulation).filter((p)=>p.workingAge).value();
		},
		averageOffspring: function() {
			return _.chain(this.population).filter((p)=>p.age >= p.agePuberty).meanBy((p)=>p.offspring.length).value();
		},
		averageAge: function() {
			return _.meanBy(this.currentPopulation, 'age');
		},
		averageWealth: function() {
			return _.meanBy(this.workingPopulation, 'savings');
		},
		averageHunger: function() {
			return _.meanBy(this.workingPopulation, 'hunger');
		},
		dailyHunger: function() {
			return _.sumBy(this.currentPopulation, 'hunger');
		},
		dailyFoodNeeded: function() {
			return this.currentPopulation.length * this.population[0].dailyFoodRequired;
		},
		averageWorkingDay: function() {
			return _.meanBy(this.workingPopulation, 'hoursWorked');
		},
		productivityTotal: function() {
			return _.sumBy(this.workingPopulation, 'productivityIndividual');
		},
		productivityAvg: function() { // value of commodity
			return _.meanBy(this.workingPopulation, 'productivityIndividual');
		},
		sociallyNecessaryLabourTime: function() {
			// i.e. In 1hr, what is the social average number of commodities produced?
			return 1 / this.productivityAvg;
		},
		commodityPrice: function() {
			return this.sociallyNecessaryLabourTime;
		},
		dailyProductTotal: function() {
			return _.sumBy(this.workingPopulation, 'dailyProduct');
		},
		dailyProductAvg: function() {
			return _.meanBy(this.workingPopulation, 'dailyProduct');
		},
		statSets: function() {
			return {
				commodityStock: { value: this.commodityStock, 					floor: 0, ceiling: 0 },
				population: { value: this.population.length, 					floor: 0, ceiling: 0 },
				currentPopulation: { value: this.currentPopulation.length, 		floor: 0, ceiling: 0 },
				workingPopulation: { value: this.workingPopulation.length, 		floor: 0, ceiling: 0 },
				averageOffspring: { value: this.averageOffspring, 				floor: 0, ceiling: 0 },
				averageAge: { value: this.averageAge, 							floor: 0, ceiling: 0 },
				averageWealth: { value: this.averageWealth, 					floor: 0, ceiling: 0 },
				averageHunger: { value: this.averageHunger, 					floor: 0, ceiling: 0 },
				dailyHunger: { value: this.dailyHunger, 						floor: 0, ceiling: 0 },
				dailyFoodNeeded: { value: this.dailyFoodNeeded, 				floor: 0, ceiling: 0 },
				averageWorkingDay: { value: this.averageWorkingDay, 			floor: 0, ceiling: 0 },
				productivityTotal: { value: this.productivityTotal, 			floor: 0, ceiling: 0 },
				productivityAvg: { value: this.productivityAvg, 				floor: 0, ceiling: 0 },
				commodityPrice: { value: this.commodityPrice, 					floor: 0, ceiling: 0 },
				dailyProductTotal: { value: this.dailyProductTotal, 			floor: 0, ceiling: 0 },
				dailyProductAvg: { value: this.dailyProductAvg, 				floor: 0, ceiling: 0 }
			}
		}
	},
	created: function() {
		this.clockStart("In the beginning...");

		window.addEventListener('keypress', function(event) {
			if (event.keyCode == 32) {
				event.preventDefault();
				if(Society.clockTicking)
					Society.clockPause()
				else
					Society.clockStart()
			}
		});
	},
	methods: {
		recordHistory: function() {
			for (var category in this.statSets) {
				if (this.statSets.hasOwnProperty(category) && typeof this.statSets[category].value == 'number' && !isNaN(this.statSets[category].value)) {
					if(!this.statistics[category]) {
						Vue.set(this.statistics, category, []);
						this.statSets[category].name = category;
					}

					this.statistics[category].push(this.statSets[category].value);
					this.statSets[category].floor = Math.min.apply(null, this.wholegraph ? this.statistics[category] : this.statistics[category].slice(-30));
					this.statSets[category].ceiling = Math.max.apply(null, this.wholegraph ? this.statistics[category] : this.statistics[category].slice(-30));
				}
			}
		},
		clockStart: function(message) {
			if(this.clock && this.currentPopulation.length == 0) return false; // Give up already...

			this.clock = setInterval(function() {
				Society.newDay();
			}, this.tickSpeed);
			this.clockTicking = true;
			if(message) console.log("Clock starts at Day "+this.day+": "+message);
		},
		clockPause: function(message) {
			clearInterval(this.clock);
			this.clockTicking = false;
			if(message) console.log("Clock paused at Day "+this.day+": "+message);
		},
		changeTickSpeed: function(value) {
			this.tickSpeed = value;
			this.clockPause("Clock set to "+value+"ms per tick");
			this.clockStart();
		},
		newDay: function() {
			console.groupEnd();

			if(this.currentPopulation.length == 0) {
				this.clockPause("Game over...");
				return false;
			}

			console.group("Day "+this.day,this.productivityAvg);

			this.day++;

			this.currentPopulation.forEach(function(person) {
				person.live();
			});

			if(this.catastrophes && _.random(0,100) < 0.00000001) {
				this.catastrophe();
			}

			this.recordHistory();
		},
		catastrophe: function() {
			console.log("We're all gonna die!")
			var theIncident = _.sample([
				'{{name}} was crushed in a terrible earthquake! D:',
				'{{name}} succumbed to the Zika virus! D:',
				'{{name}} was killed by deadly killer bees! D:',
				'{{name}} drowned in a catastrophic flood! D:',
				'{{name}} was eaten alive in a swarm of locusts! D:',
			]);

			this.currentPopulation.forEach(function(person) {
				if(_.random(0,100) < _.random(0,100)) {
					person.die(theIncident);
				}
			})
		}
	}
});
