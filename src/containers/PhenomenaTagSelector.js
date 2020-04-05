import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { PhenomenaTagSelector } from '@sangre-fp/tags'

import { handlePhenomenaTagMod, setPhenomenonToTag } from '../actions/phenomenaList'

export default connect(
    state => {
        const {
            phenomenaList: {
                selectedGroup,
                selectedLanguage,
                phenomenonToTag
            }
        } = state

        return {
            group: selectedGroup.value,
            language: selectedLanguage.value,
            phenomenon: phenomenonToTag
        }
    },
    dispatch => bindActionCreators({
        handlePhenomenaTagMod,
        setPhenomenonToTag
    }, dispatch)
)(PhenomenaTagSelector)
