import { useState, useEffect } from 'react'
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { collection, getDocs, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/firebase'
import { addPeriodOnly, addCourses } from '@/firebaseFun'

export default function SelectWithAdd() {
    const [periodsSelected, setperiodsSelected] = useState('')
    const [periods, setPeriods] = useState([])
    const [profs, setProfs] = useState([])
    const [entry, setEntry] = useState(false)
    const [periodName, setPeriodName] = useState('')
    const [anneeSelected, setanneeSelected] = useState('')
    const [profSelected, setProfSelected] = useState('')

    const anness = [
        '1 ere année',
        '2 eme années',
        '3 eme années',
        '4 eme années',
    ]
    const [nomDuCour, setnomDuCour] = useState('')

    const handleChangePeriod = (event: SelectChangeEvent) => {
        setperiodsSelected(event.target.value as string)
    }
    const handleChangeAnnee = (event: SelectChangeEvent) => {
        setanneeSelected(event.target.value as string)
    }
    const handleChangeProf = (event: SelectChangeEvent) => {
        setProfSelected(event.target.value as string)
    }
    const handleEntryOpen = () => {
        setEntry(true)
    }
    const handleEntryClose = async () => {
        if (periodName === '') {
            setEntry(false)
        } else {
            await addPeriodOnly(periodName)
            setEntry(false)
            setPeriodName('')
        }
    }

    const handleAddCour = async () => {
        await addCourses(
            periodsSelected,
            anneeSelected,
            nomDuCour,
            profSelected
        )
    }

    useEffect(() => {
        onSnapshot(query(collection(db, 'periods')), (periodDocs) => {
            const periodIds = periodDocs.docs.map((doc) => doc.id)
            setPeriods(periodIds)
        })

        getDocs(query(collection(db, 'profs'))).then((profDoc) => {
            const profName = profDoc.docs.map(
                (doc) => `${doc.data().name} ${doc.data().prename}`
            )
            setProfs(profName)
        })
    }, [])

    return (
        <div className="p-4 flex flex-col space-y-4">
            <div className="space-x-2 flex flex-row">
                {!entry ? (
                    <FormControl className="w-60">
                        <InputLabel id="periods">Periods</InputLabel>
                        <Select
                            labelId="periods"
                            id="periods"
                            value={periodsSelected}
                            label="Periods"
                            onChange={handleChangePeriod}
                        >
                            {periods.map((period) => (
                                <MenuItem key={period} value={period}>
                                    {period}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <input
                        type="text"
                        placeholder="Periods"
                        className="hover:border-black p-3 rounded-md border border-gray-400 h-14 "
                        value={periodName}
                        onChange={(e) => setPeriodName(e.target.value)}
                    />
                )}
                {!entry ? (
                    <button
                        onClick={handleEntryOpen}
                        className={` rounded-full text-blue-500 text-3xl hover:text-blue-300 duration-500`}
                    >
                        +
                    </button>
                ) : (
                    <button
                        onClick={handleEntryClose}
                        className={` rounded-full text-blue-500 text-xl hover:text-blue-300 duration-500`}
                    >
                        ajouter
                    </button>
                )}
            </div>
            <FormControl className="w-60">
                <InputLabel id="annees">Année</InputLabel>
                <Select
                    labelId="annees"
                    id="annees"
                    value={anneeSelected}
                    label="Annees"
                    onChange={handleChangeAnnee}
                >
                    {anness.map((annee) => (
                        <MenuItem key={annee} value={annee}>
                            {annee}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <input
                type="text"
                placeholder="Nom Du Cour"
                value={nomDuCour}
                onChange={(e) => setnomDuCour(e.target.value)}
                className="border border-blue-300 hover:border-blue-500 p-4 w-60 rounded-md"
            />
            <FormControl className="w-60">
                <InputLabel id="profs">Prof du cour (Optionnel)</InputLabel>
                <Select
                    labelId="profs"
                    id="profs"
                    value={profSelected}
                    label="Prof"
                    onChange={handleChangeProf}
                >
                    {profs.map((prof) => (
                        <MenuItem key={prof} value={prof}>
                            {prof}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <button
                onClick={handleAddCour}
                className="bg-blue-500 w-60 p-2 text-lg text-white rounded-md hover:bg-blue-300"
            >
                Ajouter
            </button>
        </div>
    )
}
