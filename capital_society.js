var Society = new Vue({
	el: '#society',
	data: {
		population: [],
		commodities: 0,
		day: 0,
		chanceOfCatastrophe: 0,
		tickSpeed: 500,
		hoursWorkingDay: 10
	},
	computed: {
		currentPopulation: function() {
			return _(this.population).filter('alive').orderBy(['wallet'], ['desc']).value();
		},
		workingPopulation: function() {
			return _(this.currentPopulation).filter((p)=>p.age >= p.ageAdult).orderBy(['wallet'], ['desc']).value();
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
		LabourPowerTotal: function() {
			return _.sumBy(this.workingPopulation, 'LabourPowerIndividual');
		},
		LabourPowerSocAvgUnit: function() { // value of commodity
			return _.meanBy(this.workingPopulation, 'LabourPowerIndividual');
		}
	},
	created: function() {
		// And everyday after...
		setInterval(function() {
			Society.newDay();
		}, this.tickSpeed);
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
