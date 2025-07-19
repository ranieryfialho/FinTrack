import React from 'react';

const SkeletonRow = () => (
    <tr className="border-b border-dark-border">
        <td className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-1/2"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-dark-border rounded-md w-24"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-20"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-28"></div></td>
        <td className="px-6 py-4"><div className="flex gap-4"><div className="h-4 w-4 bg-dark-border rounded-full"></div><div className="h-4 w-4 bg-dark-border rounded-full"></div></div></td>
    </tr>
);

const DashboardSkeleton = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-pulse">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 bg-dark-card rounded w-48 mb-2"></div>
          <div className="h-4 bg-dark-card rounded w-64"></div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-dark-card p-6 rounded-lg h-24"></div>
        <div className="bg-dark-card p-6 rounded-lg h-24"></div>
        <div className="bg-dark-card p-6 rounded-lg h-24"></div>
      </div>

      <div className="bg-dark-card p-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full"><div className="h-10 bg-dark-border rounded w-full"></div><div className="h-10 bg-dark-border rounded w-full"></div></div>
            <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0">
                <div className="h-10 bg-dark-border rounded w-full"></div>
                <div className="h-10 bg-dark-border rounded w-full"></div>
            </div>
        </div>
      </div>

      <div className="bg-dark-card p-6 rounded-lg">
        <div className="h-7 bg-dark-border rounded w-1/3 mb-4"></div>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="border-b border-dark-border">
                    <tr>
                        <th className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-20"></div></th>
                        <th className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-16"></div></th>
                        <th className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-24"></div></th>
                        <th className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-16"></div></th>
                        <th className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-32"></div></th>
                        <th className="px-6 py-4"><div className="h-4 bg-dark-border rounded w-12"></div></th>
                    </tr>
                </thead>
                <tbody>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;