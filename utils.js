var fs = require("fs");

module.exports = {
	/**
	 * Help function that sorts objects and arrays inside an object,
	 * making it easier to perform a diff on objects with similar elements
	 * @param  {String} inputFile  Location from which to read the input file
	 * @param  {String} outputFile Location to write the output file to
	 */
	sortStyle: function(inputFile, outputFile) {
		var mapGlStyle = JSON.parse(fs.readFileSync(inputFile, "utf8"));

		mapGlStyle.layers = mapGlStyle.layers.sort(compare)
		mapGlStyle.layers = order(mapGlStyle.layers);
		mapGlStyle.sources = orderByKey(mapGlStyle.sources);
		mapGlStyle.metadata["mapbox:groups"] = orderByKey(mapGlStyle.metadata["mapbox:groups"]);

		fs.writeFile(outputFile, JSON.stringify(mapGlStyle), function (err) {});

		function compare(a, b) {
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;
		  	return 0;
		}

		function order(array) {
			newArray = [];
			array.forEach(function(unordered) {
				newArray.push(orderByKey(unordered));
			})
			return newArray;
		}

		function orderByKey(unordered) {
			var ordered = {};
			Object.keys(unordered).sort().forEach(function(key) {
			  	ordered[key] = unordered[key];
			});
			return ordered;
		}
	}
}