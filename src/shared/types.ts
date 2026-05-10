export interface Rule {
  id: string;
  name: string;
  url: string;
  selector: string;
  condition: 'equals' | 'contains' | 'not_equals' | 'exists';
  targetValue?: string;
  intervalMinutes: number;
  active: boolean;
  lastChecked?: number;
  lastMatched?: number;
  lastValue?: string | null;
}

export interface EmailSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
  toEmail: string;
}

export interface AppState {
  rules: Rule[];
  emailSettings: EmailSettings | null;
}
