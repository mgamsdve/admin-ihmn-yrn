Dev Ihmn

-   gerer etudiants ✓
-   gerer professeur ✓
-   gerer les inscriptions des étudiants au différents cours ✓
-   gerer les stages ou les formations additionnelles des étudiants ? est ce que ce ne sont que des cours ? est ce que c est un ensemble de cours ?
-   gerer les cours en détail (professeurs pour le cours, ) les assigner a une année ? une année de cours ou un nombre ?
-   gerer les travaux de fin d etude ? exmens ?
-   gerer les brevets européens de secours de vos étudiants ?? c est quoi ?
-   gerer les ensembles des cours suivis par vos étudiants en eleves libre ?? ca veut dire les ajouter a des cours ? ou creer une autre section ?
-   gerer les sessions d examens ?? ca veut dire les horaires ?
-   gérer les inscriptions aux sections d examens ?? est ce que c est des qu ils sont dans un cour ou c est par rapport a quoi ?
-   gerer les résultats des examens ✓
-   creer les feuilles de présence ??? c est quoi
-   creer les vue administratif ??
-   creer des liens watsapp signal ? pourquoi faire
    Eleves :
-   gerer leur donnée personnelle ✓ photo why not
-   gérer leurs mdp ✓
-   vue sur leur cours ✓
-   s inscrire au sections d examens ?
-   vues sur leurs résultat et leurs session d esxamens ✓
-   vue sur leurs cours en étudiant libre ??
-   vue sur leurs stages et formations additionnelles suivis les années précédentes et les stages de cette année ✓ ? les stages qu il suivent ?
    Professeurs :
-   vue sur les horaires de leurs cours ✓
-   les étudiants qui seront dans sont cours ✓ ? maintenant ou de toujours ?
-   télécharger la feuille de présence ✓
-   vue sur les résultats de leurs examens ??

Avec firebase comme base de données, tout gratuit sur le maintien puis pas cher, python tres utiliser (tkinter, admin sdk) et pour l application prof / eleves, flutter, devlopper par google tres utiliser aussi
tout en application pc et mobile et site a voir car payant

moi d'office moins bien que eux et demander si peut etre fait en plusieurs applications
garder historique

leurs noms de formation et l heure 32h 1 et 2eme cycle

garder la trace des evals raté

inscription examen :
session 1 plus une date
voir qui a accepté plus a cocher pour chaque inscrit et eux vois soit aprem soit matin

creer la feuille de présence automatiquement et avec les élèves dans les cours et la date prédéfinis
automatiquement conté les nombres d élève dans classe et cours

creer des liens watsapp= invité sur leur application au groupe WhatsApp

avoir des notifications push pour presque tout
add photo profile

voir les inscriptions qu ils ont/ cours avant et present

vue sur leurs session d examens
pouvoir s inscrire au examens avec la fiche

prof horaires du cours + touts les élèves dedans
prof peuvent voir certaines choses vue sur les résultats

import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

function MyTreeView() {
const [checked, setChecked] = useState([]);

const handleToggle = (period, annee, courdocId) => () => {
const currentIndex = checked.findIndex(
(item) =>
item.period === period &&
item.annee === annee &&
item.courdocId === courdocId
);
const newChecked = [...checked];

if (currentIndex === -1) {
newChecked.push({ period, annee, courdocId });
} else {
newChecked.splice(currentIndex, 1);
}

setChecked(newChecked);
};

return (
<TreeView>
{periodsData.map((period) => (
<TreeItem nodeId={period} label={period} key={period}>
{(anneeData[period] || []).map((annee) => (
<TreeItem nodeId={`${period}-${annee}`} label={annee} key={annee}>
{(coursData[period]?.[annee] || []).map((cour) => (
<TreeItem
nodeId={`${period}-${annee}-${cour.courdocId}`}
label={
<div>
<Checkbox
checked={
checked.findIndex(
(item) =>
item.period === period &&
item.annee === annee &&
item.courdocId === cour.courdocId
) !== -1
}
onChange={handleToggle(period, annee, cour.courdocId)}
/>
{cour.nomDuCour}
</div>
}
key={cour.courdocId}
/>
))}
</TreeItem>
))}
</TreeItem>
))}
</TreeView>
);
}
