import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSessionById, getSessionRecords } from '../api/sessions'
import ReactECharts from 'echarts-for-react'
import type { SessionRecord } from '../types/session'

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string
  unit: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  )
}

function avg(records: SessionRecord[], key: keyof SessionRecord) {
  if (records.length === 0) return 0
  const sum = records.reduce((acc, r) => acc + (r[key] as number), 0)
  return (sum / records.length).toFixed(1)
}

function max(records: SessionRecord[], key: keyof SessionRecord) {
  if (records.length === 0) return 0
  return Math.max(...records.map((r) => r[key] as number)).toFixed(1)
}

export default function SessionHistory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const session = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id!),
    enabled: !!id,
  })

  const records = useQuery({
    queryKey: ['session-records', id],
    queryFn: () => getSessionRecords(id!),
    enabled: !!id,
  })

  const allRecords = records.data?.Data ?? []
  const sessionData = session.data?.Data

  const timestamps = allRecords.map((r) => {
    const date = new Date(r.created_at.replace(' ', 'T'))
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  })

  const chartOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Water Temp', 'Air Temp', 'Humidity'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timestamps,
      axisLabel: {
        fontSize: 10,
        rotate: 30,
        interval: Math.floor(allRecords.length / 10),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10 },
    },
    series: [
      {
        name: 'Water Temp',
        type: 'line',
        data: allRecords.map((r) => r.water_temp),
        smooth: true,
        color: '#3b82f6',
        showSymbol: false,
      },
      {
        name: 'Air Temp',
        type: 'line',
        data: allRecords.map((r) => r.air_temp),
        smooth: true,
        color: '#f97316',
        showSymbol: false,
      },
      {
        name: 'Humidity',
        type: 'line',
        data: allRecords.map((r) => r.humidity),
        smooth: true,
        color: '#a855f7',
        showSymbol: false,
      },
    ],
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/sessions')}
            className="text-xs text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1"
          >
            ← Back to Sessions
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Session History</h2>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{id}</p>
        </div>
        {sessionData && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Fabric type</p>
            <p className="text-sm font-medium text-gray-700 capitalize">{sessionData.fabric_type}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Avg Water Temp"
          value={String(avg(allRecords, 'water_temp'))}
          unit="°C"
          color="text-blue-600"
        />
        <StatCard
          label="Avg Air Temp"
          value={String(avg(allRecords, 'air_temp'))}
          unit="°C"
          color="text-orange-500"
        />
        <StatCard
          label="Avg Humidity"
          value={String(avg(allRecords, 'humidity'))}
          unit="%"
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Peak Water Temp"
          value={String(max(allRecords, 'water_temp'))}
          unit="°C"
          color="text-blue-400"
        />
        <StatCard
          label="Peak Air Temp"
          value={String(max(allRecords, 'air_temp'))}
          unit="°C"
          color="text-orange-400"
        />
        <StatCard
          label="Total Readings"
          value={String(allRecords.length)}
          unit="pts"
          color="text-gray-600"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Telemetry Over Time</h3>
        {records.isLoading && (
          <p className="text-sm text-gray-400 text-center py-16">Loading records...</p>
        )}
        {!records.isLoading && allRecords.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">No records for this session</p>
        )}
        {allRecords.length > 0 && (
          <ReactECharts
            option={chartOption}
            style={{ height: '320px' }}
          />
        )}
      </div>

    </div>
  )
}