import addUser from '@/firebaseFun'
import React, { useState } from 'react'

function NewUserDialogContent({ handleClose }) {
    const [prename, setPrename] = useState('')
    const [name, setName] = useState('')
    const [dateDeNaissance, setDateDeNaissance] = useState('')
    const [anneeCourante, setAnneeCourante] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [mdp, setMdp] = useState('')
    const [adresse, setAdresse] = useState('')

    async function handleAddUsers() {
        const userData = {
            name: name,
            prename: prename,
            dateDeNaissance: dateDeNaissance,
            anneeCourante: anneeCourante,
            phone: phone,
            email: email,
            profilePic:
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png',
            adresse: adresse,
        }
        const userMDP = mdp
        await addUser(userData, userMDP)
        handleClose()
    }
    return (
        <div>
            <div className="flex flex-row space-x-2">
                <input
                    className="my-Input"
                    type="text"
                    placeholder="Nom"
                    onChange={(e) => setPrename(e.target.value)}
                />
                <input
                    className="my-Input"
                    type="text"
                    placeholder="Prenom"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="flex flex-row space-x-2 ">
                <input
                    className="my-Input"
                    type="text"
                    placeholder="Date de Naissance"
                    onChange={(e) => setDateDeNaissance(e.target.value)}
                />
                <input
                    className="my-Input"
                    type="text"
                    placeholder="Annee Courante"
                    onChange={(e) => setAnneeCourante(e.target.value)}
                />
            </div>
            <input
                className="my-Input"
                type="text"
                placeholder="Adresse"
                onChange={(e) => setAdresse(e.target.value)}
            />
            <input
                className="my-Input"
                type="text"
                placeholder="Phone"
                onChange={(e) => setPhone(e.target.value)}
            />
            <input
                className="my-Input"
                type="text"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="my-Input"
                type="text"
                placeholder="Mot de passe"
                onChange={(e) => setMdp(e.target.value)}
            />

            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 w-full rounded"
                onClick={handleAddUsers}
            >
                Ajouter
            </button>
        </div>
    )
}

export default NewUserDialogContent
