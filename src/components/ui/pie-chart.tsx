'use client'

import * as React from 'react'
import { Cell, Label, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { 
  ChartConfig, 
  ChartContainer
} from '@/components/ui/charts'

interface PieChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }
  className?: string
  config?: {
    colors: string[]
    height: number
    radius: number
    paddingAngle: number
  }
}

export function PieChart({
  data,
  className,
  config = {
    colors: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea'],
    height: 200,
    radius: 80,
    paddingAngle: 2,
  },
}: PieChartProps) {
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
            innerRadius={0}
            outerRadius={config.radius}
            paddingAngle={config.paddingAngle}
            dataKey="value"
            nameKey="name"
            label={false}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartConfig[entry.name].color}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                        style={{ fill: 'hsl(var(--foreground))', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        {totalValue}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                        style={{ fill: 'hsl(var(--muted-foreground))', fontSize: '12px' }}
                      >
                        {data.datasets[0].label || 'Total'}
                      </tspan>
                    </text>
                  )
                }
                return null
              }}
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
            iconSize={10}
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
