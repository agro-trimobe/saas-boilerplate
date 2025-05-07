'use client'

import * as React from 'react'
import { Cell, Label, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { 
  ChartConfig, 
  ChartContainer
} from '@/components/ui/charts'

interface DoughnutChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      total: number
    }[]
  }
  className?: string
  config?: {
    colors: string[]
    height: number
    innerRadius: number
    outerRadius: number
    paddingAngle: number
  }
}

export function DoughnutChart({
  data,
  className,
  config = {
    colors: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea'],
    height: 260,
    innerRadius: 50,
    outerRadius: 90,
    paddingAngle: 2,
  },
}: DoughnutChartProps) {
  // Transformar os dados para o formato esperado pelo Recharts
  const chartData = React.useMemo(() => {
    return data.labels.map((label, index) => ({
      name: label,
      value: data.datasets[0].data[index],
    }))
  }, [data])

  // Calcular o valor total para exibir no centro
  const totalValue = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  // Configuração do gráfico
  const chartConfig = React.useMemo(() => {
    const defaultColors = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea'];
    const chartColors = config.colors || defaultColors;
    
    return data.labels.reduce((acc, label, index) => {
      return {
        ...acc,
        [label]: {
          label,
          color: chartColors[index % chartColors.length]
        },
      }
    }, {} as ChartConfig)
  }, [data.labels, config.colors])

  return (
    <ChartContainer config={chartConfig} className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height={config.height}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            paddingAngle={config.paddingAngle}
            dataKey="value"
            nameKey="name"
            label={false}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={config.colors[index % config.colors.length]}
              />
            ))}
            <Label
              content={(props) => {
                const { cx, cy } = props.viewBox as { cx: number; cy: number }
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="recharts-text recharts-label"
                    fontSize="20px"
                    fontWeight="bold"
                  >
                    {data.datasets[0]?.total || totalValue}
                  </text>
                )
              }}
              position="center"
            />
          </Pie>
          
          {/* Tooltip e legenda */}
          <Tooltip 
            formatter={(value: number, name: string) => {
              return [value, name]
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            layout="horizontal"
            iconSize={12}
            wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
