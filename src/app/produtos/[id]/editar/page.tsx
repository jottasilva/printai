import { Sidebar } from '@/components/sidebar'
import { ProductFormFull } from '@/components/products/product-form-full'
import { getProductById, getCategories } from '@/app/actions/products'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories()
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] admin-theme font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64 bg-gradient-to-br from-slate-50 to-blue-50/20">
        <div className="max-w-5xl mx-auto">
          <ProductFormFull initialData={JSON.parse(JSON.stringify(product))} categories={categories} />
        </div>
      </main>
    </div>
  )
}
