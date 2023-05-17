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
import { useRouter } from 'next/router'

export default function MyTreeView() {
    const [periodsData, setPeriodsData] = useState([])
    const [anneeData, setAnneeData] = useState({})
    const [coursData, setCoursData] = useState({})
    const [eleveData, setEleveData] = useState({})

    const router = useRouter()
    useEffect(() => {
        const periodsdocsquery = query(collection(db, 'periods'))
        getDocs(periodsdocsquery).then((periodsdocs) => {
            const periods = []
            periodsdocs.forEach((perioddoc) => {
                const periodId = perioddoc.id
                periods.push(periodId)
                onSnapshot(
                    query(collection(db, 'periods', periodId, 'annees')),
                    (anneesSnapshot) => {
                        const annees = []
                        anneesSnapshot.forEach((anneeDoc) => {
                            const anneeId = anneeDoc.id
                            annees.push(anneeId)
                            onSnapshot(
                                query(
                                    collection(
                                        db,
                                        'periods',
                                        periodId,
                                        'annees',
                                        anneeId,
                                        'cours'
                                    )
                                ),
                                (coursSnapshot) => {
                                    const cours = []
                                    coursSnapshot.forEach((courDoc) => {
                                        const courId = courDoc.id
                                        const nomDuCour =
                                            courDoc.data().nomDuCour
                                        cours.push({
                                            nomDuCour: nomDuCour,
                                            courdocId: courId,
                                        })
                                        const eleves =
                                            courDoc.data().eleves || []
                                        eleves.forEach((eleveRef) => {
                                            getDoc(eleveRef).then(
                                                (eleveDoc: any) => {
                                                    try {
                                                        const eleveId =
                                                            eleveDoc.id
                                                        const prenom =
                                                            eleveDoc.data()
                                                                .prename

                                                        const nom =
                                                            eleveDoc.data().name
                                                        setEleveData(
                                                            (prevEleveData) => {
                                                                if (
                                                                    prevEleveData[
                                                                        courId
                                                                    ]?.some(
                                                                        (
                                                                            eleve
                                                                        ) =>
                                                                            eleve.eleveId ===
                                                                            eleveId
                                                                    )
                                                                ) {
                                                                    return prevEleveData
                                                                }
                                                                return {
                                                                    ...prevEleveData,
                                                                    [courId]: [
                                                                        ...(prevEleveData[
                                                                            courId
                                                                        ] ||
                                                                            []),
                                                                        {
                                                                            eleveId,
                                                                            prenom,
                                                                            nom,
                                                                        },
                                                                    ],
                                                                }
                                                            }
                                                        )
                                                    } catch (e) {
                                                        console.log('e')
                                                    }
                                                }
                                            )
                                        })
                                    })
                                    setCoursData((prevCoursData) => ({
                                        ...prevCoursData,
                                        [periodId]: {
                                            ...prevCoursData[periodId],
                                            [anneeId]: cours,
                                        },
                                    }))
                                }
                            )
                        })
                        setAnneeData((prevAnneeData) => ({
                            ...prevAnneeData,
                            [periodId]: annees,
                        }))
                    }
                )
            })
            setPeriodsData(periods)
        })
    }, [])

    const handledoubleuserClick = (userid) => {
        router.push(`/users/${userid}/UserDetail`)
    }

    return (
        <div className="p-7 bg-gray-50 w-full h-screen flex flex-col space-y-5">
            <div className="bg-white w-full h-20 shadow-md rounded-lg p-7 flex flex-row space-x-5">
                <input
                    placeholder="Rechercher"
                    className=" w-fit p-2 bg-gray-50 rounded-md"
                />
                <button className="text-green-600 hover:bg-green-50 rounded-md px-2 duration-300">
                    Ajouter des cours
                </button>
                <button className="text-red-600 hover:bg-red-50 rounded-md px-2 duration-300">
                    Supprimer des cours
                </button>
            </div>
            <div className="bg-white w-full h-full shadow-lg rounded-lg p-7">
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
                            {(anneeData[period] || []).map((annees) => (
                                <StyledTreeItem
                                    nodeId={`${period}-${annees}`}
                                    label={annees}
                                    $annee={true}
                                    key={annees}
                                >
                                    {(coursData[period]?.[annees] || []).map(
                                        (cour) => (
                                            <TreeItem
                                                nodeId={`${period}-${annees}-${cour.courdocId}`}
                                                label={cour.nomDuCour}
                                                key={cour.courdocId}
                                            >
                                                {(
                                                    eleveData[cour.courdocId] ||
                                                    []
                                                ).map(
                                                    ({
                                                        eleveId,
                                                        prenom,
                                                        nom,
                                                    }) => (
                                                        <TreeItem
                                                            nodeId={eleveId}
                                                            label={`${prenom} ${nom} ➜`}
                                                            key={prenom}
                                                            onDoubleClick={() =>
                                                                handledoubleuserClick(
                                                                    eleveId
                                                                )
                                                            }
                                                        />
                                                    )
                                                )}
                                            </TreeItem>
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
