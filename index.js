
const express = require('express')
const app = express()
require('dotenv').config()
const Note = require('./models/note')

let notes = [
    {
        id: "1",
        content: "This is the first note",
        important: true
    },
    {
        id: "2",
        content: "This is the second note",
        important: false
    },
    {
        id: "3",
        content: "This is the third note",
        important: false
    },
    {
        id: "4",
        content: "This is the fourth note",
        important: true
    },
    {
        id: "5",
        content: "This is the fifth note",
        important: false
    }
]



const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => Number(n.id))) : 0
    return String(maxId + 1)
}






app.use(express.static('dist'))

/*there is no need to use cors because the backend now has a diffent origin from the frontend
const cors = require('cors')
app.use(cors())
*/

app.use(express.json())






//route to add new notes
app.post('/api/notes', (request, response, next) => {
    const body = request.body
    if(!body.content){
        return response.status(400).json({
            error: 'content missing'
        })
    }
   
    const note = new Note({
    content: body.content,
    important: body.important || false,
   })

   note.save().then(savedNote => {
    response.json(savedNote)
   }).catch(error => {next(error)})

})

//main page
app.get('/', (request, response) => {
    response.send('<h1>Hello from express</h1>')
})



app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})


app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
        if(note){
            response.json(note)
        }
        else{
            console.log('the note was not found')
            response.status(404).end()
        }
    }).catch(error => next(error))
})

/*this route uses the list variable instead of the database
app.get('/api/notes', (request, response) => {
    response.json(notes)
})
*/

/*route to fetch a single resource from the list
app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(n => n.id === id)
    if(note){
        response.json(note)
    }
    else{
        response.status(400).end()
    }
})
*/

app.put('/api/notes/:id', (request, response, next) => {
    const {content, important} = request.body
    Note.findById(request.params.id).then(note => {
        if(!note){
            return response.status(404).end()
        }

        note.content = content
        note.important = important

        return note.save().then((updatedNote) => {
            response.json(updatedNote)
        })

    }).catch(error => next(error))
})


/*route to change the importance of a note (albi)
app.put('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(n => n.id === id)
    const newNote = {id: note.id, content: note.content, important: !note.important}
    notes = notes.map(n => n.id === note.id ? newNote : n)
    response.json(newNote)
})

*/

//route to delete a resource
//used postman to test it, and it worked
app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id).then(result =>{
        response.status(204).end()
    }).catch(error => next(error))
})





//this is a middleware to log request information





const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}



const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.body)
    console.log('---')
    next()
}


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

//errorHandler has to be the last loaded middleware, also all the routes should be
//registered before this!
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`The server is listening on port ${PORT}`)
})