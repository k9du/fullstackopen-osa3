const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        required: true,
        minlength: 8,
        validate: {
            validator: function (n) {
                // n is the number to be checked
                const parts = n.split('-')
                if ( parts.length !== 2 ) {
                    return false
                }
                const first = parts[0]

                if ( first.length < 2 || first.length > 3 ) {
                    return false
                }

                const second = parts[1]

                if ( second.length < 7 || second.length > 8 ) {
                    return false
                }
                return true
            }
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)