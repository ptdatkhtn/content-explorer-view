import { createSelector } from 'reselect'

const getPhenomenaListGroups = (state) => state.phenomenaList.groups
const getPhenomenaListCanEditPublic = (state) => state.phenomenaList.canEditPublic
const getStoredPhen = (state) => state?.radarSettings?.storedPhenomenon
export const canEditSomePhenomena = createSelector([ getPhenomenaListGroups, getPhenomenaListCanEditPublic ], (groups, canEditPublic) => {
    return canEditPublic || groups.some(g => g.canEdit)
})

export const storedPhenSelector = createSelector(getStoredPhen, storedPhenomenon => {
    console.log('storedPhenomenon999', storedPhenomenon)
    return storedPhenomenon ?? []
})