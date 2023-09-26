import 'dotenv/config'

import {app, gracefulShutdown} from "./app"

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("listening on port: " + PORT))

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon