import { getProducts } from '@/app/actions/products'
import { Sidebar } from '@/components/sidebar'
import { ProductListClient } from './product-list-client'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] admin-theme font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 lg:ml-64">
        {/* Pass the server-fetched products into the client component */}
        <ProductListClient initialProducts={JSON.parse(JSON.stringify(products))} />
      </main>
    </div>
  )
}
