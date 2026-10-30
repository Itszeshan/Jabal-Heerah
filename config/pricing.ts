/**
 * Starting list prices are not the shop's prices until you change these.
 * Your file data/prices.override.csv always wins over every rule here.
 *
 * markupPercent: 10 means 10% above the starting price. -5 means 5% below.
 * A brand rule wins over a category rule. The category rule wins over the global number.
 * roundTo: 0.5 rounds to the nearest half dirham. 1 rounds to the nearest dirham.
 *
 * askForPriceAll: true shows "Ask for price" (WhatsApp) instead of a price on every product
 * and turns off add to cart. Set it to false and run npm run import:catalog to show prices again.
 */
export const pricing = {
  askForPriceAll: true,
  markupPercent: 0,
  brandMarkup: {} as Record<string, number>,
  categoryMarkup: {} as Record<string, number>,
  roundTo: 0.5,
  showCompareAt: false,
};
