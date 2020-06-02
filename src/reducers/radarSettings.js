import _ from 'lodash'
import { getCurrentLanguage } from '@sangre-fp/i18n'
import { GET_GROUPS_SUCCESS } from '@sangre-fp/reducers/actionTypes'

const initialState = {
    groups: [],
    radarLanguage: getCurrentLanguage()
}

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case GET_GROUPS_SUCCESS:
            // filter out groups without ids
            const groups = _.filter(
                payload,
                group => group.id
            )

            return {
                ...state,
                groups
            }
        default:
            return state
    }
}
