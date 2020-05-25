import Store from 'electron-store';

export const store = new Store();

export const displayQuickStart = () : boolean => {
  return !store.get('quick_start') && process.platform === 'darwin';
}
