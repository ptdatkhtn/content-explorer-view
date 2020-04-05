import { getNetworkMethods } from './network'
import drupalApi from '@sangre-fp/connectors/drupal-api'
import * as actionTypes from '@sangre-fp/reducers/actionTypes'
import { requestTranslation } from '@sangre-fp/i18n'

export const getUserGroups = () => async dispatch => {
    const { loading, success, error } = getNetworkMethods(
        actionTypes.GET_GROUPS,
        actionTypes.GET_GROUPS_SUCCESS,
        requestTranslation('fetchingGroupsError')
    )

    dispatch(loading())

    try {
        dispatch(success(await drupalApi.getGroupsWithMemberShips()))
    } catch (e) {
        dispatch(error(e))
    }
}
