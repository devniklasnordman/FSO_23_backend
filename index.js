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

// Get info page
app.get('/info', (req, res) => {
  console.log('Handling /info route')
  Person.countDocuments({})
    .then(count => {
      const timeStamp = new Date()
      res.send(`Phonebook has info for ${count} people <br>${timeStamp}`)
    })
    .catch('info page error')
})

// Get front page
app.get('/', (req, res) => {
    console.log('Handling / route')
    indexPath = path.join(__dirname, 'public', 'index.html')
    res.sendFile(indexPath)
})
  
// Get all persons
app.get('/api/persons', (req, res, next) => {
    Person.find({})
      .then(persons => {
        if (persons) {
          res.json(persons)
        } else {
          res.status(404).end()
        }
      })
      .catch(error => next(error))
})

// Get single person
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (person) {
            response.json(person)
          } else {
            response.status(404).end()
          }
      })
})
  



// Delete person
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findOneAndDelete({ _id: id})
      .then(result => {
        if(result) {
          response.status(204).end()
        } else {
          response.status(404).send({ error: 'Person not found'})
        }
      })
      .catch(error => next(error))
  })

// Generate new id, max value 1000
const generateId = () => {
    const newId = Math.floor(Math.random() * 1000)
    return newId
  }

// Add new person
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const phoneNumber = Number(body.number)

    // Error handling, missing name or number
    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'Name or number missing'})
    }
    // Check for existing name in phonebook
    Person.findOne({ name: body.name })
      .then(existingPerson => {
        if (existingPerson) {
          return response.status(400).json({ error: 'Name already exist in Phonebook'})
        }
      
        // Create person object
        const person = new Person({
            name: body.name,
            number: phoneNumber
          })

        person.save()
          .then(savedPerson => {
            console.log('New person added:', savedPerson)
            response.json(savedPerson)
          })
          .catch(error => next(error))
       })
       .catch.error(error => next(error))
})

// Update number of an existing person in Phonebook
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)
  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})