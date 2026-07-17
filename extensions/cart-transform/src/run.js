// @ts-check
import {surchargeFor} from './pricing-tables';

/**
 * Cart Transform — the billed source of truth for configured pieces.
 *
 * For every line that carries a `_config` attribute (written by the storefront
 * configurator), recompute the unit price as: base variant price + surcharges
 * derived from the configuration. The result overrides whatever price the line
 * arrived with, so the client can never dictate the charge. Non-configured lines
 * are left untouched.
 *
 * @param {{cart: {lines: Array<{id: string, cost: {amountPerQuantity: {amount: string}}, config: {value: string} | null}>}}} input
 * @returns {{operations: Array<object>}}
 */
export function run(input) {
  /** @type {Array<object>} */
  const operations = [];

  for (const line of input.cart.lines) {
    const raw = line.config?.value;
    if (!raw) continue;

    let config;
    try {
      config = JSON.parse(raw);
    } catch {
      continue; // malformed — leave the line as-is rather than mis-price it
    }

    const base = Number(line.cost.amountPerQuantity.amount);
    if (!Number.isFinite(base)) continue;

    const finalUnit = base + surchargeFor(config);

    operations.push({
      update: {
        cartLineId: line.id,
        price: {
          adjustment: {
            fixedPricePerUnit: {
              amount: finalUnit.toFixed(2),
            },
          },
        },
      },
    });
  }

  return {operations};
}
