import { AppState, Rule, EmailSettings } from './types';

const defaultState: AppState = {
  rules: [],
  emailSettings: null,
};

export const Storage = {
  async get(): Promise<AppState> {
    const data = await chrome.storage.local.get('appState');
    return data.appState || defaultState;
  },

  async set(state: AppState): Promise<void> {
    await chrome.storage.local.set({ appState: state });
  },

  async saveRule(rule: Rule): Promise<void> {
    const state = await this.get();
    const existingIndex = state.rules.findIndex((r) => r.id === rule.id);
    if (existingIndex >= 0) {
      state.rules[existingIndex] = rule;
    } else {
      state.rules.push(rule);
    }
    await this.set(state);
  },

  async deleteRule(id: string): Promise<void> {
    const state = await this.get();
    state.rules = state.rules.filter((r) => r.id !== id);
    await this.set(state);
  },

  async saveEmailSettings(settings: EmailSettings): Promise<void> {
    const state = await this.get();
    state.emailSettings = settings;
    await this.set(state);
  }
};
