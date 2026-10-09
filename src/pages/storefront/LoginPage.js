/**
 * DREAM CART BD — LOGIN PAGE (LoginPage.js)
 * Routes customer directly to customer login interface
 */

import { renderCustomerPortal } from '../customer/CustomerPortal.js';

export async function renderLoginPage(params = {}) {
  return renderCustomerPortal({ ...params, subview: 'login' });
}
