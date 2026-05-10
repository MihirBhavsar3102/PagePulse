import { Storage } from '../shared/storage';
import { sendAlert } from './mailer';
import { Rule } from '../shared/types';

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('check-rule-')) {
    const ruleId = alarm.name.replace('check-rule-', '');
    const state = await Storage.get();
    const rule = state.rules.find((r) => r.id === ruleId);
    
    if (rule && rule.active) {
      checkRule(rule);
    }
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const state = await Storage.get();
  state.rules.forEach((rule) => {
    if (rule.active) {
      chrome.alarms.create(`check-rule-${rule.id}`, {
        periodInMinutes: rule.intervalMinutes,
      });
    }
  });
});

async function checkRule(rule: Rule) {
  try {
    const tab = await chrome.tabs.create({ url: rule.url, active: false });
    
    if (tab.id) {
      // Inject the extractor after 5s to allow SPA to render
      setTimeout(async () => {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: extractData,
            args: [rule.selector]
          });
          
          const extractedValue = results[0]?.result;
          chrome.tabs.remove(tab.id!); // Clean up tab

          handleExtractionResult(rule, extractedValue);

        } catch (err) {
          console.error('Error executing script', err);
          if (tab.id) chrome.tabs.remove(tab.id);
        }
      }, 5000);
    }
  } catch (error) {
    console.error(`Failed to check rule ${rule.name}:`, error);
  }
}

// Function serialized and run in the page context
function extractData(selector: string): Promise<string | null> {
  return new Promise((resolve) => {
    const check = () => {
      const el = document.querySelector(selector);
      if (el) resolve(el.textContent?.trim() || null);
    };
    check(); // check immediately
    
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 10000); // 10s timeout
  });
}

async function handleExtractionResult(rule: Rule, value: string | null | undefined) {
  const val = value || null;
  let match = false;
  
  if (rule.condition === 'exists') match = val !== null;
  else if (rule.condition === 'equals') match = val === rule.targetValue;
  else if (rule.condition === 'contains') match = val?.includes(rule.targetValue || '') || false;
  else if (rule.condition === 'not_equals') match = val !== rule.targetValue;

  rule.lastChecked = Date.now();

  if (match) {
    if (rule.lastValue !== val) {
      await sendAlert(rule, val);
      rule.lastMatched = Date.now();
      rule.lastValue = val;
      await Storage.saveRule(rule);
    } else {
      await Storage.saveRule(rule);
    }
  } else {
    if (rule.lastValue !== val) {
       rule.lastValue = val;
       await Storage.saveRule(rule);
    } else {
       await Storage.saveRule(rule);
    }
  }
}
