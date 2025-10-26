'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Active Contracts Table - العقود النشطة
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { ExternalLink, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { ActiveContract } from '@/types/finance'

interface ActiveContractsTableProps {
  contracts: ActiveContract[]
  isLoading?: boolean
}

export function ActiveContractsTable({ contracts, isLoading }: ActiveContractsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        العقود النشطة
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                رقم العقد
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                القيمة الشهرية
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                تاريخ الانتهاء
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الأيام المتبقية
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الحالة المالية
              </th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => {
              // تحديد ما إذا كان العقد قارب على الانتهاء
              const isExpiringSoon = contract.daysRemaining <= 30;
              
              return (
                <tr 
                  key={contract.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isExpiringSoon ? 'bg-yellow-50' : ''
                  }`}
                >
                  {/* رقم العقد */}
                  <td className="py-3 px-4">
                    <Link 
                      href={`/dashboard/contracts/${contract.id}`}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {contract.contractNumber}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  
                  {/* القيمة الشهرية */}
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {contract.monthlyValue.toLocaleString()} ريال
                  </td>
                  
                  {/* تاريخ الانتهاء */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                  </td>
                  
                  {/* الأيام المتبقية */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isExpiringSoon && (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        isExpiringSoon ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        {contract.daysRemaining} يوم
                      </span>
                    </div>
                  </td>
                  
                  {/* الحالة المالية */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              contract.paymentProgress >= 100 ? 'bg-green-500' :
                              contract.paymentProgress >= 75 ? 'bg-blue-500' :
                              contract.paymentProgress >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(contract.paymentProgress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                          {contract.paymentProgress.toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Status badge */}
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          contract.paymentProgress >= 100 ? 'bg-green-100 text-green-800' :
                          contract.paymentProgress >= 75 ? 'bg-blue-100 text-blue-800' :
                          contract.paymentProgress >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {contract.paymentProgress >= 100 ? 'مكتمل' :
                           contract.paymentProgress >= 50 ? 'جيد' :
                           'متأخر'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {contracts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لا توجد عقود نشطة
        </div>
      )}
    </Card>
  )
}
