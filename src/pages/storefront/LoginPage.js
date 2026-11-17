/**
 * DREAM CART BD — CUSTOMER LOGIN PAGE (LoginPage.js)
 * Routes customer directly to customer login interface with luxury styling
 */

import { renderCustomerPortal } from '../customer/CustomerPortal.js';

export async function renderLoginPage(params = {}) {
  return renderCustomerPortal({ ...params, subview: 'login' });
}

export default renderLoginPage;
