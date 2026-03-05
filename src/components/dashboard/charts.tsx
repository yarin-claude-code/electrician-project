'use client'

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CHART_LINE_COLOR = '#1B3A5C'
const CHART_GRID_COLOR = '#e2e8f0'
const CHART_FAIL_COLOR = '#dc2626'
const CHART_WARN_COLOR = '#f59e0b'

const CHART_HEIGHT = 220
const INNER_RADIUS = 55
const OUTER_RADIUS = 85
const PADDING_ANGLE = 3

interface DashboardChartsProps {
  statusData: { name: string; value: number; color: string }[]
  categoryData: { category: string; count: number }[]
  monthlyData: { month: string; count: number }[]
  topDefects: { defect: string; count: number }[]
}

const DashboardCharts = ({
  statusData,
  categoryData,
  monthlyData,
  topDefects,
}: DashboardChartsProps): React.ReactElement => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pass/Fail donut */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">סטטוס בדיקות</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={INNER_RADIUS}
                outerRadius={OUTER_RADIUS}
                paddingAngle={PADDING_ANGLE}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, '']} />
              <Legend
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly line chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">בדיקות לפי חודש</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke={CHART_LINE_COLOR}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_LINE_COLOR }}
                name="בדיקות"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Failures by category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">כשלים לפי קטגוריה</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_FAIL_COLOR} radius={[0, 4, 4, 0]} name="כשלים" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top defects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">10 ליקויים נפוצים</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart
              data={topDefects.slice(0, 10)}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="defect" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_WARN_COLOR} radius={[0, 4, 4, 0]} name="כמות" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCharts
