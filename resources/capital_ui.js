Vue.filter('v', function (value, x = 2) {
	var commaFormat = new Intl.NumberFormat('en-GB', {minimumFractionDigits: x, maximumFractionDigits: x});
    return commaFormat.format(value)+" vu";
});

Vue.filter('%', function (value,x = 2) {
    return (value*100).toFixed(x)+"%"
});

Vue.filter('d', function (value,x = 2) {
	var commaFormat = new Intl.NumberFormat('en-GB', {minimumFractionDigits: x, maximumFractionDigits: x});
    return commaFormat.format(value);
});

var numberFormat = new Intl.NumberFormat('en-GB', {style:"currency", currency:"GBP"});
Vue.filter('£', function (value) {
	return numberFormat.format(value);
});

Vue.filter('hrs', function (value) {
  var date = new Date(value * 3600 /* sec per hr */
                           * 1000 /* msec per sec */);
  return ('0' + date.getUTCHours()  ).slice(-2) + ':' +
         ('0' + date.getUTCMinutes()).slice(-2);
});

var UI = new Vue({
	el: '#society',
	data: {
		// UI
		table: false,
		graphs: false,
		wholegraph: false,
		logging: false,
		// config
		lifecycle: true,
		inheritance: false,
		banking: false,
		equalHours: false,
		catastrophes: false,
		// time
		day: 0,
		tickSpeed: 500,
		speedOptions: [1000,500,250,100,10,1],
		// runtime
		statistics: {},
		statSets: {},
		clockTicking: false,
		societyEngine: new Worker('./resources/capital.js')
	},
	watch: {
		wholegraph: function() {
			this.societyEngine.postMessage(['updateProperty','wholegraph',wholegraph]);
		}
	},
	created: function() {
		window.addEventListener('keypress', function(event) {
			if (event.keyCode == 32) {
				event.preventDefault();
				if(UI.clockTicking)
					UI.clockPause()
				else
					UI.clockStart()
			}
		});

		this.synchronise();
		this.syncRequest('updateProperty','logging',this.logging);
	},
	methods: {
		synchronise: function() {
			var Society = this;
			this.societyEngine.addEventListener('message', function(e) {
				var sentData = e.data;
				if(this.logging) console.log("[UI] received "+sentData[0]+" request:",sentData);
				switch(sentData[0]) {
					case 'doFunction':
						if(this.logging) console.log("[UI] Doing function `"+sentData[1]+"`"); Society[sentData[1]](sentData[2]); break;
					case 'updateProperty':
						if(this.logging) console.log("[UI] Changing property `"+sentData[1]+"`"); Vue.set(Society, sentData[1], sentData[2]);
				}
			}, false);
		},
		syncRequest: function(type,prop,val) {
			if(this.logging) console.log("[UI] Requesting ENGINE to `"+type+"`", prop, val);
			this.societyEngine.postMessage([type,prop,val]);
		},
		clockStart: function(message) {
			this.syncRequest('doFunction','clockStart',message);
		},
		clockPause: function(message) {
			this.syncRequest('doFunction','clockPause',message);
		},
		changeTickSpeed: function(value) {
			this.syncRequest('doFunction','changeTickSpeed',value);
		},
		current: function (value) {
		    return value.values.slice(-1) || 0;
		}
	}
});
