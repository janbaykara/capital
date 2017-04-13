var Society = new Vue({
	data: {
		logging: false,
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
				commodityStock: this.commodityStock,
				population: this.population.length,
				currentPopulation: this.currentPopulation.length,
				workingPopulation: this.workingPopulation.length,
				averageOffspring: this.averageOffspring,
				averageAge: this.averageAge,
				averageWealth: this.averageWealth,
				averageHunger: this.averageHunger,
				dailyHunger: this.dailyHunger,
				dailyFoodNeeded: this.dailyFoodNeeded,
				averageWorkingDay: this.averageWorkingDay,
				productivityTotal: this.productivityTotal,
				productivityAvg: this.productivityAvg,
				commodityPrice: this.commodityPrice,
				dailyProductTotal: this.dailyProductTotal,
				dailyProductAvg: this.dailyProductAvg,
			}
		}
	},
	created: function() {
		this.synchronise();

		// Sync config
		this.syncRequest('updateProperty','lifecycle',this.lifecycle);
		this.syncRequest('updateProperty','inheritance',this.inheritance);
		this.syncRequest('updateProperty','banking',this.banking);
		this.syncRequest('updateProperty','equalHours',this.equalHours);
		this.syncRequest('updateProperty','catastrophes',this.catastrophes);
	},
	methods: {
		synchronise: function() {
			var Society = this;
			self.addEventListener('message', function(e) {
				var sentData = e.data;
				if(this.logging) console.log("[ENGINE] received "+sentData[0]+" request:",sentData);
				switch(sentData[0]) {
					case 'doFunction':
						if(this.logging) console.log("[ENGINE] Doing function `"+sentData[1]+"`"); Society[sentData[1]](sentData[2]); break;
					case 'updateProperty':
						if(this.logging) console.log("[ENGINE] Changing property `"+sentData[1]+"`"); Vue.set(Society, sentData[1], sentData[2]);
				}
			}, false);
		},
		syncRequest: function(type,prop,val) {
			if(this.logging) console.log("[ENGINE] Requesting UI to `"+type+"`", prop, val);
			self.postMessage([type,prop,val]);
		},
		recordHistory: function() {
			for (var category in this.statSets) {
				if (this.statSets.hasOwnProperty(category) && typeof this.statSets[category] == 'number' && !isNaN(this.statSets[category])) {
					if(!this.statistics[category]) {
						Vue.set(this.statistics, category, {});
						Vue.set(this.statistics[category], 'values', []);
						this.statistics[category].name = category;
					}

					this.statistics[category].values.push(this.statSets[category]);
					this.statistics[category].floor = Math.min.apply(null, this.wholegraph ? this.statistics[category].values : this.statistics[category].values.slice(-30));
					this.statistics[category].ceiling = Math.max.apply(null, this.wholegraph ? this.statistics[category].values : this.statistics[category].values.slice(-30));
				}
			}
		},
		clockStart: function(message) {
			var Society = this;
			if(this.clock && this.currentPopulation.length == 0) return false; // Give up already...

			this.clock = setInterval(function() {
				Society.newDay();
			}, this.tickSpeed);
			this.clockTicking = true;
			this.syncRequest('updateProperty','clockTicking',true);
			if(message) console.log("Clock starts at Day "+this.day+": "+message);
		},
		clockPause: function(message) {
			clearInterval(this.clock);
			this.clockTicking = false;
			this.syncRequest('updateProperty','clockTicking',false);
			if(message) console.log("Clock paused at Day "+this.day+": "+message);
		},
		changeTickSpeed: function(value) {
			this.tickSpeed = value;
			this.syncRequest('updateProperty','tickSpeed',JSON.parse(JSON.stringify(value)));
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
			this.syncRequest('updateProperty','day',JSON.parse(JSON.stringify(this.$data.day)));

			this.currentPopulation.forEach(function(person) {
				person.live();
			});

			if(this.catastrophes && _.random(0,100) < 0.00000001) {
				this.catastrophe();
			}

			this.recordHistory();

			this.syncRequest('updateProperty','statistics',JSON.parse(JSON.stringify(this.$data.statistics)));
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
