import 'dotenv/config'
import { app } from './app.js'
import { startPinger } from './pinger.js'

const port = process.env.PORT ?? 4000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
  startPinger()
})
