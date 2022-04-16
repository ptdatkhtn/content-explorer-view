import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PhenomenaPage from '../components/PhenomenaPage'
import { getAuth } from '../actions/auth'
import { getUserGroups } from '../actions/radarSettings'
import { getPhenomenaTypes } from '../actions/phenomenaTypes'
import { fetchPhenomenaList, setPhenomenonToTag } from '../actions/phenomenaList'
import { storePhenomenon, archivePhenomenon } from '../actions/radarData'
import { canEditSomePhenomena, storedPhenSelector } from '../selectors'

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
            canEditSomePhenomena: canEditSomePhenomena(state),
            storedPhenSelector: storedPhenSelector(state)
        }
    },
    dispatch => bindActionCreators({
        getAuth,
        getGroups: getUserGroups,
        getPhenomenaTypes,
        fetchPhenomenaList,
        storePhenomenon,
        archivePhenomenon,
        setPhenomenonToTag,
    }, dispatch)
)(PhenomenaPage)
