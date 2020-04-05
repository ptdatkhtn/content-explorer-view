import { combineReducers } from 'redux'

import phenomenaList from './phenomenaList'
import radarSettings from './radarSettings'
import phenomena from './phenomena'

import {
    auth,
    loading,
    errors,
    radarSets,
    phenomenaTypes,
    phenomenaTypesById,
    confirmDialog
} from '@sangre-fp/reducers'

export default combineReducers({
    auth,
    loading,
    errors,
    confirmDialog,
    phenomenaList,
    radarSettings,
    phenomenaTypes,
    phenomenaTypesById,
    phenomena,
    radarSets
})
