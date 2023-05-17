import { initializeApp } from 'firebase-admin/app'
import admin from 'firebase-admin'

var serviceAccount = require('./private/ihmnappdb-firebase-adminsdk-n1555-74fb2eada8.json')
initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

export default admin
