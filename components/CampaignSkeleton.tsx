export default function CampaignSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md animate-pulse">
          {/* Image Skeleton */}
          <div className="h-40 md:h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
          
          <div className="p-4 md:p-6">
            {/* Title Skeleton */}
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-3" />
            
            {/* Badges Skeleton */}
            <div className="flex gap-2 mb-3">
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-16" />
            </div>
            
            {/* Category Skeleton */}
            <div className="flex gap-2 mb-3">
              <div className="h-6 bg-gray-200 rounded-lg w-20" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
            
            {/* Progress Bar Skeleton */}
            <div className="space-y-2">
              <div className="h-2.5 bg-gray-200 rounded-full w-full" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            </div>
            
            {/* Goal Skeleton */}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
