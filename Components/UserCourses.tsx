import { useState, useEffect } from 'react'
import { collection, onSnapshot, getDoc, query } from 'firebase/firestore'
import { TreeView, TreeItem } from '@mui/lab'

import { db } from '../firebase'
import {
    ExpandMore as ExpandMoreIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/router'
import {
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material'
import { StyledTreeItem, StyledTreeView } from './StyledTreeView'
import NewCourseToTheUserDialog from './NewCourseToTheUserDialog'

type Props = {}

function UserCourses({}: Props) {
    const router = useRouter()
    const userId = router.query.id.toString()
    const [periods, setPeriods] = useState([])
    const [open, setOpen] = useState(false)
    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'users', userId, 'periods')),
            (snapshot) => {
                const periodsData = []
                snapshot.forEach((doc) => {
                    const period = {
                        id: doc.id,
                        annee: doc.data().annee,
                        cours: [], // Initialize an empty array for storing cours documents
                    }
                    periodsData.push(period)

                    // Fetch cours documents for the current period
                    onSnapshot(
                        query(
                            collection(
                                db,
                                'users',
                                userId,
                                'periods',
                                doc.id,
                                'cours'
                            )
                        ),
                        (coursSnapshot) => {
                            const coursData = []
                            coursSnapshot.forEach(async (coursDoc) => {
                                const coursRef = coursDoc.data().cour
                                const referencedCoursDoc: any = await getDoc(
                                    coursRef
                                )
                                coursData.push({
                                    id: referencedCoursDoc.id,

                                    nomDuCour:
                                        referencedCoursDoc.data().nomDuCour,
                                    // Add other cours fields here
                                })
                                // Update the cours array for the current period
                                period.cours = coursData
                                setPeriods([...periodsData]) // Update the periods state with the modified array
                            })
                        }
                    )
                })
                setPeriods(periodsData)
            }
        )

        return () => unsubscribe()
    }, [])

    const [checked, setChecked] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    const handleToggle = (event, nodeIds) => {
        setChecked(nodeIds)
    }

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value)
    }

    const filteredPeriods = periods.filter(
        (period) =>
            period.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            period.annee.some((anne) =>
                anne.toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            period.cours.some((cours) =>
                cours.nomDuCour.toLowerCase().includes(searchTerm.toLowerCase())
            )
    )

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <>
            <div className="shadow-lg rounded-lg p-7 w-full bg-white">
                <div className="flex flex-row  border-b rounded-md w-full p-5 space-x-5">
                    <input
                        placeholder="Rechercher"
                        className="p-2 w-fit bg-gray-50 rounded-md"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button
                        className="text-blue-600 hover:bg-blue-50 rounded-sm p-2 duration-300"
                        onClick={handleOpen}
                    >
                        Ajouter des cours
                    </button>
                    <button className="text-red-600 hover:bg-red-50 rounded-sm p-2 duration-300">
                        Supprimer des cours
                    </button>
                </div>
                <div className="p-5">
                    <StyledTreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                        onNodeSelect={handleToggle}
                        multiSelect
                    >
                        {filteredPeriods.map((period) => (
                            <StyledTreeItem
                                $cours
                                key={period.id}
                                nodeId={period.id}
                                label={
                                    <div>
                                        <Checkbox
                                            checked={checked.includes(
                                                period.id
                                            )}
                                        />
                                        {` ${period.id} - ${period.annee}`}
                                    </div>
                                }
                            >
                                {period.cours.map((cours) => (
                                    <StyledTreeItem
                                        $annee
                                        key={cours.id}
                                        nodeId={cours.id}
                                        label={
                                            <div>
                                                <Checkbox
                                                    checked={checked.includes(
                                                        cours.id
                                                    )}
                                                />
                                                {`${cours.nomDuCour}`}
                                            </div>
                                        }
                                    >
                                        {/* Render other course details here */}
                                    </StyledTreeItem>
                                ))}
                            </StyledTreeItem>
                        ))}
                    </StyledTreeView>
                </div>
            </div>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xl"
                PaperProps={{
                    style: {
                        width: '1000px',
                        height: '900px',
                    },
                }}
            >
                <DialogTitle>Ajouter des cours</DialogTitle>
                <DialogContent>
                    <NewCourseToTheUserDialog />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default UserCourses
