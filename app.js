'use-strict'

require('dotenv').config();
const https = require('https');
const http = require('http'); // WARNING: createServer without SSL for testing ONLY
const url = require('url');
const fs = require('fs');

const auth_base_url = process.env.AUTH_BASE_URL;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const token = process.env.ACCESS_TOKEN;
const redirect_uri = process.env.REDIRECT_URI;
const response_type = 'code';
const state = Math.random(); // WARNING: using weak random value for testing ONLY
const scope = 'profile w_member_social openid email';

const app = http.createServer(function (req, res) {

	let req_pathname = url.parse(req.url, true).pathname;
	let req_query = url.parse(req.url, true).query;

	let redirect_uri_pathname = (new URL(redirect_uri)).pathname;
	console.log('Request URL: ' + redirect_uri_pathname);
	// get authorization code - the server redirects to the linkedin sign-in page
	console.log(req_pathname)
	if(req_pathname == '/') {
		let auth_url = auth_base_url + '?response_type=' + response_type + '&client_id=' + client_id + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&code=' + token +  '&state=' + state + '&scope=' + encodeURIComponent(scope);
		res.writeHead(302, {'Location': auth_url})
		res.end();
	}
	// get access token - after sign-in linkedin redirects to redirect_uri_pathname
	else if(req_pathname == redirect_uri_pathname){

		let req_code = req_query.code;
		let req_state = req_query.state;
		console.log("CODE:>>", req_query.code)
		// WARNING: test req_state == state to prevent CSRF attacks

		let path_query = 
			"grant_type=authorization_code&"+
			"code=" + req_code + "&" +
			"redirect_uri=" + encodeURIComponent(redirect_uri) + "&" + // will redirect here if authentication fails
			"client_id=" + client_id + "&" +
			"client_secret=" + client_secret;

		let method = 'POST';
		let hostname = 'www.linkedin.com';
		let path = '/oauth/v2/accessToken?' + path_query;
		let headers = {
			"Content-Type": "application/x-www-form-urlencoded"
		};
		let body = '';
		_request(method, hostname, path, headers, body).then(r => {
			console.log('Response: ' + r.status);
			if(r.status == 200){
				let access_token = JSON.parse(r.body).access_token;
				let expires_in = Date.now() + (JSON.parse(r.body).expires_in * 1000); // token expiry in epoc format
				token_json = '{"access_token":"' + access_token + '","expires_in":"' + expires_in + '"}';
				fs.writeFile("./token.json", token_json, e => {if(e){console.log('ERROR - ' + e)}});
				res.writeHead(200, {'content-type': 'text/html'});
				res.write('Access token retrieved. You can close this page');
				console.log('Access token retrieved. You can stop this app listening.');
				res.end();
			}
			else {
				console.log('ERROR - ' + r.status + JSON.stringify(r.body))
				res.writeHead(r.status, {'content-type': 'text/html'});
				res.write(r.status + ' Internal Server Error');
				res.end();
			}

		}).catch(e => {
			console.log('ERROR - ' + e);
			res.writeHead(500, {'content-type': 'text/html'});
			res.write('500 Internal Server Error');
			res.end();
		});
	}

	else {
		console.log('ERROR - 404 Not found')
		res.writeHead(404, {'content-type': 'text/html'});
		res.write('404 Not Found');
		res.end();
	}
})

app.listen(3000)
app.on('error', e => console.log('Error on port ' + 3000 + ' - ' + e));
app.on('listening', () => console.log('Listening on port ' + 3000));

// https request wrapper
function _request(method, hostname, path, headers, body){
	return new Promise((resolve,reject) => {
		let reqOpts = {
			method,
			hostname,
			path,
			headers,
			"rejectUnauthorized": false // WARNING: accepting unauthorized end points for testing ONLY
		};
		let resBody = "";
		let req = https.request(reqOpts, res => {
			res.on('data', data => {
				resBody += data.toString('utf8');
			});
			res.on('end', () => {
				console.log(resBody)
				resolve({
					"status": res.statusCode, 
					"headers": res.headers, 
					"body": resBody
				})
			});
		});
		req.on('error', e => {
			reject(e);
		});
		if (method !== 'GET') {
			req.write(body);
		}
		req.end();
	})
}