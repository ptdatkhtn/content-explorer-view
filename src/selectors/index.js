import { createSelector } from 'reselect'

const getPhenomenaListGroups = (state) => state.phenomenaList.groups
const getPhenomenaListCanEditPublic = (state) => state.phenomenaList.canEditPublic

export const canEditSomePhenomena = createSelector([ getPhenomenaListGroups, getPhenomenaListCanEditPublic ], (groups, canEditPublic) => {
    return canEditPublic || groups.some(g => g.canEdit)
})
