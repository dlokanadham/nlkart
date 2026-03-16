import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap'
import { FaWallet, FaArrowUp, FaArrowDown, FaCheckCircle } from 'react-icons/fa'
import apiClient from '../api/apiClient'
import { logFlow, logInfo } from '../utils/logger'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000]

export default function Wallet() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [recharging, setRecharging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)

  useEffect(() => {
    logFlow('navigation', 'page_view', { page: '/wallet' })
    loadWallet()
  }, [])

  const loadWallet = async () => {
    try {
      const res = await apiClient.get('/wallet')
      setBalance(res.data.balance || 0)
      setTransactions(res.data.transactions || [])
    } catch {
      setError('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleRecharge = async (amount) => {
    if (!amount || amount < 100) {
      setError('Minimum recharge amount is ₹100')
      return
    }
    if (amount > 50000) {
      setError('Maximum recharge amount is ₹50,000')
      return
    }
    setError('')
    setSuccess('')
    setRecharging(true)
    logFlow('cart', 'recharge_attempt', { amount })
    try {
      const res = await apiClient.post('/wallet/recharge', { amount })
      setBalance(res.data.newBalance)
      logInfo('cart', 'recharge_success', { amount, newBalance: res.data.newBalance })
      setSuccess(`₹${amount.toFixed(2)} added to your wallet successfully!`)
      setSelectedAmount(null)
      setCustomAmount('')
      // Reload transactions
      const walletRes = await apiClient.get('/wallet')
      setTransactions(walletRes.data.transactions || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Recharge failed')
    } finally {
      setRecharging(false)
    }
  }

  const activeAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : null)

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4"><FaWallet className="me-2" />My Wallet</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          <FaCheckCircle className="me-2" />{success}
        </Alert>
      )}

      <Row>
        {/* Balance Card */}
        <Col lg={5} className="mb-4">
          <Card className="shadow border-0 bg-primary text-white">
            <Card.Body className="py-4 text-center">
              <p className="mb-1 opacity-75">Available Balance</p>
              <h1 className="display-4 fw-bold mb-0">&#8377;{balance.toFixed(2)}</h1>
              <p className="mt-2 mb-0 opacity-75"><FaWallet className="me-1" />NLKart Wallet</p>
            </Card.Body>
          </Card>

          {/* Recharge Section */}
          <Card className="mt-3 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Recharge Wallet</h5>

              {/* Quick amounts */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {QUICK_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={selectedAmount === amt ? 'primary' : 'outline-primary'}
                    onClick={() => { setSelectedAmount(amt); setCustomAmount('') }}
                    size="sm"
                  >
                    &#8377;{amt.toLocaleString()}
                  </Button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="input-group mb-3">
                <span className="input-group-text">&#8377;</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                  min="100"
                  max="50000"
                />
              </div>

              <Button
                variant="success"
                className="w-100"
                size="lg"
                disabled={!activeAmount || recharging}
                onClick={() => handleRecharge(activeAmount)}
              >
                {recharging ? (
                  <><Spinner animation="border" size="sm" className="me-2" />Processing...</>
                ) : activeAmount ? (
                  <>Add &#8377;{activeAmount.toLocaleString()} to Wallet</>
                ) : (
                  'Select an amount'
                )}
              </Button>
              <small className="text-muted d-block text-center mt-2">
                Min: &#8377;100 | Max: &#8377;50,000
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* Transaction History */}
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Transaction History</h5>
              {transactions.length === 0 ? (
                <p className="text-muted text-center py-4">No transactions yet</p>
              ) : (
                <Table hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                      <th>Date</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.transactionId}>
                        <td>
                          {txn.type === 'Credit' ? (
                            <Badge bg="success"><FaArrowUp className="me-1" />Credit</Badge>
                          ) : (
                            <Badge bg="danger"><FaArrowDown className="me-1" />Debit</Badge>
                          )}
                        </td>
                        <td className={txn.type === 'Credit' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {txn.type === 'Credit' ? '+' : '-'}&#8377;{txn.amount.toFixed(2)}
                        </td>
                        <td>&#8377;{txn.balanceAfter.toFixed(2)}</td>
                        <td>
                          <small>{new Date(txn.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}</small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {txn.orderId ? `Order #${txn.orderId}` : 'Wallet Recharge'}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
