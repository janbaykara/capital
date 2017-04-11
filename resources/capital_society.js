var Society = new Vue({
	el: '#society',
	data: {
		population: [],
		commodityStock: 0,
		day: 0,
		chanceOfCatastrophe: 0,
		tickSpeed: 500,
		speedOptions: [1000,500,250,100,10],
		lifecycle: true,
		inheritance: false,
		equalHours: false,
		savings: false,
		clock: null,
		clockTicking: false,
		statistics: {}
	},
	computed: {
		currentPopulation: function() {
			return _(this.population).filter('alive').orderBy(['LabourIndividualProductivity'], ['desc']).value();
		},
		workingPopulation: function() {
			return _(this.currentPopulation).filter((p)=>p.age >= p.ageAdult).value();
		},
		averageOffspring: function() {
			return _.chain(this.population).filter((p)=>p.age >= p.ageAdult).meanBy((p)=>p.offspring.length).value();
		},
		averageAge: function() {
			return _.meanBy(this.currentPopulation, 'age');
		},
		averageWealth: function() {
			return _.meanBy(this.workingPopulation, 'wallet');
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
		LabourPowerTotal: function() {
			return _.sumBy(this.workingPopulation, 'LabourIndividualProductivity');
		},
		LabourTimeSocNec: function() { // value of commodity
			return _.meanBy(this.workingPopulation, 'LabourIndividualProductivity');
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
				LabourPowerTotal: { value: this.LabourPowerTotal, 				floor: 0, ceiling: 0 },
				LabourTimeSocNec: { value: this.LabourTimeSocNec, 				floor: 0, ceiling: 0 },
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
					this.statSets[category].floor = Math.min.apply(null, this.statistics[category]);
					this.statSets[category].ceiling = Math.max.apply(null, this.statistics[category]);
				}
			}
		},
		clockStart: function(message) {
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

			console.group("Day "+this.day,this.LabourTimeSocNec);

			Society.day++;

			Society.currentPopulation.forEach(function(person) {
				person.live();
			});

			if(_.random(0,100) < Society.chanceOfCatastrophe) {
				Society.catastrophe();
			}

			this.recordHistory();
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
