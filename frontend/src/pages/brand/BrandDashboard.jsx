import React from 'react';
import SEO from '../../components/SEO.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

export default function BrandDashboard() {
  // In a real app, we would fetch brand analytics using the brandApiKey
  return (
    <>
      <SEO title="Brand Portal | SkinWise" description="Brand analytics and insights." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Brand Partner Portal</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Overview of your product recommendations and audience insights.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Products Recommended</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12,450</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BarChart3 size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Conversion Rate</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">8.4%</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Audience Reach</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">45.2k</h3>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Hydrating Ceramide Cleanser', matches: 4500, category: 'Cleanser' },
                { name: 'Niacinamide 10% Serum', matches: 3200, category: 'Treatment' },
                { name: 'Ultra-Light SPF 50', matches: 2800, category: 'Sunscreen' },
              ].map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{product.name}</h4>
                    <p className="text-sm text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">{product.matches.toLocaleString()}</div>
                    <p className="text-sm text-slate-500">Matches</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
