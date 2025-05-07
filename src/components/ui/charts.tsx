'use client'

import * as React from 'react'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { cn } from '@/lib/utils'

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
  children: React.ReactElement
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartProps) {
  // Cria variáveis CSS para as cores do gráfico
  React.useEffect(() => {
    if (!config) return

    Object.entries(config).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value.color)
    })

    return () => {
      if (!config) return
      Object.keys(config).forEach((key) => {
        document.documentElement.style.removeProperty(`--color-${key}`)
      })
    }
  }, [config])

  return (
    <div className={cn('w-full', className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

// Componente de BarChart
export function BarChart({
  data,
  className,
  config = {
    colors: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea'],
    height: 260,
    barSize: 25,
    barGap: 5,
  }
}: { 
  data: any; 
  className?: string; 
  config?: any 
}) {
  const chartConfig = React.useMemo(() => {
    return data.datasets.reduce((config: ChartConfig, dataset: any, index: number) => {
      const key = dataset.label
      return {
        ...config,
        [key]: {
          label: key,
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        },
      }
    }, {})
  }, [data])

  const chartData = React.useMemo(() => {
    return data.labels.map((label: string, index: number) => ({
      name: label,
      ...data.datasets.reduce((values: Record<string, number>, dataset: any) => {
        values[dataset.label] = dataset.data[index]
        return values
      }, {}),
    }))
  }, [data])

  return (
    <ChartContainer config={chartConfig} className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height={config.height}>
        <RechartsBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barSize={config.barSize}
          barGap={config.barGap}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              return [value, name]
            }}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Legend 
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            iconSize={12}
            wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
          />
          {data.datasets.map((dataset: any, index: number) => (
            <Bar 
              key={dataset.label} 
              dataKey={dataset.label}
              fill={config.colors[index % config.colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Componente de LineChart
export function LineChart({
  data,
  options = {}
}: { 
  data: any; 
  options?: any 
}) {
  const config = React.useMemo(() => {
    const keys = data.datasets.map((dataset: any) => dataset.label)
    return keys.reduce((acc: ChartConfig, key: string, index: number) => {
      const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
      ]
      acc[key] = {
        label: key,
        color: colors[index % colors.length]
      }
      return acc
    }, {})
  }, [data])

  const chartData = React.useMemo(() => {
    return data.labels.map((label: string, index: number) => {
      const item: Record<string, any> = { name: label }
      data.datasets.forEach((dataset: any) => {
        item[dataset.label] = dataset.data[index]
      })
      return item
    })
  }, [data])

  return (
    <ChartContainer config={config} className="h-80">
      <RechartsLineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => {
            return [value, config[name]?.label || name]
          }}
        />
        <Legend />
        {data.datasets.map((dataset: any, index: number) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={`var(--color-${dataset.label})`}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}
