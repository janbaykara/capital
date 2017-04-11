var Society = new Vue({
	el: '#society',
	data: {
		population: [],
		commodityStock: 0,
		day: 0,
		chanceOfCatastrophe: 0,
		tickSpeed: 500,
		lifecycle: true,
		inheritance: false,
		equalHours: false,
		savings: false,
		clock: null,
		clockTicking: false
	},
	computed: {
		currentPopulation: function() {
			return _(this.population).filter('alive').orderBy(['LabourPowerIndividual'], ['desc']).value();
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
			return _.sumBy(this.workingPopulation, 'LabourPowerIndividual');
		},
		LabourPowerSocAvgUnit: function() { // value of commodity
			return _.meanBy(this.workingPopulation, 'LabourPowerIndividual');
		},
		dailyProductTotal: function() {
			return _.sumBy(this.workingPopulation, 'dailyProduct');
		},
		dailyProductAvg: function() {
			return _.meanBy(this.workingPopulation, 'dailyProduct');
		}
	},
	created: function() {
		this.clockStart("In the beginning...");
	},
	methods: {
		clockStart: function(message) {
			this.clock = setInterval(function() {
				Society.newDay();
			}, this.tickSpeed);
			this.clockTicking = true;
			if(message) console.log("Clock starts at Day "+this.day+": "+message);
		},
		clockPause : function(message) {
			clearInterval(this.clock);
			this.clockTicking = false;
			if(message) console.log("Clock paused at Day "+this.day+": "+message);
		},
		newDay: function() {
			console.groupEnd();

			if(this.currentPopulation.length == 0) {
				this.clockPause("Game over...");
				return false;
			}

			console.group("Day "+this.day,this.LabourPowerSocAvgUnit);

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
