import { getProductionItems } from './src/app/actions/production';
import { getTenantId } from './src/lib/server-utils';

async function run() {
  try {
    const auth = await getTenantId();
    console.log("Tenant:", auth.tenantId);
    
    // Test production items
    const items = await getProductionItems(undefined, auth.tenantId);
    console.log("Items found:", items.length);
    
    // Check first item for unexpected nulls
    if (items.length > 0) {
      console.log("First item sample:", JSON.stringify(items[0]).slice(0, 500));
    }
  } catch (err) {
    console.error("Error calling getProductionItems:", err);
  }
}

run();
