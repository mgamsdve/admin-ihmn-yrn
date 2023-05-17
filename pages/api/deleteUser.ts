// pages/api/deleteUser.js
import admin from '../../firebase-admin'
export default async function handler(req, res) {
    const { uid } = req.body

    try {
        await admin.auth().deleteUser(uid)
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
        res.status(500).json({
            error: 'Erreur lors de la suppression de l`utilisateur',
        })
    }
}
