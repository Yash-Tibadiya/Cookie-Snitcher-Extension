# Chrome Extension for Cookie Collection - "Cookie Snitcher"

## Overview

This extension will capture cookies from the active tab in Chrome, send them to the Next.js application's API backend, and this backend will store them in a database along with the active tab's URL and tab ID. Below are the steps to create the extension.

## Sections

### 1. Setting Up the Chrome Extension

1. Create a `manifest.json` file that defines the extension.
2. Set permissions to access the active tab and cookies.
3. Implement a background script to fetch the cookies using `chrome.cookies` API.
4. Send the collected cookies, tab URL, and tab ID to the Next.js application's API backend using a fetch API.

### 2. Accessing Cookies from the Active Tab

1. Use the `chrome.cookies.getAll()` function to retrieve all cookies for the active tab.
2. Extract details like cookie name, value, domain, etc.
3. Send these details along with the active tab’s URL and ID to the Next.js application's API backend.

### 3. Setting Permissions

1. In the `manifest.json`, define the necessary permissions:
   - `"cookies"`
   - `"activeTab"`
   - `"storage"`
2. Add the necessary permissions for interacting with the browser’s cookies.

### 4. Sending Data to Backend

1. Use the `axios` library to send a POST request to the Next.js application's API backend with the cookies, tab URL, and ID.
2. Send data in below given JSON format, including IP address and site URL.
3. Ensure data is sent in a secure manner.

---

## Libraries

- `chrome.cookies` API
- `axios` for backend requests
- `chrome.runtime` for background processes

---

## References

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## json format of all cookies

```
[
    {
        "domain": "chatgpt.com",
        "expirationDate": 1746614838.656656,
        "hostOnly": true,
        "httpOnly": true,
        "name": "conv_key",
        "path": "/",
        "sameSite": "strict",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": ".chatgpt.com",
        "expirationDate": 1754390073.715147,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-next-auth.session-token",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": "chatgpt.com",
        "expirationDate": 1746615169.927611,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__cflb",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": ".chatgpt.com",
        "expirationDate": 1746615873.71543,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cf_bm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": ".chatgpt.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "_cfuvid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": ".chatgpt.com",
        "expirationDate": 1778150075.527464,
        "hostOnly": false,
        "httpOnly": false,
        "name": "oai-sc",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": "chatgpt.com",
        "expirationDate": 1746614839.657213,
        "hostOnly": true,
        "httpOnly": true,
        "name": "_uasid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": "chatgpt.com",
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Host-next-auth.csrf-token",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": true,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": "chatgpt.com",
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Secure-next-auth.callback-url",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": true,
        "storeId": null,
        "value": "..."
    },
    {
        "domain": "chatgpt.com",
        "expirationDate": 1746614839.657708,
        "hostOnly": true,
        "httpOnly": true,
        "name": "_umsid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "..."
    }
]
```
