import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTransactions } from '../services/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PiggyBank, Calendar } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Analytics = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState('month')
  const { accountId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
  }, [accountId])

  useEffect(() => {
    filterTransactionsByTimeframe()
  }, [transactions, timeframe])

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions(accountId)
      setTransactions(response)
      setError('')
    } catch (err) {
      setError(err.message || 'An error occurred while fetching transactions')
    }
  }

  const filterTransactionsByTimeframe = () => {
    const now = new Date();
    let startDate, endDate;
  
    switch (timeframe) {
      case 'week':
        startDate = subDays(now, 7);
        endDate = now;
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now); 
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now); 
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  
    const filtered = transactions.filter(t =>
      isWithinInterval(new Date(t.date), { start: startDate, end: endDate })
    );
    setFilteredTransactions(filtered);
  };
  

  const getSummaryData = () => {
    const totalIncome = filteredTransactions.reduce((sum, t) => 
      t.type === 'credit' ? sum + t.amount : sum, 0
    )
    const totalExpenses = filteredTransactions.reduce((sum, t) => 
      t.type === 'debit' ? sum + t.amount : sum, 0
    )
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    return { totalIncome, totalExpenses, balance, savingsRate }
  }

  const getIncomeExpenseData = () => {
    const data = []
    const dateSet = new Set()

    filteredTransactions.forEach(t => {
      const date = format(new Date(t.date), 'MMM dd')
      if (!dateSet.has(date)) {
        dateSet.add(date)
        data.push({ date, income: 0, expense: 0 })
      }
      const index = data.findIndex(item => item.date === date)
      if (t.type === 'credit' || t.type === 'to_give') {
        data[index].income += t.amount
      } else if (t.type === 'debit' || t.type === 'to_take') {
        data[index].expense += t.amount
      }
    })

    return data.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getCategoryData = () => {
    const categoryData = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'debit') {
        if (!acc[t.category]) acc[t.category] = 0
        acc[t.category] += t.amount
      }
      return acc
    }, {})
    
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value)
  }

  const getTakeGiveData = () => {
    const takeGiveData = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'to_take' || t.type === 'to_give') {
        acc[t.type] = (acc[t.type] || 0) + t.amount
      }
      return acc
    }, {})

    return Object.entries(takeGiveData).map(([name, value]) => ({
      name: name === 'to_take' ? 'To Take' : 'To Give',
      value
    }))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const { totalIncome, totalExpenses, balance, savingsRate } = getSummaryData()

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{balance.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savingsRate.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income and Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getIncomeExpenseData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#82ca9d" name="Income" />
                  <Bar dataKey="expense" fill="#8884d8" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>To Take and To Give</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getTakeGiveData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getTakeGiveData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Analytics

