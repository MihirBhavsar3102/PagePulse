import { Storage } from '../shared/storage';
import { Rule } from '../shared/types';
import { EMAILJS_CONFIG } from '../shared/config';

export const sendAlert = async (rule: Rule, valueFound: string | null) => {
  const state = await Storage.get();
  
  if (!state.toEmail) {
    console.error('Destination email not configured. Cannot send alert.');
    return;
  }

  if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID') {
    console.warn('EmailJS config is not set. Check src/shared/config.ts');
    return;
  }

  const data = {
    service_id: EMAILJS_CONFIG.SERVICE_ID,
    template_id: EMAILJS_CONFIG.TEMPLATE_ID,
    user_id: EMAILJS_CONFIG.PUBLIC_KEY,
    template_params: {
      to_email: state.toEmail,
      rule_name: rule.name,
      url: rule.url,
      detected_value: valueFound || 'N/A',
      timestamp: new Date().toLocaleString(),
    }
  };

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      console.log(`Alert sent for rule: ${rule.name}`);
    } else {
      console.error('EmailJS Error:', await res.text());
    }
  } catch (error) {
    console.error('Failed to send email alert', error);
  }
};
