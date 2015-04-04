$(function() {
	var topStates = [];
	var topCities = [];
	var topBoss = [];
	var relatedTitles = [];
	var position = getParameterByName('query');
	printJobTitle(position);
	askGlassdoor(position);
	bindUI();
});



//======================
// FUNCTION DECLARATION
//======================
// Note: Sorted alphabetically

// Submit query to Glassdoor API and process result
function askGlassdoor(position) {
	var params = {
		v: "1",
		format: "json",
		"t.p": "32558",
		"t.k": "bGuhOur1YGA",
		userip: "0.0.0.0", /* this needs to be dynamic */
		useragent: navigator.userAgent,
		action: "jobs-stats",
		q: position, /* search employer or occupation */
		//e: "", /* search employer */
		//l: "", /* search city, state, or country */
		//city: "", /* search city */
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

	var results = $.ajax({
		url: "http://api.glassdoor.com/api/api.htm",
		data: params,
		dataType: "jsonp"
	})
	.done(function(results){
		topStates = orderList(results.response.states, "numJobs", "desc");
		topCities = orderList(results.response.cities, "numJobs", "desc");
		topBoss = orderList(results.response.employers, "numJobs", "desc");
		relatedTitles = orderList(results.response.jobTitles, "numJobs", "desc");
		//console.log(topStates);
		//console.log(topCities);
		//console.log(topBoss)
		//console.log(relatedTitles);
		fillTopTen(topStates, "top_states", "A");
		fillTopTen(topCities, "top_cities", "A");
		fillTopTen(relatedTitles, "related_positions", "B");
		fillTopTen(topBoss, "top_employers", "C");
	})
	.fail(function(jqHXR, error, errorThrown){});
}

// Assign event handlers to DOM elements
function bindUI() {
	// Click on Home Icon: Go to index.html
	$('#home_icon').click(function() {
		window.location.href = window.location.pathname.replace('results', 'index');
	});

	// Click on Search Icon: show mini search bar
	$('#search_icon').click(function() {
		$('#mini_search').css({"top": "-1.25rem"});
	});

	// Click on anywhere: hide mini search bar
	$('body').click(function() {
		if ($('#mini_search').css("top") == "-20px")
		{
			$('#mini_search').css({"top": "-235%"});
		}
	});

	// Click on Mini Search Bar: don't hide
	$('#mini_search').click(function(event) {
	 	event.stopPropagation();
	 });

	// Click on related positions: new page with new result
	$('#related_positions').on('click', 'ol > li', function() {
		window.location.href = window.location.pathname + "?query=" + $(this).html();
	});

	// Click on More: show top 100 panel
	$('.orange_button').click(function(event) {
		var category = $(this).parent().attr('id');
		$('#sectionZ').css({"opacity": "100", "z-index": "9998"});
		showMore(category);
	});

	// Click on X: close top 100 panel
	$('#close').click(function() {
		console.log("closing Z");
		$('#sectionZ').animate({"opacity": "0"}, 500).delay(500).animate({"z-index": "-1"}, 0);
	});
}

// Fill the targeted list with the top 10 results 
function fillTopTen(list, target, section) {
	// Store how many times the loop should go (max is 10)
	var max;
	(list.length > 10) ? max = 10 : max = list.length;

	// If there's something on the list...
	if (list.length) {
		// Only do this 10 or less time
		for (var i = 0; i < max; i++) {
			// Build appropriate content based on the section 
			switch(section) {
				case "A":
					var entry = "<li><p>" + list[i].name + "</p><p class=\"numJobs\"><span>" + list[i].numJobs + "</span> jobs</p></li>";
					break;
				case "B":
					var entry = "<li>" + list[i].jobTitle + "</li>";
					break;
				case "C":
					var picture = list[i].squareLogo || "img/building.png";
					var entry = "<li>"+
								"<img src=\"" + picture + "\" />" +
								"<p>" + list[i].name + "</p>"+
								"<p class=\"numJobs\"><span>" + list[i].numJobs + " </span> jobs</p>" +
								"</li>";
					break;
				default:
					console.log("fillTopTen(): 'section' param invalid");
			}
			// Append created entry to the list
			$('#'+target).find('ol').append(entry);
		}
	}

	// Do not show button if there is not more than 10
	if (list.length < 11) {
		$('#'+target).find('.orange_button').addClass('invisible');
	}
}

// Get the value of specified GET property from the URL
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Order a list by the in the specified order of the category
function orderList(list, category, order) {
	// Array to contain the list in order
	var orderedStates = [];
	// Object to temporary hold an array entry while it's position is being switched
	var temporary = {};
	// Index that points to the newly pushed entry.
	var currentIndex;
	// For each entry in the states object, run the function involving index and value
	$.each(list, function(i, v) {
		// Set the index to point to the place where the entry is going to be pushed.
		currentIndex = orderedStates.length;
		// Push the entry to the new array
		orderedStates.push(v);
		if (order.toLowerCase() === "desc")
		{
			// Keep compare and moving until the entry is moved all the way to the beginning
			// or the comparison is not true
			while (currentIndex >= 1 && orderedStates[currentIndex][category] > orderedStates[currentIndex-1][category])
			{
				temporary = orderedStates[currentIndex-1];
				orderedStates[currentIndex-1] = orderedStates[currentIndex];
				orderedStates[currentIndex] = temporary;
				currentIndex--;
			}
		}
		else if (order.toLowerCase() === "asc")
		{
			// Keep compare and moving until the entry is moved all the way to the beginning
			// or the comparison is not true
			while (currentIndex >= 1 && newStates[currentIndex][category] < orderedStates[currentIndex-1][category])
			{
				temporary = orderedStates[currentIndex-1];
				orderedStates[currentIndex-1] = orderedStates[currentIndex];
				orderedStates[currentIndex] = temporary;
				currentIndex--;
			}
		}
		else
		{
			console.log("order type passed into orderStates() is not recognized.");
		}
	});
	
	return orderedStates;
}

// Write the job title on the header based on what the user searches
function printJobTitle(position) {
	var jobTitle = position || "All Positions";
	$('#job_title').html(jobTitle);
}


function showMore(category) {
	// Decide what the title will be
	var title = category.replace('_', " ");
	$('#top_hundred').find('h2').html(title);

	// Decide which list is going to be printed
	var list = [];
	switch(category) {
		case "top_states":
			list = topStates;
			//title= "top states"
			break;
		case "top_cities":
			list = topCities;
			//title = "top cities"
			break;
		case "top_employers":
			list = topBoss;
			//title = "top employers"
			break;
		case "related_positions":
			list = relatedTitles;
			//title = "related positions"
			break;
		default:
			console.log("showMore(): 'category' invalid.");
	}

	// Store how many times the loop should go (max is 100)
	var max;
	(list.length > 100) ? max = 100 : max = list.length;

	// Clear the list
	$('#top_hundred').find('ol').children().remove();

	// Only do this 100 or less time
	for (var i = 0; i < max; i++) {
		// Build appropriate content based on the section 
		switch(category) {
			case "top_states":
				var entry = "<li><p>" + list[i].name + "</p><p class=\"numJobs\"><span>" + list[i].numJobs + "</span> jobs</p></li>";
				break;
			case "top_cities":
				var entry = "<li><p>" + list[i].name + "</p><p class=\"numJobs\"><span>" + list[i].numJobs + "</span> jobs</p></li>";
				break;
			case "related_positions":
				var entry = "<li>" + list[i].jobTitle + "</li>";
				break;
			case "top_employers":
				var picture = list[i].squareLogo || "img/building.png";
				var entry = "<li>"+
							"<img src=\"" + picture + "\" />" +
							"<p>" + list[i].name + "</p>"+
							"<p class=\"numJobs\"><span>" + list[i].numJobs + " </span> jobs</p>" +
							"</li>";
				break;
			default:
				console.log("fillTopTen(): 'category' param invalid");
		}
		// Append created entry to the list
		$('#top_hundred').find('ol').append(entry);
	}
}