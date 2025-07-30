import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AccessWarning } from '../components/AccessWarning'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, PieLabelRenderProps
} from 'recharts'
import { Loader2 } from 'lucide-react'

interface Doc {
  id: string
  title: string
}

interface SectionAnalytics {
  sectionId: string
  sectionTitle: string
  views: number
  avgTime: number // seconds
  quiz: { pass: number; fail: number }
}

interface AnalyticsReport {
  sections: SectionAnalytics[]
}

const COLORS = ['#22d3ee', '#6366f1', '#f59e42', '#ef4444', '#10b981', '#f472b6']

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth()
  const [docs, setDocs] = useState<Doc[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string>('')
  const [report, setReport] = useState<AnalyticsReport | null>(null)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    setLoadingDocs(true)
    fetch(`/api/docs?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setDocs(data))
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoadingDocs(false))
  }, [user?.id])

  useEffect(() => {
    if (!selectedDoc) return
    setLoadingReport(true)
    setReport(null)
    setError(null)
    fetch(`/api/analytics/report?docId=${selectedDoc}`)
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoadingReport(false))
  }, [selectedDoc])

  if (user?.tier !== 'Pro') {
    return <AccessWarning tier={user?.tier === 'Admin' ? 'Admin' : 'Pro'} />
  }

  const pieLabel = ({ name, percent }: PieLabelRenderProps) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Engagement Analytics</h1>
      <div className="mb-6">
        <label className="block font-medium mb-2">Select Document</label>
        {loadingDocs ? (
          <div className="flex items-center gap-2 text-blue-600"><Loader2 className="animate-spin w-5 h-5" /> Loading documents...</div>
        ) : (
          <select
            className="w-full border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
            value={selectedDoc}
            onChange={e => setSelectedDoc(e.target.value)}
          >
            <option value="">-- Choose a document --</option>
            {docs.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.title}</option>
            ))}
          </select>
        )}
      </div>
      {loadingReport && (
        <div className="flex items-center gap-2 text-blue-600"><Loader2 className="animate-spin w-5 h-5" /> Loading analytics...</div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {report && report.sections.length === 0 && (
        <div className="text-zinc-500 text-center">No analytics data for this document.</div>
      )}
      {report && report.sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Bar Chart: Views per Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Section Views</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={report.sections}>
                <XAxis dataKey="sectionTitle" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="views" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Line Chart: Avg Time per Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Average Time per Section (sec)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={report.sections}>
                <XAxis dataKey="sectionTitle" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#22d3ee" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart: Quiz Pass/Fail */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 col-span-1 md:col-span-2">
            <h2 className="font-semibold mb-2">Quiz Pass/Fail Rates</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={report.sections.map(s => ({ name: s.sectionTitle + ' Pass', value: s.quiz.pass, color: COLORS[0] }))
                    .concat(report.sections.map(s => ({ name: s.sectionTitle + ' Fail', value: s.quiz.fail, color: COLORS[3] })))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={pieLabel}
                >
                  {report.sections.map((s) => (
                    <Cell key={s.sectionId + '-pass'} fill={COLORS[0]} />
                  ))}
                  {report.sections.map((s) => (
                    <Cell key={s.sectionId + '-fail'} fill={COLORS[3]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard 