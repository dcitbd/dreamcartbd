/**
 * DREAM CART BD — Combined Product Management Re-Exporter (adminProducts.js)
 */
import { renderProductCatalogModule } from './adminProductCatalog.js';
import { renderAddProductModule } from './adminAddProduct.js';
import { renderCategoryBrandModule } from './adminCategoryBrand.js';
import { renderBulkToolsModule } from './adminBulkTools.js';
import { renderLandingCmsModule } from './adminLandingCms.js';

export function renderProductsModule(props) {
  return [
    renderProductCatalogModule(props),
    renderAddProductModule(props),
    renderCategoryBrandModule(props),
    renderBulkToolsModule(props),
    renderLandingCmsModule(props)
  ].join('\n');
}
