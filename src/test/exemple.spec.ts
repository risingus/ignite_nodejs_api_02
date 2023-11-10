import { beforeAll, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'

beforeAll(async () => {
  await app.ready()
})

it('User can create a new transaction', async () => {
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'new transaction',
      amount: 500,
      type: 'credit',
    })
    .expect(201)
})

it('should be able to list all transactions', async () => {
  const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new transaction',
      amount: 500,
      type: 'credit',
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  const listTransactionsResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

  expect(listTransactionsResponse.body.transactions).toEqual([
    expect.objectContaining({
      title: 'new transaction',
      amount: 500,
    }),
  ])
})

it('should be able to get a specific transaction', async () => {
  const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new transaction',
      amount: 500,
      type: 'credit',
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  const listTransactionsResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

  const transactionId = listTransactionsResponse.body.transactions[0].id

  const getTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies)
    .expect(200)

  expect(getTransactionResponse.body).toEqual(
    expect.objectContaining({
      title: 'new transaction',
      amount: 500,
    }),
  )
})

it('should be able to get the summary', async () => {
  const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'credit transaction',
      amount: 3000,
      type: 'credit',
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  await request(app.server).post('/transactions').set('Cookie', cookies).send({
    title: 'debit transaction',
    amount: 1000,
    type: 'debit',
  })

  const summaryResponse = await request(app.server)
    .get('/transactions/summary')
    .set('Cookie', cookies)
    .expect(200)

  expect(summaryResponse.body.amount).toEqual(2000)
})
