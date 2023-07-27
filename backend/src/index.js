import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

import TodoModel from "./models/todo.js"

const app = express()
dotenv.config()

app.use(express.json())
app.use(cors())

app.get("/todos", async (req, res) => {
    const todos = await TodoModel.find()
    return res.status(200).json({
        todos,
    })
})

app.post("/todos", async (req, res) => {
    const name = req.body.name
    const todo = new TodoModel({
        name,
    })
    await todo.save()
    res.status(201).json({ message: "Goal saved", todo })
})

app.put("/todos/:id", async (req, res) => {
    const todo = await TodoModel.findById(req.params.id)
    todo.completed = !todo.completed
    await todo.save()

    return res.status(201).json({ message: "Todo saved", todo })
})

app.delete("/todos/:id", async (req, res) => {
    await TodoModel.deleteOne({ "_id": req.params.id, })
        .then(() => res.status(201).json({ message: "Todo deleted" }))
        .catch(err => console.log(err))
})

mongoose.set('strictQuery', false)

const uri = `mongodb+srv://${ process.env.MONGODB_USERNAME }:${ process.env.MONGODB_PASSWORD }@cluster1.v7ucrvl.mongodb.net/?retryWrites=true&w=majority`

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

async function MongoDBService() {
    try {
        await mongoose.connect(uri, options)
            .then(() => {
                console.log("Connected to MongoDB")
                app.listen(8000, () => {
                    console.log("Now listening on PORT 8000")
                })
            })
    } catch (error) {
        console.log("Unable to connect to MongoDB")
        console.log(error)
    }

    mongoose.connection.on("error", (err) => {
        console.log(err)
    })
};

MongoDBService()