$(function() {

	// Bound this function to search button click
	askGlassdoor(glassdoorAPI.partnerID, glassdoorAPI.key);

});

function askGlassdoor(pId, key) {
	var params = {
		v: "1",
		format: "json",
		"t.p": pId,
		"t.k": key,
		userip: "192.168.0.10", /* this needs to be dynamic */
		useragent: navigator.userAgent,
		action: "jobs-stats",
		q: "front-end developer", /* search employer or occupation */
		//e: "", /* search employer */
		//l: "", /* search city, state, or country */
		city: "", /* search city */
		//state: "", /* search state */
		//country: "", /* search country */
		//fromAge: "", /* number of days posted. default: -1 (all) */ 
		//jobType: "", /* default: all. full-time | part-time | internship | contract | temporary */
		//minRating: "", /* min company rating: 1 | 2 | 3 | 4 */
		//radius: "", /* in miles */
		//jt: "", /* search job title */
		//jc: "", /* search job category */
		returnCities: true,
		returnStates: true,
		returnJobTitles: true,
		returnEmployers: true,
		admLevelRequested: "1" /* 1 - states; 2 - counties */
	};

	var fake = [
		{
			name: "Alabama",
			numJobs: "100"
		},
		{
			name: "Georgia",
			numJobs: "200"
		},
		{
			name: "Florida",
			numJobs: "500"
		},
		{
			name: "North Carolina",
			numJobs: "10"
		},
		{
			name: "Wisconsin",
			numJobs: "300"
		},
	];

	var results = $.ajax({
		url: "http://api.glassdoor.com/api/api.htm",
		data: params,
		dataType: "jsonp"
	})
	.done(function(results){
		var stateList = results.response.states;
		//console.log(stateList);
		orderStates(fake, "numJobs", "desc");
	})
	.fail(function(jqHXR, error, errorThrown){});
};


// Order an object
function orderStates(states, category, order) {
	switch (order) {
		case "desc":
			var newStates = [];
			var temporary = {};
			var currentIndex;
			$.each(states, function(i, v) {
				currentIndex = newStates.length;
				newStates.push(v);
				console.log("push is executed");
				if (currentIndex > 0 && newStates[currentIndex][category] > newStates[currentIndex-1][category]) {
					while (currentIndex >= 1) {
						console.log("moving"); console.log(newStates[currentIndex]);
						console.log("to"); console.log(newStates[currentIndex-1]);
						temporary = newStates[currentIndex-1];
						newStates[currentIndex-1] = newStates[currentIndex];
						newStates[currentIndex] = temporary;
						currentIndex--;
						console.log("array result is"); console.log(newStates);
					}
				}
				else
				{
					console.log("ordering skipped");
				}
				console.log(newStates);
			});
			// return ordered array.
			break;
		case "asc":
			break;
		default:
	}
};