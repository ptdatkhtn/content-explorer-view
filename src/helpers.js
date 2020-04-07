import {
    PUBLIC_URL
} from './env'
import _ from 'lodash'

export const getPhenomenonUrl = (radarId = false, phenomenon, hideEdit = false) => {
    const { group, id } = phenomenon
    const hasGroup = phenomenon.hasOwnProperty('group')
    const groupUrl = hasGroup ? `group=${group}` : ''

    if (!radarId) {
        return `${PUBLIC_URL}/fp-phenomena/${id}${groupUrl.length ? `/?${groupUrl}` : ''}`
    }

    // eslint-disable-next-line
    return `${PUBLIC_URL}/node/${radarId}?issue=${id}&map_id=${radarId}&source_position=right&source_page=radar-view${groupUrl.length ? `&${groupUrl}` : ''}${hideEdit ? '&hideEdit=true' : ''}`
}

export const editorRole = role => {
    if (role === 'manager' || role === 'owner' || role === 'editor') {
        return true
    }

    return false
}

export const publicEditorRole = permissions => !!_.find(permissions, permission => permission === 'fp editor')

export const makeGroup = group => {
    const {
        id,
        label,
        radarsUsed,
        radarsAllowed: radarsAllowedString,
        accountDrupalRoles,
        accountPermissions,
        availableResources
    } = group

    // backend is returning this as a string for whatever reason
    const radarsAllowed = Number(radarsAllowedString)

    // not sure why this info is in the group
    const canEditPublic = accountDrupalRoles && publicEditorRole(accountDrupalRoles[0])
    const canEdit = accountPermissions && editorRole(accountPermissions.role)

    return {
        ...group,
        id,
        value: id,
        label,
        radarsAllowed,
        radarsUsed,
        hasAvailableRadars: radarsUsed < radarsAllowed,
        availableResources,
        canEditPublic,
        canEdit
    }
}

export const PHENOMENA_PAGE_SIZE = 12
export const SEARCH_DEBOUNCE_TIME = 500
