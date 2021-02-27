# How to Get Started with Authentication
[Link back to main README](README.md)

## What do I actually HAVE to do?
To use this library, you MUST have a client_id (also known as apikey) to make unauthenticated requests. To make authenticated requests, you MUST ALSO have a refresh_token. Together, they form the basic auth object::
```json
{
    "refresh_token":"REPLACEME",
    "client_id":"EXAMPLE@AMER.OAUTHAP"
}
```

If you don't know what those fields are, then follow the guide below through step 10. After that you won't have to think about auth again until your refresh_token expires (90 days?) and you have to do steps 3b to 10 all over again.

Once you have this info, you can plug it in right in the code (see the main [README](README.md)), or you can put it in a file at ```{project_root}/config/tdaclientauth.json```.
## Let's define some terms
**Trading username and password**
: this is what you use to log in to Thinkorswim or your trading account on https://www.tdameritrade.com.

**Developer username and password**
: this is what you use to log in to https://developer.tdameritrade.com.

**Consumer Key / API Key / Client Id / OAuth User Id**
: This is a permanent key that identifies your app. THIS IS THE FIRST REQUIRED INPUT FOR THE JSON FILE. It is a long character string (30ish?), but it is commonly used in the format KEY@AMER.OAUTHAP (and is called "Client Id" in this format), so like ABC123ABC123@AMER.OAUTHAP. Some API endpoints say that you can make an unauthenticated request. In this case, you'd provide your KEY@AMER.OAUTHAP for the client_id. In this library, the input is referred to as apikey, since that is how the TDA API documentation mostly refers to it, so you'd pass it in to a method as part of the config object as config.apikey

**code**
: A long string of characters that you'll receive in the callback url from the initial auth step (step 6 below)

**refresh_token**
: You will get this during step 9 below. This is valid for 90 days. THIS IS THE SECOND REQUIRED INPUT FOR THE JSON FILE. It is used by the library to keep getting new access_tokens.

**access_token**
: This is what is sent with each authenticated API request. It typically expires after 30 minutes (though this is configurable). As long as you have your refresh_token in the proper JSON file in the config/ folder, you'll never have to worry about getting an access_token again, as this client library handles all of that for you.

## The official guide pages are here, which I'll call Off1 - Off3 (Off = Official).
Off1. https://developer.tdameritrade.com/content/authentication-faq

Off2. https://developer.tdameritrade.com/content/getting-started

Off3. https://developer.tdameritrade.com/content/simple-auth-local-apps


## Here's the TL;DR (which is still way too long)
(1) Create an account on https://developer.tdameritrade.com

(2) Navigate to My Apps and Add a New App. During setup, you'll be asked for a name and a description. The important part here is the Callback URL. For first time setup, use **(https://127.0.0.1)**

(3a) Now that you've created your app, in My Apps, you'll see your Consumer Key for your app. IF YOU ONLY PLAN TO MAKE UNAUTHENTICATED REQUESTS (like get market data), YOU CAN STOP HERE. The Consumer Key is also known as the apikey that you'll use for unauthenticated requests.

(3b) If you are continuing because you want to make authenticated requests, you'll need to urlencode your Consumer Key for the next step, so visit https://www.url-encode-decode.com/ and enter your Consumer Key, and encode it.

(4) At this point, the **Off3** link above will make sense. In your browser address bar, enter: https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2F127.0.0.1&client_id=EXAMPLE%40AMER.OAUTHAP except that you'd replace EXAMPLE with your URL ENCODED Consumer Key, so maybe that last part would look like client_id=23ALKFJ32LKJF2%40AMER.OAUTHAP

(5) You will be presented with a login screen. Log in with your TRADING ACCOUNT username and password.

(6) You will now be taken to a blank screen, but copy what is now in the browser's address bar, a SUPER long address. The last part of it will say "code=" and then have a crazy long string. Take that part (after "code="), go back to your favorite encoder/decoder site from step 3, and URLDECODE that code and save it.

### Are you confused yet? There's more!
### Now you need to get your refresh_token!

(7) Visit https://developer.tdameritrade.com/authentication/apis/post/token-0 and fill in the appropriate blanks:
```
grant_type: authorization_code
refresh_token: (leave blank)
access_type: offline
code: (PASTE IN DECODED thingy from step 6)
client_id: {Consumer Key} (e.g. EXAMPLE@AMER.OAUTHAP)
redirect_uri: {REDIRECT URI} (e.g. https://127.0.0.1)
```
(8) Click SEND on this form.

(9) The response will show up at the bottom and you will need to copy and SAVE the refresh_token somewhere, as you need it for step 10, for the JSON file.

(10) For use with this library, you must either have a file in ```{project root}/config/tdaclientauth.json``` or set the needed values in the config object with each request in your code. If the former, please copy the example file from this library's config/ folder using the below command and fill in the appropriate values:

```bash
cp ./node_modules/tda-api-client/config/tdaclientauth.json ./config/tdaclientauth.json
```

OR copy this json and replace the values with your own:
```json
{
    "refresh_token":"REPLACEME",
    "client_id":"EXAMPLE@AMER.OAUTHAP"
}
```
Otherwise, if using this in code, this will be set as config.authConfig with each request. Example:
```js
 const configGetMarketHrs = {
        market: 'OPTION',
        date: '2021-03-02',
        authConfig: {
            "refresh_token": "SrgS0QJK",
            "client_id": "P66@AMER.OAUTHAP",
        }
    };

const hrs = await tdaapiclient.markethours.getSingleMarketHours(configGetMarketHrs);
```
## DONE!!!! Sort of.....

From now on, you can either leverage the authentication javascript code in this library, either directly in your code, or indirectly every time you make a request, or you can revisit the page in step 7. Note: as long as you put the refresh_token in the correct place in the config/ folder, you'll never have to personally deal with an access_token (the one that expires every 30 minutes). You'll just have to get a new refresh_token every 90 days.

However, just in case you want to give it a go manually, here is how to get an access_token, which is a required input for most API calls:

(1) Visit the same URL as step 7 above, https://developer.tdameritrade.com/authentication/apis/post/token-0

(2) Fill in the appropriate blanks:
```
grant_type: refresh_token
refresh_token: (PUT YOUR REFRESH TOKEN HERE)
access_type: (leave blank)
code: (leave blank)
client_id: {Consumer Key} (e.g. EXAMPLE@AMER.OAUTHAP)
redirect_uri: (leave blank)
```
(3) Click SEND

(4) Copy the access_token from the response. Note that it is only good for 30 minutes.

## The Callback URL
What is this thing for? It has to be specified with Add a New App on https://developer.tdameritrade.com, but why?

When you are trying to get a new refresh_token, you have to log in to your trading account, and then you get the "code" from the URL on the next blank page. Another way this could work is if you were running a daemon app that can receive traffic. If you know the ip address of your app and you have configured an endpoint on your app, then you could use that as your redirect url.
Example: If an app is running at www.myawesomeapp.zzz, then the redirect url could be set to www.myaweseomapp.zzz/newauth and that endpoint could be configured to accept a param named "code" and boom, in business! Then, step 6 above would try to call www.myawesomeapp.zzz/newauth?code=abc123abc123
