import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '../services/api'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ArrowLeft, Plus, Edit, Trash2, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date())
  const [isEditing, setIsEditing] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    type: '-',
    month: '-',
    year: '-',
  })
  const { accountId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
  }, [accountId])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions(accountId)
      setTransactions(response)
      setError('')
    } catch (err) {
      setError(err.message || 'An error occurred while fetching transactions')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userId = localStorage.getItem('userId')
      if (isEditing) {
        await updateTransaction({
          userId,
          accountId,
          amount: parseFloat(amount),
          type,
          category,
          description,
          date: new Date(date).toISOString(),
          transactionId: editingTransaction._id,
        })
        setIsEditing(false)
        setEditingTransaction(null)
      } else {
        await addTransaction({
          userId,
          accountId,
          amount: parseFloat(amount),
          type,
          category,
          description,
          date: new Date(date).toISOString(),
        })
      }
      setAmount('')
      setType('')
      setCategory('')
      setDescription('')
      setDate('')
      fetchTransactions()
    } catch (err) {
      setError(err.message || 'An error occurred while adding the transaction')
    }
  }

  const groupTransactionsByMonth = (transactions) => {
    const grouped = {}

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      const monthYear = format(transactionDate, "MMMM yyyy")
  
      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          transactions: [],
          totalCredit: 0,
          totalDebit: 0,
        }
      }
  
      grouped[monthYear].transactions.push(transaction)
  
      if (transaction.type === "credit" || transaction.type === "to_give") {
        grouped[monthYear].totalCredit += transaction.amount
      } else if (transaction.type === "debit" || transaction.type === "to_take") {
        grouped[monthYear].totalDebit += transaction.amount
      }
    })
  
    return grouped
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    if (filters.type && filters.type !== "-") {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    if (filters.month && filters.month !== "-") {
      filtered = filtered.filter(t => {
        const transactionMonth = new Date(t.date).getMonth()
        return transactionMonth === parseInt(filters.month) - 1
      })
    }

    if (filters.year && filters.year !== "-") {
      filtered = filtered.filter(t => {
        const transactionYear = new Date(t.date).getFullYear()
        return transactionYear === parseInt(filters.year)
      })
    }

    if (filters.category && filters.category !== "-") {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    setFilteredTransactions(filtered)
  }

  const groupedTransactions = groupTransactionsByMonth(filteredTransactions)

  const handleEdit = (transaction) => {
    setIsEditing(true)
    setEditingTransaction(transaction)
    setAmount(transaction.amount)
    setType(transaction.type)
    setCategory(transaction.category)
    setDescription(transaction.description)
    setDate(transaction.date)
  }

  const handleDelete = async (transactionId) => {
    try {
      await deleteTransaction(transactionId)
      fetchTransactions()
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the transaction')
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 flex-col sm:flex-row">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4 self-start">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
        </div>
      
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <Input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    step="0.01"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="to_take">To Take</SelectItem>
                      <SelectItem value="to_give">To Give</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                      <SelectItem value="health">Health & Fitness</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                   <PopoverTrigger asChild>
                     <Button
                       variant={"outline"}
                       className={cn(
                         "w-full justify-start text-left font-normal",
                         !date && "text-muted-foreground"
                       )}
                       onClick={() => setIsPopoverOpen(true)}
                     >
                       <CalendarIcon />
                       {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0">
                     <Calendar
                       mode="single"
                       selected={date}
                       onSelect={(selectedDate) => {
                        setDate(selectedDate); 
                        setIsPopoverOpen(false);
                      }}
                       initialFocus
                     />
                   </PopoverContent>
                 </Popover>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Enter description"
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> {isEditing ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </form>
          </CardContent>
        </Card>
       
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">All</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="to_take">To Take</SelectItem>
                    <SelectItem value="to_give">To Give</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <Select value={filters.month} onValueChange={(value) => setFilters({...filters, month: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">All</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {format(new Date(2000, month - 1, 1), 'MMMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Select value={filters.year} onValueChange={(value) => setFilters({...filters, year: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">All</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">All</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                  <SelectItem value="health">Health & Fitness</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 capitalize">
          {Object.keys(groupedTransactions).map((monthYear, index) => {
            const { transactions, totalCredit, totalDebit } = groupedTransactions[monthYear]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              > 
                <div key={monthYear}>
                  <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-2">
                    {monthYear}
                    <span className="text-sm sm:ml-4 text-gray-600 block sm:inline-block">
                      (Credit: ₹{totalCredit.toFixed(2)}, Debit: ₹{totalDebit.toFixed(2)})
                    </span>
                  </h2>
                  {transactions.map((transaction) => (
                    <Card key={transaction._id}>
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="flex justify-between items-center text-md sm:text-xl">
                          <span>{transaction.description}</span>
                          <span
                            className={
                              transaction.type === "credit" || transaction.type === "to_give"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.type === "credit" || transaction.type === "to_give" ? "+" : "-"}₹
                            {Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm text-gray-500 items-center">
                          <span className="flex">{transaction.type}</span>
                          <div className="flex items-center">
                            <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
                            <span className="flex">
                              <Button onClick={() => handleEdit(transaction)} variant="ghost" size="icon">
                                <Edit className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                              </Button>
                              <Button onClick={() => handleDelete(transaction._id)} variant="ghost" size="icon">
                                <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
                              </Button>
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No transactions found for this account.</p>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory

