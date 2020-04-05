import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PhenomenaPage from '../components/PhenomenaPage'
import { getAuth } from '../actions/auth'
import { getUserGroups } from '../actions/radarSettings'
import { getPhenomenaTypes } from '../actions/phenomenaTypes'
import {
    changeGroup,
    changeLanguage,
    fetchPhenomenaList,
    changeTime,
    changeType,
    changeTag,
    resetFilters,
    resetTags,
    setPhenomenonToTag
} from '../actions/phenomenaList'
import { storePhenomenon, archivePhenomenon } from '../actions/radarData'
import { canEditSomePhenomena } from '../selectors'

export default connect(
    state => {
        const {
            loading,
            auth: authData,
            phenomenaList: phenomenaListData,
            phenomenaTypesById
        } = state

        return {
            loading,
            authData,
            phenomenaListData,
            phenomenaTypesById,
            canEditSomePhenomena: canEditSomePhenomena(state)
        }
    },
    dispatch => bindActionCreators({
        getAuth,
        getGroups: getUserGroups,
        getPhenomenaTypes,
        changeGroup,
        changeLanguage,
        fetchPhenomenaList,
        storePhenomenon,
        archivePhenomenon,
        changeTime,
        changeType,
        resetFilters,
        changeTag,
        resetTags,
        setPhenomenonToTag
    }, dispatch)
)(PhenomenaPage)
