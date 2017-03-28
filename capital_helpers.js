Vue.filter('£', function (value) {
    return accounting.formatMoney(value, "£")
});
