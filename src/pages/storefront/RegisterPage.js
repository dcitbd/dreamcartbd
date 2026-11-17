/**
 * DREAM CART BD — CUSTOMER REGISTER PAGE (RegisterPage.js)
 * Routes customer directly to customer registration interface mapping to sheet columns A-M
 */

import { renderCustomerPortal } from '../customer/CustomerPortal.js';

export async function renderRegisterPage(params = {}) {
  return renderCustomerPortal({ ...params, subview: 'register' });
}

export default renderRegisterPage;
