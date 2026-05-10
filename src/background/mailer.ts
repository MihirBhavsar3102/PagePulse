import { Storage } from '../shared/storage';
import { Rule } from '../shared/types';

export const sendAlert = async (rule: Rule, valueFound: string | null) => {
  const state = await Storage.get();
  const settings = state.emailSettings;
  if (!settings || !settings.serviceId || !settings.templateId || !settings.publicKey) {
    console.error('Email settings incomplete. Cannot send alert.');
    return;
  }

  const data = {
    service_id: settings.serviceId,
    template_id: settings.templateId,
    user_id: settings.publicKey,
    template_params: {
      to_email: settings.toEmail,
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
