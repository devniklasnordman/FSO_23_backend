const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
  }

  const password = process.argv[2]
  const newName = process.argv[3]
  const newNumber = process.argv[4]

  const url = 
    `mongodb+srv://nikdeploys:${password}@cluster0.kstblgk.mongodb.net/?retryWrites=true&w=majority`

    mongoose.set('strictQuery', false)
    mongoose.connect(url)

    const personSchema = new mongoose.Schema({
        name: String,
        number: String
    })

    const Person = mongoose.model('Person', personSchema)

    if(process.argv.length<4) {
        Person.find({}).then(persons => { 
            console.log('Phonebook')
            persons.forEach(person => {
                console.log(`${person.name}: ${person.number}`)
            });
            mongoose.connection.close()
            process.exit(1)
        })
    } else {
        const person = new Person({
            name: newName,
            number: newNumber
        })
    
        person.save().then(result => {
            console.log('person added to Phonebook!')
            mongoose.connection.close()
          })
    }

   