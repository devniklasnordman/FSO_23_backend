const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

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
        required: [true, 'Name required']

    },
    number: {
        type: String,
        minlength: 8,
        required: [true, 'Phone number required'],
        validate: {
            validator: function(number) {
                return /^\d{2,3}-\d{6,}$/.test(number)
            },
            message: props => `Not a valid phone number!
             Corrext format of phone number is 02-345678... OR 040-456789...`
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