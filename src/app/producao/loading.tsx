import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package, Play, Activity, TrendingUp } from "lucide-react";

export default function ProductionLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:ml-64 p-8">
        <div className="max-w-[1920px] mx-auto space-y-10">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-11 w-48 rounded-xl" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[Package, Play, Activity, TrendingUp].map((Icon, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-3 w-24" />
                  <div className="w-8 h-8 rounded-lg bg-slate-100" />
                </div>
                <Skeleton className="h-9 w-16" />
              </div>
            ))}
          </div>

          {/* Kanban Skeleton */}
          <Card className="border-none shadow-premium bg-slate-50/30">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-7 w-32 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex gap-5 overflow-x-auto pb-8">
                {[1, 2, 3, 4].map((col) => (
                  <div key={col} className="flex-shrink-0 w-[320px] space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="bg-slate-100/50 rounded-xl p-3 space-y-4 min-h-[500px]">
                      {[1, 2, 3].map((card) => (
                        <div key={card} className="bg-white rounded-lg border border-slate-200 p-4 space-y-4 shadow-sm">
                          <div className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <Skeleton className="h-5 w-full" />
                          <div className="flex gap-1.5">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                          <Skeleton className="h-1 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
