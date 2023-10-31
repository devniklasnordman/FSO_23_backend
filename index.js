require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(cors())

morgan.token('req-body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return '-'
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body '))


let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
]

// Get front page
app.get('/', (req, res) => {
    indexPath = path.join(__dirname, 'public', 'index.html')
    res.sendFile(indexPath)
})
  
// Get all persons
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
})

// Get single person
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
})

// Get info page
app.get('/info', (req, res) => {
    const personAmount = persons.length
    const timeStamp = new Date()
    res.send(`Phonebook has info for ${personAmount} people <br>${timeStamp}`)
})

// Delete person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

// Generate new id, max value 1000
const generateId = () => {
    const newId = Math.floor(Math.random() * 1000)
    return newId
  }

// Add new person
app.post('/api/persons', (request, response) => {
    const body = request.body
    const phoneNumber = Number(body.number)
    const nameOnList = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())

    // Error handling, missing name or number
    if (!body.name || !body.number) {
      console.log('Error: Name or number missing')
        return response.status(400).json({ 
            error: 'Name or number missing' 
          })
    }
    // Error handling, name already in phonebook
    if (nameOnList) {
      console.log('Error: Name already in Phonebook')
        return response.status(400).json({ 
            error: 'Name already in Phonebook' 
          })
    }

    // Create person object
    const person = {
        name: body.name,
        number: phoneNumber,
        id: generateId(),
      }

    persons.push(person)
    console.log('New person added:', person)
    response.json(person)
})
  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})