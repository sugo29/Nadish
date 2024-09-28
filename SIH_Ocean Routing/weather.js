var center = SMap.Coords.fromWGS84(16.265479, 49.714679);
var riva = SMap.Coords.fromWGS84(10.85, 45.883333);
var map = new SMap(JAK.gel("mapa"), center, 10);
map.addDefaultLayer(SMap.DEF_BASE).enable();
map.addDefaultControls();
var mouse = new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL | SMap.MOUSE_ZOOM);
map.addControl(mouse);

var mark_layer = new SMap.Layer.Marker();
map.addLayer(mark_layer);
mark_layer.enable();

var weather_layer = new SMap.Layer.Marker();
map.addLayer(weather_layer);
weather_layer.enable();

var geom_layer = new SMap.Layer.Geometry();
map.addLayer(geom_layer).enable();


//mode (needed for click on map callback): 0 default, 1 load start point, 2 load end point
var mode = 0;
var start = center;
var end = riva;
var e_start = 0;
var e_end = 0;
var mark_start;
var mark_end;
var route;
e_route = 0;
var done = 0;
var e_weather = 0;

var the_route;
var weather_points;
var altitudes;
var weather;
var weather_pts;
var travel_time;

function click(e, elm)
{
	var coords = SMap.Coords.fromEvent(e.data.event, map);
	//alert("Clicked on " + coords.toWGS84(2).reverse().join(" "));

	if(mode == 1)
	{
		//set start to given coordinates
		start = coords;

		//add (move) a marker to start
		if(!e_start)
		{
			var label = JAK.mel("div");
			var image = JAK.mel("img", {src:SMap.CONFIG.img+"/marker/drop-red.png"});
			label.appendChild(image);
			var title = JAK.mel("div", {}, {position:"absolute", left:"0px", top:"2px", textAlign:"center", width:"22px", color:"white", fontWeight:"bold"});
			title.innerHTML = "A";
			label.appendChild(title);
			
			e_start = 1;
			var options = {url:label};
			mark_start = new SMap.Marker(start, "Start", options);
			mark_layer.addMarker(mark_start);

			
		}
		else
		{
			mark_start.setCoords(start);
		}
		
		//set mode back to 0
		mode = 0;
		//alert("Mode set to 0");
	}
	else if(mode == 2)
	{
		end = coords;

		//add (move) a marker to target
		if(!e_end)
		{
			var label = JAK.mel("div");
			var image = JAK.mel("img", {src:SMap.CONFIG.img+"/marker/drop-red.png"});
			label.appendChild(image);
			var title = JAK.mel("div", {}, {position:"absolute", left:"0px", top:"2px", textAlign:"center", width:"22px", color:"white", fontWeight:"bold"});
			title.innerHTML = "B";
			label.appendChild(title);
			
			e_end = 1;
			var options = {url:label};
			mark_end = new SMap.Marker(end, "End", options);
			mark_layer.addMarker(mark_end);
		}
		else
		{
			mark_end.setCoords(end);
		}

		//set mode back to 0
		mode = 0;
		//alert("Mode set to 0");
	}
	
}
map.getSignals().addListener(window, "map-click", click);

function load_start()
{
	mode = 1;
	//alert("Mode set to 1");
}

function load_target()
{
	mode = 2;
	//alert("Mode set to 2");
}



function find_route()
{
	if(!e_start || !e_end)
	{
		alert("Start or target point is not set.");
	}
	else
	{
		//alert("Finding route.");
		var means = document.querySelector('input[name="means"]:checked').value;
		var params = {criterion: "fast"};
		if(means==2)
			params = {criterion: "bike1"};
		else if(means==3)
			params = {criterion: "turist1"};
		var route_coords = [start, end];
		var found_callback = function(route)
		{
			done = 0;
			if(e_route)
			{
				geom_layer.removeAll();
				//mark_layer.removeAll();
			}
			if(e_weather)
			{
				e_weather = 0;
				weather_layer.removeAll();
			}

			var coords = route.getResults().geometry;
			var cz = map.computeCenterZoom(coords);
			map.setCenterZoom(cz[0], cz[1]);
			var g = new SMap.Geometry(SMap.GEOMETRY_POLYLINE, null, coords);
			geom_layer.addGeometry(g);

			var res = route.getResults();
			//alert(res.altitude);
			var pt1 = res.points[1];

			e_route = 1;

			//obtain the weather points
			const route_geom = coords;
			the_route = coords;
			num_pts = route_geom.length;
			//alert(coords);
			
			//find 8 equidistant points (length will be ~1/9 of the total length of the route)
			weather_points = [route_geom[0]];
			altitudes = [res.altitude[0]];
			if(num_pts <= 10)
			{
				for(var i=1;i<=9;i++)
				{
					weather_points.push(route_geom[i]);
					//altitudes.push(res.altitude[i]);
				}
			}
			else
			{
				var diff = num_pts/9;
			
				for(var i=1;i<=8;i++)
				{
					weather_points.push(route_geom[Math.round(diff*i)]);
					//altitudes.push(res.altitude[11*i]);
				}
				weather_points.push(route_geom[num_pts-1]);
				//altitudes.push(res.altitude[99]);
			}
			//alert(altitudes);

			//use recursion to obtain the travel times to weather points, after that set done to 1
			travel_time = [0];
			var found_callback_2 = function(route)
			{
				var res = route.getResults();
				travel_time.push(res.time);
				altitudes.push(res.altitude[res.altitude.length-1]);
				ix = ix + 1;
				if(ix < 10)
				{
					var params = {criterion: "fast"};
					if(means==2)
						params = {criterion: "bike1"};
					else if(means==3)
						params = {criterion: "turist1"};
					var route_coords = [start, weather_points[ix]];
					new SMap.Route(route_coords, found_callback_2, params);
				}
				else
				{
					done = 1;
				}
			}
			
			var ix = 1;
			var route_coords = [start, weather_points[1]];
			var params = {criterion: "fast"};
			if(means==2)
				params = {criterion: "bike1"};
			else if(means==3)
				params = {criterion: "turist1"};
			new SMap.Route(route_coords, found_callback_2, params);    					
		}
		route = new SMap.Route(route_coords, found_callback, params);
	}
}

async function save_route()
{
	if(!e_route)
	{
		alert("No route found.");
	}
	else if(!done)
	{
		alert("Acquiring some data, wait a few seconds and try again.");
	}
	else
	{
		//alert(JSON.stringify(the_route));
		//alert(Object.keys(route));
	
		var route_name = prompt("Please enter the name of the route", "Route");
		//var text =  "http://127.0.0.1:5000/route/"+route_name+"/";
		var text =  "http://hrubype7.pythonanywhere.com/route/"+route_name+"/";
		//alert(text);
		try
		{
			var ret = {route: the_route, weather_points: weather_points, travel_time: travel_time, altitudes: altitudes};
			//var text = "http://127.0.0.1:5000/route/";
			var response = await fetch(text,{method: "POST"
				,body:JSON.stringify(ret)
			});
			//let response = await fetch(text);
			//alert(text);
			//alert(response.status);
			//alert(Object.keys(response));
			var data = await response.json();
			//alert(data);
		}
		catch(e)
		{
			alert(e.message);
			//alert(e);
			//alert(Object.keys(e));
		}
	}
}

var opt_routes;

async function load_routes()
{
	//var text =  "http://127.0.0.1:5000/route/get_all/";
	var text = "http://hrubype7.pythonanywhere.com/route/get_all/";
	const response = await fetch(text);
	var data = await response.json();
	//alert(data.Data);
	document.getElementById(data.Data);
	//alert(data.Data.length);
	opt_routes = data.Data;

	let optionList = document.getElementById('route_select').options;
	//optionList = [];
	//alert(optionList.length);
	while(optionList.length)
		optionList.pop();
	for(var i=0;i<data.Data.length;i++)
	{
		//alert(data.Data[i]);
		optionList.add(new Option(data.Data[i], data.Data[i], false));
	}
}

async function load_route()
{
	var x = document.getElementById("route_select");
	//alert(x.selectedIndex);
	if(x.selectedIndex == -1)
	{
		alert("No route selected.");
	}
	else
	{
		//alert(opt_routes[x.selectedIndex]);
		r_name = opt_routes[x.selectedIndex];
		//var text = "http://127.0.0.1:5000/route/get_route/"+r_name+"/";
		var text = "http://hrubype7.pythonanywhere.com/route/get_route/"+r_name+"/";
		var response = await fetch(text);
		if(response.status == 400)
		{
			alert("Route not in the database. Please update route list.")
		}
		else if(response.status == 200)
		{
			//remove the previous route
			if(e_route)
			{
				geom_layer.removeAll();
				//mark_layer.removeAll();
			}
			if(e_weather)
			{
				e_weather = 0;
				weather_layer.removeAll();
			}
			//draw the route
			done = 0;
			e_route = 1;
			var data = await response.json();
			var DD = data.Data;
			var D = JSON.parse(DD);
			var route = D.route;
			//alert(route);
			//alert(Object.keys(route[0]));
			//alert(route[0].x);
			//alert(route.length);
			var coords = new Array(route.length);
			for(var i=0;i<route.length;i++)
			{
				//alert(i);
				coords[i] = SMap.Coords.fromWGS84(route[i].x, route[i].y);
			}

			/*var geom_layer = new SMap.Layer.Geometry();
			map.addLayer(geom_layer).enable();*/

			var cz = map.computeCenterZoom(coords);
			map.setCenterZoom(cz[0], cz[1]);
			var g = new SMap.Geometry(SMap.GEOMETRY_POLYLINE, null, coords);
			geom_layer.addGeometry(g);
			the_route = coords;

			//obtain the weather points
			//alert(D.weather_points);
			weather_points = new Array(10);
			for(var i=0;i<=9;i++)
			{
				weather_points[i] = SMap.Coords.fromWGS84(D.weather_points[i].x, D.weather_points[i].y);
			}
			//alert(weather_points);

			//obtain the travel time
			travel_time = D.travel_time;
			altitudes = D.altitudes;

			done = 1;
		}
		else
		{
			alert("Error occured");
		}
		//alert(response.status);
	}
}

function reqListener()
{
  var data = JSON.parse(this.responseText);
  //lat,lon,timezone,timezone_offset,current,minutely,hourly,daily
  console.log(data);
  
  alert(data);
  alert(Object.keys(data));
  alert(data.cod)
  alert(data.message)
  alert("Success");
}

function reqError(err)
{
  console.log('Fetch Error :-S', err);
  alert("Weather Request Failed");
}

function weatherReqListener()
{
  var data = JSON.parse(this.responseText);
  //lat,lon,timezone,timezone_offset,current,minutely,hourly,daily
  alert("Success");
  //TODO
  //react on wrong message

  weather_pts.push(SMap.Coords.fromWGS84(data.lon, data.lat));
  weather.push(data.current);
  weather_m.push(data.minutely);
  weather_h.push(data.hourly);
}

function weatherReqError(err)
{
  console.log('Fetch Error :-S', err);
  alert("Weather Request Failed");
}

async function get_weather()
{
	if(!e_route)
	{
		alert("No route found.");
	}
	else if(!done)
	{
		alert("Acquiring some data, wait a few seconds and try again.");
	}
	else
	{
		//alert(travel_time);
		if(e_weather)
		{
			weather_layer.removeAll();
		}
		e_weather = 1;

		//find the weather in that points (for different times) and the time of travelling to that point (use mapy.cz api again)
		weather = [];
		weather_m = [];
		weather_h = [];
		weather_pts = [];
		for(var i=0;i<10;i++)
		{
			//alert(weather_points[i]);
			var coord = weather_points[i];
			var ll = coord.toWGS84();
			var key = "fa7394b0cfa88d4bff246ced3f6336d3";
			var text =  "https://api.openweathermap.org/data/2.5/onecall?lat=" + ll[1] + "&lon=" + ll[0] + "&appid=" + key;
			const response = await fetch(text);
			const data = await response.json();
			weather_pts.push(SMap.Coords.fromWGS84(data.lon, data.lat));
			weather.push(data.current);
			weather_m.push(data.minutely);
			weather_h.push(data.hourly);
		}

		//for given departure time (can be moved using some kind of slider, use hours and minutes, probably 2 different sliders, arrival should be under 2 days) compute the passing time for every weather point (there will be a function to recompute it -> a callback for the slider)
		var departure_offset = 0;
		for(var i=0;i<10;i++)
		{
			//minute forecast for 1 hour
			//hourly forecast for 48 hours
			//-> if the time is 0, select current, if time is < 3600, select nearest minutely (if == time/60 > 60, select the last one)
			//otherwise select nearest hourly
			//alert(travel_time[i]);

			//check the time and the timestamps
			//alert(weather[i].dt); //1605721228 6:40:28 PM GMT+1
			//alert(weather_m[i][0].dt); //1605721260 6:41:00 PM GMT+1 (the beginning of the next minute)
			//alert(weather_h[i][0].dt); //1605718800 6:00:00 PM GMT+1 (the beginning of the current hour -> even earlier, if in one hour, use weather_h[i][1])
			var cur_ts = weather[i].dt;
			var ts = cur_ts + travel_time[i]+departure_offset;
			var mins = Math.floor(travel_time[i]/60);
			var hours = Math.floor(travel_time[i]/3600);

			var temp = "?";
			var prec = -1;
			var prob = -1;
			var wind = -1;
			var desc = -1;

			//process the timestamp
			if(travel_time[i]+departure_offset == 0)
			{
				//current
				//alert("CURRENT " + weather.length);
				//length of weather is 1, the element weather[0] contains:
				//dt,sunrise,sunset,temp,feels_like,pressure,humidity,dew_point,uvi,clouds,visibility,wind_speed,wind_deg,wind_gust,weather
				//probably use this if it is possible and precipitation from minutely (if possible)

				//show current temp, wind_speed, weather.description
				//maybe also the first minutely precipitation (the color of the mark may depend on this)
				temp = weather[i].temp-273.15;
				prec = weather_m[i][0].precipitation;
				wind = weather[i].wind_speed;
				desc = weather[i].weather[0].description;
				//alert(weather[i].weather[0].description + " Temperature: " + temp + " °C Wind speed: " + weather[i].wind_speed + "m/s " + "Precipitation: " + weather_m[i][0].precipitation);
			}
			else if(mins <= 60)
			{
				//minutely
				//alert("MINUTELY " + weather_m.length);
				//length of weather_m is 1 (will be 10), length of weather_m[0] is 61
				//each element weather_m[0][i] contains dt,precipitation
				// -> like it is good to have it but we still need either current or hourly
				//(see the timestamp for the first minutely and for the first hourly)

				//
				var ts1 = cur_ts;
				var ts2 = weather_h[i][1].ts;
				if(ts-ts1 <= ts2-ts)
				{
					temp = weather[i].temp-273.15;
					prec = weather_m[i][mins].precipitation;
					wind = weather[i].wind_speed;
					desc = weather[i].weather[0].description;
					//alert(weather[i].weather[0].description + " Temperature: " + temp + " °C Wind speed: " + weather[i].wind_speed + "m/s " + "Precipitation: " + weather_m[i][mins].precipitation);
				}
				else
				{
					temp = weather_h[i][1].temp-273.15;
					prec = weather_m[i][mins].precipitation;
					wind = weather_h[i][1].wind_speed;
					desc = weather_h[i][1].weather[0].description;
					//alert(weather_h[i][1].weather[0].description + " Temperature: " + temp + " °C Wind speed: " + weather_h[i][1].wind_speed + "m/s " + "Precipitation: " + weather_m[i][mins].precipitation);
				}
			}
			else if(hours <= 46)
			{
				//hourly
				//alert("HOURLY " + weather_h.length);
				//length is 1 (will be 10, we take i-th element in i-th step), length of weather_h[0] is 48, each weather_h[0][i] contains the following:
				//dt,temp,feels_like,pressure,humidity,dew_point,clouds,visibility,wind_speed,wind_deg,weather,pop

				var ts1 = weather_h[i][hours].ts;
				var ts2 = weather_h[i][hours+1].ts;
				if(ts-ts1 <= ts2-ts)
				{
					temp = weather_h[i][hours].temp-273.15;
					prob = weather_h[i][hours].pop;
					desc = weather_h[i][hours].weather[0].description;
					wind = weather_h[i][hours].wind_speed;
					//alert(weather_h[i][hours].weather[0].description + " Temperature: " + temp + " °C Wind speed: " + weather_h[i][hours].wind_speed + "m/s " + "Precipitation probability: " + weather_h[i][hours].pop + " %");
				}
				else
				{
					temp = weather_h[i][hours+1].temp-273.15;
					prob = weather_h[i][hours].pop;
					desc = weather_h[i][hours+1].weather[0].description;
					wind = weather_h[i][hours+1].wind_speed;
					//alert(weather_h[i][hours+1].weather[0].description + " Temperature: " + temp + " °C Wind speed: " + weather_h[i][hours+1].wind_speed + "m/s " + "Precipitation probability: " + weather_h[i][hours+1].pop + " %");
				}
			}
			else if(hours == 47)
			{
				prob = weather_h[i][hours].pop;
				temp = weather_h[i][hours].temp-273.15;
				desc = weather_h[i][hours].weather[0].description;
				wind = weather_h[i][hours].wind_speed;
				//alert(weather_h[i][hours].weather[0].description + " Temperature: " + temp + " °C Wind speed: " + weather_h[i][hours].wind_speed + "m/s " + "Precipitation probability: " + weather_h[i][hours].pop + " %");
			}
			else
			{
				//TODO use daily data
				//alert("Too distant future, no weather available.");
			}

			temp = Math.round(temp*10)/10;


			//add a point 
			var label = JAK.mel("div");
			var image = JAK.mel("img", {src:SMap.CONFIG.img+"/marker/drop-blue.png"});
			label.appendChild(image);
			var title = JAK.mel("div", {}, {position:"absolute", left:"0px", top:"2px", textAlign:"center", width:"22px", color:"white", fontWeight:"bold"});
			if(prec == -1)
			{
				if(prob == -1)
				{
					title.innerHTML = '<table bgcolor="black"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
				}
				else if(prob == 0)
				{
					title.innerHTML = '<table bgcolor="black" style="color:lightblue"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
				}
				else if(prob < 0.33)
				{
					title.innerHTML = '<table bgcolor="black" style="color:green"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
				}
				else if(prob < 0.66)
				{
					title.innerHTML = '<table bgcolor="black" style="color:orange"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
				}
				else
				{
					title.innerHTML = '<table bgcolor="black" style="color:red"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
				}
			}
			else if(prec < 1)
			{
				title.innerHTML = '<table bgcolor="blue"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else if(prec < 10)
			{
				title.innerHTML = '<table bgcolor="green"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else if(prec < 100)
			{
				title.innerHTML = '<table bgcolor="orange"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else
			{
				title.innerHTML = '<table bgcolor="red"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			label.appendChild(title);

			//TODO
			//color defned by the precipitation -> like in the radar
			//in the case of hourly -> inverse labels, precipitation probability (color number on black, white or gray (probably black))
			//put description under the map -> what means what, which color
			//put images of the weathers and if clicked on it, put there a card (from mapy.cz api) with all known details
			
			var options = {url:label};
			var mark_weather = new SMap.Marker(weather_points[i], "Weather "+i, options);

			//decorate the marker with the card
			var c = new SMap.Card();
			c.setSize(200, 200);
			c.getHeader().innerHTML = desc;
			c.getHeader().style.backgroundColor = "#ccc";
			if(prec != -1)
			{
				c.getBody().innerHTML = "Altitude: "+ altitudes[i] +" m <br> Precipitation: "+ prec +" mm/h <br> Wind speed: "+ wind +"m/s <br> Travel time: "+ travel_time[i] + "s";
			}
			else
			{
				c.getBody().innerHTML = "Altitude: "+ altitudes[i] +" m <br> Precipitation: "+ prob*100 +" % <br> Wind speed: "+ wind +"m/s <br> Travel time: "+ travel_time[i] + "s";
			}
			mark_weather.decorate(SMap.Marker.Feature.Card, c);

			//add the marker to the marker layer
			weather_layer.addMarker(mark_weather);
		}

		//for every selected point add a marker (if possible, select a different color, red is for planning, some other color will be intermediate and another color will be weather (maybe even use the weather symbols and place for temperature + output the time of route and planned time))

		//find the time of arrival for every point and detect if there will be light or dark -> compute sunset and sunrise for every point (+ estimate the time + by some kind of bisection select the point from which there will be darkness (if there is something like this))
	}
}

var slider = document.getElementById("delay");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function()
{
  output.innerHTML = this.value;
  //update the weather
  if(e_weather)
  {
  	weather_layer.removeAll();
  	var departure_offset = this.value*3600;
  	//alert(departure_offset);

  	for(var i=0;i<10;i++)
	{
		//minute forecast for 1 hour
		//hourly forecast for 48 hours
		//-> if the time is 0, select current, if time is < 3600, select nearest minutely (if == time/60 > 60, select the last one)
		//otherwise select nearest hourly
		var cur_ts = weather[i].dt;
		var ts = cur_ts + travel_time[i]+departure_offset;
		var mins = Math.floor((travel_time[i]+departure_offset)/60);
		var hours = Math.floor((travel_time[i]+departure_offset)/3600);

		var temp = "?";
		var prec = -1;
		var prob = -1;
		var wind = -1;
		var desc = -1;

		//process the timestamp
		if(travel_time[i]+departure_offset == 0)
		{
			//current
			//show current temp, wind_speed, weather.description
			//maybe also the first minutely precipitation (the color of the mark may depend on this)
			temp = weather[i].temp-273.15;
			prec = weather_m[i][0].precipitation;
			wind = weather[i].wind_speed;
			desc = weather[i].weather[0].description;

		}
		else if(mins <= 60)
		{
			//minutely
			var ts1 = cur_ts;
			var ts2 = weather_h[i][1].ts;
			if(ts-ts1 <= ts2-ts)
			{
				temp = weather[i].temp-273.15;
				prec = weather_m[i][mins].precipitation;
				wind = weather[i].wind_speed;
				desc = weather[i].weather[0].description;
			}
			else
			{
				temp = weather_h[i][1].temp-273.15;
				prec = weather_m[i][mins].precipitation;
				wind = weather_h[i][1].wind_speed;
				desc = weather_h[i][1].weather[0].description;
			}
		}
		else if(hours <= 46)
		{
			//hourly
			var ts1 = weather_h[i][hours].ts;
			var ts2 = weather_h[i][hours+1].ts;
			if(ts-ts1 <= ts2-ts)
			{
				temp = weather_h[i][hours].temp-273.15;
				prob = weather_h[i][hours].pop;
				desc = weather_h[i][hours].weather[0].description;
				wind = weather_h[i][hours].wind_speed;
			}
			else
			{
				temp = weather_h[i][hours+1].temp-273.15;
				prob = weather_h[i][hours].pop;
				desc = weather_h[i][hours+1].weather[0].description;
				wind = weather_h[i][hours+1].wind_speed;
			}
		}
		else if(hours == 47)
		{
			prob = weather_h[i][hours].pop;
			temp = weather_h[i][hours].temp-273.15;
			desc = weather_h[i][hours].weather[0].description;
			wind = weather_h[i][hours].wind_speed;
		}
		else
		{
			//TODO use daily data
			//alert("Too distant future, no weather available.");
		}

		temp = Math.round(temp*10)/10;


		//add a point 
		var label = JAK.mel("div");
		var image = JAK.mel("img", {src:SMap.CONFIG.img+"/marker/drop-blue.png"});
		label.appendChild(image);
		var title = JAK.mel("div", {}, {position:"absolute", left:"0px", top:"2px", textAlign:"center", width:"22px", color:"white", fontWeight:"bold"});
		if(prec == -1)
		{
			if(prob == -1)
			{
				title.innerHTML = '<table bgcolor="black"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else if(prob == 0)
			{
				title.innerHTML = '<table bgcolor="black" style="color:lightblue"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else if(prob < 0.33)
			{
				title.innerHTML = '<table bgcolor="black" style="color:green"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else if(prob < 0.66)
			{
				title.innerHTML = '<table bgcolor="black" style="color:orange"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
			else
			{
				title.innerHTML = '<table bgcolor="black" style="color:red"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
			}
		}
		else if(prec < 1)
		{
			title.innerHTML = '<table bgcolor="blue"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
		}
		else if(prec < 10)
		{
			title.innerHTML = '<table bgcolor="green"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
		}
		else if(prec < 100)
		{
			title.innerHTML = '<table bgcolor="orange"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
		}
		else
		{
			title.innerHTML = '<table bgcolor="red"> <tr> <td>' + temp + ' °C </td> </tr> </p>';
		}
		label.appendChild(title);
		
		var options = {url:label};
		var mark_weather = new SMap.Marker(weather_points[i], "Weather "+i, options);

		//decorate the marker with the card
		var c = new SMap.Card();
		c.setSize(200, 200);
		c.getHeader().innerHTML = desc;
		c.getHeader().style.backgroundColor = "#ccc";
		if(prec != -1)
			{
				c.getBody().innerHTML = "Altitude: "+ altitudes[i] +" m <br> Precipitation: "+ prec +" mm/h <br> Wind speed: "+ wind +"m/s <br> Travel time: "+ travel_time[i] + "s";
			}
			else
			{
				c.getBody().innerHTML = "Altitude: "+ altitudes[i] +" m <br> Precipitation: "+ prob*100 +" % <br> Wind speed: "+ wind +"m/s <br> Travel time: "+ travel_time[i] + "s";
			}
		mark_weather.decorate(SMap.Marker.Feature.Card, c);

		//add the marker to the marker layer
		weather_layer.addMarker(mark_weather);
	}
  }
} 