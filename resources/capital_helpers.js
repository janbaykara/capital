// Config
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

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

//https://www.babycenter.com/top-baby-names-2014.htm
var firstnames = ["Sophia","Jackson","Emma","Aiden","Olivia","Liam","Ava","Lucas","Isabella","Noah","Mia","Mason","Zoe","Ethan","Lily","Caden","Emily","Jacob","Madelyn","Logan","Madison","Jayden","Chloe","Elijah","Charlotte","Jack","Aubrey","Luke","Avery","Michael","Abigail","Benjamin","Kaylee","Alexander","Layla","James","Harper","Jayce","Ella","Caleb","Amelia","Connor","Arianna","William","Riley","Carter","Aria","Ryan","Hailey","Oliver","Hannah","Matthew","Aaliyah","Daniel","Evelyn","Gabriel","Addison","Henry","Mackenzie","Owen","Adalyn","Grayson","Ellie","Dylan","Brooklyn","Landon","Nora","Isaac","Scarlett","Nicholas","Grace","Wyatt","Anna","Nathan","Isabelle","Andrew","Natalie","Cameron","Kaitlyn","Dominic","Lillian","Joshua","Sarah","Eli","Audrey","Sebastian","Elizabeth","Hunter","Leah","Brayden","Annabelle","David","Kylie","Samuel","Mila","Evan","Claire","Gavin","Victoria","Christian"];

var lastnames = ["Smith","Johnson","Williams","Jones","Brown","Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","Hernandez","King","Wright","Lopez","Hill","Scott","Green","Adams","Baker","Gonzalez","Nelson","Carter","Mitchell","Perez","Roberts","Turner","Phillips","Campbell","Parker","Evans","Edwards","Collins","Stewart","Sanchez","Morris","Rogers","Reed","Cook","Morgan","Bell","Murphy","Bailey","Rivera","Cooper","Richardson","Cox","Howard","Ward","Torres","Peterson","Gray","Ramirez","James","Watson","Brooks","Kelly","Sanders","Price","Bennett","Wood","Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long","Patterson","Hughes","Flores","Washington","Butler","Simmons","Foster","Gonzales","Bryant","Alexander","Russell","Griffin","Diaz","Hayes"];
