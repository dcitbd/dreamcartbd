/**
 * DREAM CART BD — REGISTER PAGE (RegisterPage.js)
 * Routes customer directly to customer registration interface
 */

import { renderCustomerPortal } from '../customer/CustomerPortal.js';

export async function renderRegisterPage(params = {}) {
  return renderCustomerPortal({ ...params, subview: 'register' });
}
