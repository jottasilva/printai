import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - assuming 280px or collapsed */}
      <div className="hidden lg:block w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          <div className="flex justify-start">
            <Skeleton className="h-16 w-1/3 rounded-2xl rounded-tl-none" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-1/4 rounded-2xl rounded-tr-none bg-blue-100 dark:bg-blue-900/20" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-24 w-1/2 rounded-2xl rounded-tl-none" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-16 w-1/3 rounded-2xl rounded-tr-none bg-blue-100 dark:bg-blue-900/20" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
