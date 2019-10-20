# Share on LinkedIn - Node.js

Automated posting on LinkedIn is possible via the *Share on LinkedIn API*. The LinkedIn API uses OAuth 2.0 to generate an *Access Token* that can then be used as the header of an HTTP request to post on LinkedIn.

The *Share on LinkedIn* API is limited for anyone that is not a LinkedIn developer "Partner", e.g. not allowed to use 2-legged OAuth, not allowed to access the "media" controller/endpoint, etc...

For this repository, I assumed a good number of people would want to get straight to the point and understand how to operate the Linked Share API. Therefore, I have written a minimalistic implementation omitting errors handling, security and best practice of coding.

#### Step 1 | Register the app in LinkedIn Developer Network

- Go to [LinkedIn Developer](https://www.linkedin.com/developers/) Network and create an app;
- Set an authorized redirect URL, e.g. http://localhost:3000/auth;
- *Test University* can be used as the company associated with the app without verification;
- Copy the *Client ID* and *Client Secret* keys.

#### Step 2 | Get Access Token via 3-legged OAuth

Start the webserver:

    node app.js

- The app directs the browser to the LinkedIn's OAuth 2.0 authorization page and request sign-in;
- After authentication, LinkedIn's authorization server passes an *Authorization Code* to the app;
- The app sends this code to LinkedIn in return for an *Access token*;

The *Access token* is valid for 60 days, i.e. you'll be able to programmatically post on LinkedIn for at most 60 days without manual intervention. At the time of writing, LinkedIn supports programmatic refresh tokens and many other things only for a limited set of partners on a case-by-case basis.


#### Step 3 | Use the Access Token to post on LinkedIn

Publish content on LinkedIn with a simple HTTP POST request having the *Access Token* in the header.

    node example.js