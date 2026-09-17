export const SUPPORT = {
  COFFEE_URL: 'https://www.paypal.me/DA-COMPLETARE',
  MESSAGE: 'Tutti i corsi sono gratuiti. Se ti aiutano, offrici un caffè:'
};

export const hasCoffeeLink = SUPPORT.COFFEE_URL.startsWith('https://') && !SUPPORT.COFFEE_URL.includes('DA-COMPLETARE');
