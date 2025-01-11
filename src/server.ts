import express from 'express'
import { SpecialKeys } from './configs/config';
import cors from "cors"
import bodyParser from 'body-parser';
import userRoutes from './router/userRoutes'
const app = express();


app.use(cors())
app.use(bodyParser.json())

app.use('/users',userRoutes)

app.listen(SpecialKeys.PORT, () => {
    console.log(`Todo server is Active at port ${SpecialKeys.PORT}`)
})