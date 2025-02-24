'use client';

import { api } from '@/lib/api'
import { Pagination } from '@/components/Pagination'
import { DatasetTable } from '@/components/DatasetTable'
import { useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const ITEMS_PER_PAGE = 20

export default function Home() {
  const searchParams = useSearchParams()
  const [sortField, setSortField] = useState<string>('metadata_modified')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [datasets, setDatasets] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPage = Number(searchParams.get('page')) || 1

  const fetchDatasets = useCallback(async () => {
    try {
      console.log('Fetching datasets with params:', {
        currentPage,
        sortField,
        sortDirection
      })
      setLoading(true)
      setError(null)

      const result = await api.searchDatasets('', {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sort: `${sortField} ${sortDirection}`
      })

      console.log('API Response:', {
        total: result.total,
        datasetCount: result.datasets.length,
        firstDataset: result.datasets[0]
      })

      setDatasets(result.datasets)
      setTotal(result.total)
    } catch (error: any) {
      console.error('Error fetching datasets:', error)
      setError(error.message || 'Error al cargar los datos')
      setDatasets([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortField, sortDirection])

  useEffect(() => {
    fetchDatasets()
  }, [fetchDatasets])

  const handleSort = (field: string) => {
    setSortDirection(prev => {
      if (sortField === field) {
        return prev === 'asc' ? 'desc' : 'asc'
      }
      return 'desc'
    })
    setSortField(field)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Explorador de Datos Abiertos de Uruguay
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : datasets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron datasets
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500">
            {total} datasets encontrados
          </div>

          <DatasetTable 
            datasets={datasets}
            onSortAction={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />

          <Pagination 
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}
    </div>
  )
} 