import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addAccount, getAccounts, updateAccount, deleteAccount } from '../services/api'
import { motion } from 'framer-motion'
import { PlusCircle, LogOut, CreditCard, Edit, Trash2,BarChart} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const Dashboard = () => {
  const [accountName, setAccountName] = useState('')
  const [balance, setBalance] = useState('')
  const [accounts, setAccounts] = useState([])
  const [error, setError] = useState('')
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
    displayAccounts()
  }, [navigate])

  const displayAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response)
      setError('')
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the accounts')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        // Update account
        await updateAccount(editingAccount._id, accountName, parseFloat(balance))
        setIsEditing(false)
        setEditingAccount(null)
      } else {
        // Add account
        const response = await addAccount(accountName, parseFloat(balance))
        setAccounts(response.accounts)
      }
      setAccountName('')
      setBalance('')
      setError('')
      setIsAddAccountOpen(false)
      displayAccounts()
    } catch (err) {
      setError(err.message || 'An error occurred while managing the account')
    }
  }

  const handleEdit = (account) => {
    setIsEditing(true)
    setEditingAccount(account)
    setAccountName(account.account_name)
    setBalance(account.balance.toFixed(2))
    setIsAddAccountOpen(true)
  }

  const handleDelete = async (accountId) => {
    try {
      await deleteAccount(accountId)
      const updatedAccounts = accounts.filter(account => account._id !== accountId)
      setAccounts(updatedAccounts)
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the account')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  const handleCardClick = (accountId) => {
    navigate(`/transactions/${accountId}`)
  }

  const handleAnalytics = (accountId) => {
    navigate(`/analytics/${accountId}`)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-64 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-2xl capitalize">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-6 w-6" />
                      {account.account_name}
                    </div>
                    <div className="flex">
                      <Button onClick={() => handleEdit(account)} variant="ghost" size="icon">
                        <Edit className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </Button>
                      <Button onClick={() => handleDelete(account._id)} variant="ghost" size="icon">
                        <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mt-4">₹{account.balance.toFixed(2)}</p>
                  <div className="flex justify-between mt-4">
                    <Button onClick={() => handleCardClick(account._id)} variant="outline">
                      View Transactions
                    </Button>
                    <Button onClick={() => handleAnalytics(account._id)} variant="outline">
                      <BarChart className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: accounts.length * 0.1 }}
          >
            <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
              <DialogTrigger asChild>
                <Card className="h-64 cursor-pointer hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center group">
                  <CardContent className="flex flex-col items-center justify-center">
                    <PlusCircle className=" h-16 w-16 text-gray-400 group-hover:text-gray-600" />
                    <p className="mt-4 text-xl font-semibold text-gray-400 group-hover:text-gray-600">
                      Add New Account
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? 'Update the details for this account.'
                      : 'Enter the details for your new account.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="accountName" className="text-sm font-medium text-gray-700 block mb-2">
                      Account Name
                    </label>
                    <Input
                      type="text"
                      id="accountName"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="balance" className="text-sm font-medium text-gray-700 block mb-2">
                      Balance
                    </label>
                    <Input
                      type="number"
                      id="balance"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      step="0.01"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isEditing ? 'Update Account' : 'Add Account'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
