import {
    // CREATE_PHENOMENA_SUCCESS,
    DELETE_PHENOMENA_SUCCESS,
    UPDATE_PHENOMENON_INGESTION_SUCCESS,
} from '@sangre-fp/reducers/actionTypes'

const initialState = []

export default (state = initialState, { type, payload }) => {
    switch (type) {
        // case CREATE_PHENOMENA_SUCCESS:
            // return state.concat(payload)

        case DELETE_PHENOMENA_SUCCESS:
            return state.filter(item => item.id !== payload.id)

        case UPDATE_PHENOMENON_INGESTION_SUCCESS:
            return state.map(phenomenon => {
                if (phenomenon.id === payload.id) {
                    return {
                        ...phenomenon,
                        ...payload
                    }
                }

                return phenomenon
            })

        default:
            return state
    }
}
