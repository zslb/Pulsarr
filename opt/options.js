"use strict";

var tooltips = [
		{title: "IP address or domain name of your Radarr server.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Enable if your server requires basic http authentication.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Port number that Radarr is accessible on. Radarr > Settings > General", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Radarr API Key. Radarr > Settings > General", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Path to root folder where movies will be saved. Leave blank to use Radarr default path.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "IP address or domain name of your Sonarr server.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Enable if your server requires basic http authentication.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Port number that Sonarr is accessible on. Sonarr > Settings > General", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Sonarr API Key. Sonarr > Settings > General", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Path to root folder where TV shows will be saved. Leave blank to use Sonarr default path.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
];

var radarrServer = new Server("","","",false,"","","");
// var sonarrServer = new Server();

function Server(host, port, apikey, auth, user, password, rootpath) {
	var self = this;
	this.host = host;
	this.port = port;
	this.apikey = apikey;
	this.auth = auth;
	this.user = user;
	this.password = password;
	this.rootpath = rootpath;

	this.constructBaseUrl = function () {
		var regex = new RegExp("https{0,1}:\/\/");

		if (!regex.exec(this.host)) {
			this.host = "http://" + this.host;
		}
	    if (this.port === "") {
	        return this.host;
	    } else {
	        return this.host + ":" + this.port;
	    }
	};

	this.get = function(endpoint, params) {
		return new Promise(function(resolve, reject) {
			var http = new XMLHttpRequest();
			var url = self.constructBaseUrl() + endpoint + "?" + params;

			http.open("GET", url, true);
			if (self.auth === "true") http.setRequestHeader("Authorization", "Basic " + btoa(self.user + ":" + self.password));
			http.setRequestHeader("X-Api-Key", self.apikey);

			http.onload = function() {
				if (http.status === 200) {
					var results = {
						"text": JSON.parse(http.responseText),
						"status": http.status
					};
					resolve(results);
				} else {
				  switch (http.status) {
					case 401:
					  reject("Unauthorised! Please check your API key or server authentication.");
					  break;
					case 500:
					  reject("Failed to find movie! Please check you are on a valid IMDB movie page (not TV series).");
					  break;
					default:
					  reject(Error("(" + http.status + ")" + http.statusText));
				  }
				}
			};

			http.onerror = function() {
				reject(Error("Network Error"));
			};

			http.send();
		});
	};
}

$('#radarrAuth').on('change', function () {
		$('#optRadarrAuth').toggleClass('hidden');
		radarrServer.auth = !radarrServer.auth;
});

// $('#sonarrAuth').on('change', function () {
// 		$('#optSonarrAuth').toggleClass('hidden');
// 		sonarrServer.auth = !sonarrServer.auth;
// });


$(document).ready(function(){
		restoreConfig();
		// if (apikey === null) {
		// 		$("#status").text("Before you can use Pulsarr, please enter the configuration from your Radarr server.");
		// }
    var tool_list = $('[data-toggle="tooltip"]');
    for(var i = 0; i < tool_list.length; i++){
        tool_list.eq(i).tooltip(tooltips[i]);
    }
});

$('#save').click(function() {
    $("#popup").fadeTo("fast", 0.5);
    $("#spin").spin();
    $("#page *").prop('disabled', true);
    $("#save").toggleClass("unclickable");
    readInputs();

    radarrServer.get("/api/system/status").then(function(response) {
        saveConfig();
        $("#popup").stop(true).fadeTo('fast', 1);
        $("#spin").spin(false);
    }).catch(function(error) {
        $("#status").text(error);
        $("#page *").prop('disabled', false);
        $("#save").toggleClass("unclickable");
        $("#popup").stop(true).fadeTo('fast', 1);
        $("#spin").spin(false);
    });
});

function readInputs() {
    radarrServer.host = document.getElementById('radarrHost').value.trim();
    radarrServer.port = document.getElementById('radarrPort').value.trim();
    radarrServer.apikey = document.getElementById('radarrApiKey').value.trim();
    if (radarrServer.auth){
    	radarrServer.user = document.getElementById('radarrUser').value.trim();
    	radarrServer.password = document.getElementById('radarrPassword').value.trim();
    }
	radarrServer.rootpath = document.getElementById('radarrRootPath').value.trim();
}

// function testApi(url) {
//     return new Promise(function(resolve, reject) {
//         var http = new XMLHttpRequest();
//
//         http.open("GET", url, true);
//         if (auth) http.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + password));
//         http.setRequestHeader("X-Api-Key", apikey);
//
//         http.onload = function() {
//             if (this.status === 200) {
//                 resolve(http.statusText);
//             } else {
// 							switch (http.status) {
// 								case 400:
// 									reject(Error("Failed to add movie! Please check it is not already in your collection."));
// 									break;
// 								case 401:
// 									reject("Unauthorised! Please check your API key or server authentication.");
// 									break;
// 								default:
// 									reject(Error("(" + http.status + ")" + http.statusText));
// 							}
//             }
//         };
//
//         http.onerror = function() {
//             reject(Error("Unable to communicate with server. Please check host/port."));
//         };
//
//         http.send();
//     });
// }

// function httpHost(string) {
//     var regex = new RegExp("https{0,1}:\/\/");
//
//     if (regex.exec(string)) {
//         return string;
//     } else {
//         return "http://" + string;
//     }
// }

function saveConfig() {
	localStorage.setItem("radarrConfig", JSON.stringify(radarrServer));

    $("#status").text("Sucess! Configuration saved.");
    $("#page *").prop('disabled', false);
    $("#save").toggleClass("unclickable");
    setTimeout(function() {
        $("#status").text("");
        window.close();
    }, 1500);
}

function restoreConfig() {
	if (localStorage.getItem("radarrConfig")) {
		var radarrConfig = JSON.parse(localStorage.getItem("radarrConfig"));
		radarrServer = new Server(radarrConfig.host, radarrConfig.port, radarrConfig.apikey, radarrConfig.auth, radarrConfig.user, radarrConfig.password, radarrConfig.rootpath);
	}

	$('#radarrHost').val(radarrServer.host);
	$('#radarrPort').val(radarrServer.port);
	$('#radarrApiKey').val(radarrServer.apikey);

    $('#radarrAuth').prop('checked', radarrServer.auth);
    if (radarrServer.auth) $('#optRadarrAuth').removeClass('hidden');
	$('#radarrUser').val(radarrServer.user);
	$('#radarrPassword').val(radarrServer.password);
	$('#radarrRootPath').val(radarrServer.rootpath);
}
