// background.js

import { checkServerStatus } from "./server-status.js";

const API_ENDPOINT = "http://localhost:3000/api/cookies"; // Replace with your actual API endpoint if different
let isServerRunning = false;

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

// Helper function to retry a failed request
async function fetchWithRetry(url, options, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(
        `Cookie Snitcher: Attempt ${
          attempt + 1
        } failed. Retrying in ${delay}ms...`
      );
      lastError = error;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay *= 2;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
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

  // Check if server is running before attempting to send data
  isServerRunning = await checkServerStatus();
  if (!isServerRunning) {
    console.warn(
      "Cookie Snitcher: Server is not running. Cookies will not be sent."
    );
    return;
  }

  try {
    // Get all cookies for the current tab's URL
    const cookies = await chrome.cookies.getAll({ url: tab.url });
    console.log(
      `Cookie Snitcher: Fetched ${cookies.length} cookies for ${tab.url}`
    );

    if (cookies.length > 0) {
      // Directly send the cookies array to the API endpoint
      // The cookies from chrome.cookies.getAll() are already in JSON format
      // matching your required structure
      console.log("Cookie Snitcher: Sending cookies to backend:", cookies);

      // Log JSON string before sending
      console.log(
        "Cookie Snitcher: JSON to be sent:",
        JSON.stringify(cookies, null, 2)
      );

      const response = await fetchWithRetry(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cookies),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(
          "Cookie Snitcher: Cookies sent successfully to backend.",
          responseData
        );
      } else {
        let errorText = "";
        try {
          // Try to parse as JSON first
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch (e) {
          // If not JSON, get as text
          errorText = await response.text();
        }
        console.error(
          `Cookie Snitcher: Failed to send cookies. Status: ${response.status}`,
          errorText
        );

        // Additional debugging for common errors
        if (response.status === 404) {
          console.error(
            "Cookie Snitcher: API endpoint not found. Make sure the server is running at http://localhost:3000"
          );
        } else if (response.status === 500) {
          console.error(
            "Cookie Snitcher: Server error. Check the server logs for more details."
          );
        }
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