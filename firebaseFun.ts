import {
    arrayUnion,
    doc,
    setDoc,
    updateDoc,
    writeBatch,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
async function addUser(userData, userMDP) {
    try {
        const newUser = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userMDP
        )

        await setDoc(doc(db, 'users', newUser.user.uid), userData)
        //console.log('Document written with ID: ', newUser.user.uid)
    } catch (e) {
        console.error('Error adding document: ', e)
    }
}

async function updateUser(docId, newuserData) {
    try {
        const docRef = doc(db, 'users', docId)
        await updateDoc(docRef, newuserData)
        //console.log('Document updated with ID: ', id)
    } catch (e) {
        console.error('Error updating document: ', e)
    }
}
async function updateProfessor(docId, newuserData) {
    try {
        const docRef = doc(db, 'profs', docId)
        await updateDoc(docRef, newuserData)
        //console.log('Document updated with ID: ', id)
    } catch (e) {
        console.error('Error updating document: ', e)
    }
}
updateProfessor

async function deleteUser(uid) {
    const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
    })

    const data = await response.json()

    if (response.ok) {
        console.log(data.message)
    } else {
        console.log(data.error)
    }
}

const deleteDocuments = async (collectionName: string, docIds: string[]) => {
    const batch = writeBatch(db)

    docIds.forEach((docId) => {
        const docRef = doc(db, collectionName, docId)
        batch.delete(docRef)
        deleteUser(docId)
    })

    await batch.commit()
}

const addCoursToTheUser = async (
    userUId: string,
    anneeId: string,
    periodId: string,
    coursId: string
) => {
    const courRef = doc(
        db,
        'periods',
        periodId,
        'annees',
        anneeId,
        'cours',
        coursId
    )
    await setDoc(
        doc(db, 'users', userUId, 'periods', periodId),
        {
            annee: arrayUnion(anneeId),
        },
        {
            merge: true,
        }
    )
    await setDoc(
        doc(db, 'users', userUId, 'periods', periodId, 'cours', coursId),
        {
            cour: courRef,
            anneeDuCour: anneeId,
        }
    )
    const userRef = doc(db, 'users', userUId)
    await updateDoc(courRef, { eleves: arrayUnion(userRef) })
}
export { updateUser, updateProfessor, deleteDocuments, addCoursToTheUser }
export default addUser
