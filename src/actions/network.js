import * as actionTypes from '@sangre-fp/reducers/actionTypes'

export const loadingStart = component => ({
    type: `${actionTypes.LOADING}/${component}`,
    payload: { component }
})

export const loadingSuccess = component => ({
    type: `${actionTypes.LOADING_SUCCESS}/${component}`,
    payload: { component }
})

export const loadingError = (component, error, defaultMessage, message) => ({
    type: `${actionTypes.LOADING_ERROR}/${component}`,
    payload: { component, error, defaultMessage, message }
})

export const getNetworkMethods = (type, successType, defaultMessage) => {
    const loading = () => loadingStart(type)
    const success = payload => dispatch => {
        dispatch(loadingSuccess(type))
        return dispatch({
            type: successType,
            payload
        })
    }
    const error = (err, message) => dispatch =>
        dispatch(loadingError(type, err, defaultMessage, message))
    return {
        loading,
        success,
        error
    }
}

