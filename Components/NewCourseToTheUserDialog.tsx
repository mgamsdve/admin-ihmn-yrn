import React from 'react'
import { TreeView, TreeItem } from '@mui/lab'
import { db } from '../firebase' // importer l'instance de la base de données Firestore
import { useState, useEffect } from 'react'
import {
    collection,
    collectionGroup,
    query,
    getDocs,
    onSnapshot,
    getDoc,
} from 'firebase/firestore'
import { StyledTreeItem, StyledTreeView } from '@/Components/StyledTreeView'
import { ChevronRight, ExpandMore } from '@mui/icons-material'
import { Checkbox } from '@mui/material'

type Props = {}

function NewCourseToTheUserDialog({}: Props) {
    const [periodsData, setPeriodsData] = useState([])
    const [anneeData, setAnneeData] = useState({})
    const [coursData, setCoursData] = useState({})
    const [selectedCourses, setSelectedCourses] = useState([])

    const handleToggle = (value) => () => {
        const currentIndex = selectedCourses.indexOf(value)
        const newChecked = [...selectedCourses]

        if (currentIndex === -1) {
            newChecked.push(value)
        } else {
            newChecked.splice(currentIndex, 1)
        }

        setSelectedCourses(newChecked)
    }
    const handleAdd = () => {}

    useEffect(() => {
        const periodsdocsquery = query(collection(db, 'periods'))
        getDocs(periodsdocsquery).then((periodDocs) => {
            const periods = []
            periodDocs.forEach((periodDoc) => {
                const periodId = periodDoc.id
                periods.push(periodId)
                getDocs(
                    query(collection(db, 'periods', periodId, 'annees'))
                ).then((anneesDocs) => {
                    const annees = []
                    anneesDocs.forEach((anneeDoc) => {
                        const anneeId = anneeDoc.id
                        annees.push(anneeId)
                        getDocs(
                            query(
                                collection(
                                    db,
                                    'periods',
                                    periodId,
                                    'annees',
                                    anneeId,
                                    'cours'
                                )
                            )
                        ).then((coursDocs) => {
                            const cours = []
                            coursDocs.forEach((courDoc) => {
                                const courId = courDoc.id
                                const nomDuCour = courDoc.data().nomDuCour
                                cours.push({
                                    nomDuCour: nomDuCour,
                                    courdocId: courId,
                                })
                            })
                            setCoursData((prevCoursData) => ({
                                ...prevCoursData,
                                [periodId]: {
                                    ...prevCoursData[periodId],
                                    [anneeId]: cours,
                                },
                            }))
                        })
                    })
                    setAnneeData((prevAnneeData) => ({
                        ...prevAnneeData,
                        [periodId]: annees,
                    }))
                })
            })
            setPeriodsData(periods)
        })
    }, [])

    return (
        <div>
            <button
                onClick={handleAdd}
                className="bg-blue-50 hover:text-blue-500 hover:bg-blue-100 duration-500 p-2 rounded-md text-blue-400 font-semibold"
            >
                Ajouter les cours selectionnees
            </button>

            <div className="w-full h-[770px] shadow-xl rounded-md mt-4 p-4">
                <StyledTreeView
                    defaultCollapseIcon={<ExpandMore />}
                    defaultExpandIcon={<ChevronRight />}
                >
                    {periodsData.map((period) => (
                        <StyledTreeItem
                            nodeId={period}
                            label={period}
                            key={period}
                            $cours={true}
                        >
                            {(anneeData[period] || []).map((annee) => (
                                <StyledTreeItem
                                    nodeId={`${period}-${annee}`}
                                    label={annee}
                                    $annee={true}
                                    key={annee}
                                >
                                    {(coursData[period]?.[annee] || []).map(
                                        (cour) => (
                                            <TreeItem
                                                nodeId={`${period}-${annee}-${cour.courdocId}`}
                                                label={
                                                    <div>
                                                        <Checkbox
                                                            checked={
                                                                selectedCourses.indexOf(
                                                                    cour.courdocId
                                                                ) !== -1
                                                            }
                                                            onChange={handleToggle(
                                                                cour.courdocId
                                                            )}
                                                        />
                                                        {cour.nomDuCour}
                                                    </div>
                                                }
                                                key={cour.courdocId}
                                            />
                                        )
                                    )}
                                </StyledTreeItem>
                            ))}
                        </StyledTreeItem>
                    ))}
                </StyledTreeView>
            </div>
        </div>
    )
}

export default NewCourseToTheUserDialog
