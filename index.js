const express = require('express')
const app = express()


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

const cors = require('cors')
app.use(cors())

app.use(express.json())





//route to add new notes
app.post('/api/notes', (request, response) => {
    const body = request.body
    if(!body.content){
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId()
    }
    notes = notes.concat(note)
    response.json(note)

})

//main page
app.get('/', (request, response) => {
    response.send('<h1>Hello from express</h1>')
})



app.get('/api/notes', (request, response) => {
    response.json(notes)
})

//route to fetch a single resource
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

//route to change the importance of a note (albi)
app.put('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(n => n.id === id)
    const newNote = {id: note.id, content: note.content, important: !note.important}
    notes = notes.map(n => n.id === note.id ? newNote : n)
    response.json(newNote)
})


//route to delete a resource
//used postman to test it, and it worked
app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})





//this is a middleware to log request information
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


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`The server is listening on port ${PORT}`)
})