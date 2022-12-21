const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const morganBody = require('morgan-body')
const morgan = require('morgan')

// Mongoose
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

morganBody(app)


// let persons = [
//     {
//         id: 1,
//         name: "Arto Hellas",
//         number: "040-123456"
//     },
//     {
//         id: 2,
//         name: "Ada Lovelace",
//         number: "39-44-5323523"
//     },
//     {
//         id: 3,
//         name: "Dan Abramov",
//         number: "12-43-234345"
//     },
//     {
//         id: 4,
//         name: "Mary Poppendick",
//         number: "39-23-6423122"
//     }
// ]


app.get('/', (request, response) => {
    response.send('<h2>Numbers backend</h2>')
})


app.get('/api/persons', (request, response) => {
    //response.json(persons)
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    // const person = {
    //   name: body.name,
    //   number: body.number
    // }

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number }
        , { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


app.get('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // const person = persons.find(p => p.id === id)
    Person.findById(request.params.id)
        .then(person => {
            if ( person ) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
    //
    // if ( person ) {
    //     response.json(person)
    // } else {
    //     response.status(404).end()
    // }
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body

    // Check if content is missing
    if (name === '' || number === '') {
        return (response.status(400).json({
            error: 'content missing'
        }))
    }

    // Check if name is already used
    //if (persons.find(p => p.name === body.name) !== undefined) {
    //    return (response.status(400).json({
    //        error: 'name must be unique'
    //    }))
    //}
    // Check if name already used
    // const exists = Person.findOne({name})
    // if ( exists ) {
    //   return response.status(400).json({
    //     error: 'name already used'
    //   })
    // }

    const person = new Person({
        name: name,
        number: number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
    // persons = persons.concat(person)
    // response.json(person)
})

app.get('/info', (request, response) => {
    const date = new Date()
    // const amount = persons.length
    const amount = Person.countDocuments()
    response.send(`Phonebook has info for ${amount.length} people <br /> <br /> ${date}`)
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log('error beep boop')

    if ( error.name === 'CastError' ) {
        return response.status(400).send({ error: 'malformatted id' })
    }

    if ( error.name === 'SyntaxError' ) {
        return response.status(400).send({ error: 'malformatted body' })
    }

    if ( error.name === 'ValidationError' ) {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})