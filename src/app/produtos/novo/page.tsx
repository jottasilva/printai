import { Sidebar } from '@/components/sidebar'
import { ProductFormFull } from '@/components/products/product-form-full'
import { getCategories } from '@/app/actions/products'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] admin-theme font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64 bg-gradient-to-br from-slate-50 to-blue-50/20">
        <div className="max-w-5xl mx-auto">
          <ProductFormFull categories={categories} />
        </div>
      </main>
    </div>
  )
}
