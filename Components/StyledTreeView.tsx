import { TreeItem, TreeView } from '@mui/lab'
import { styled } from '@mui/material'

export const StyledTreeView = styled(TreeView)(({ theme }) => ({
    '& .MuiTreeItem-group': {
        marginLeft: theme.spacing(9),
    },
}))

type mystyledTreeItem = {
    $cours?: boolean
    $annee?: boolean
    $eleve?: boolean
}

export const StyledTreeItem = styled(TreeItem)<mystyledTreeItem>(
    ({ theme, $cours, $annee, $eleve }) => ({
        '& .MuiTreeItem-label': {
            color: $cours
                ? theme.palette.primary.main
                : $annee
                ? theme.palette.text.primary
                : '#fff',
        },
    })
)
