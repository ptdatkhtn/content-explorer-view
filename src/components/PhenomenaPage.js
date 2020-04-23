import _ from 'lodash'
import React, { PureComponent } from 'react'
import styled from 'styled-components'
import {
    Modal,
    Loading,
    OptionDropdown,
    Pagination,
    MaterialIcon,
    PhenomenonType,
    modalStyles,
    FuzeNListContainer,
    TagOptionDropdown,
    TimelineOptionDropdown
} from '@sangre-fp/ui'
import ErrorModal from '../containers/ErrorModal'
import ConfirmDialog from '../containers/ConfirmDialogContainer'
import PhenomenaTagSelector from '../containers/PhenomenaTagSelector'
import { PhenomenaList } from './PhenomenaList'
import { SEARCH_DEBOUNCE_TIME, PHENOMENA_PAGE_SIZE } from '../helpers'
import { requestTranslation } from '@sangre-fp/i18n'
import { PhenomenonLoader, PhenomenonEditForm } from '@sangre-fp/content-editor'

const CREATE = 'CREATE'
const EDIT = 'EDIT'
const CLONE = 'CLONE'

export default class PhenomenaPage extends PureComponent {
    state = {
        editModal: null,
        groupsShown: false,
        languagesShown: false,
        timesShown: false,
        typesShown: false,
        tagsShown: false,
        page: 1,
        textSearchValue: ''
    }

    debounceTimeout = false

    componentDidMount() {
        const {
            getAuth,
            getGroups,
            fetchPhenomenaList,
            getPhenomenaTypes,
            phenomenaListData: {
                selectedGroup,
                selectedLanguage,
                selectedTypes,
                selectedTags
            }
        } = this.props
        const { textSearchValue } = this.state

        getAuth()
            .then(() => Promise.all([
                getGroups(),
                getPhenomenaTypes(selectedGroup.value)
            ]))
            .then(() => fetchPhenomenaList({page: 0, size: PHENOMENA_PAGE_SIZE, searchableGroup: selectedGroup, searchInput: textSearchValue, languageObj: selectedLanguage, tags: selectedTags, types: selectedTypes, time_min: null, time_max: null }))
    }

    componentWillUpdate(nextProps, nextState) {
        const { page, textSearchValue } = this.state
        const { phenomenaListData: { phenomenaList, selectedGroup, selectedLanguage, selectedTypes, selectedTags, selectedTimes: { min: time_min = null, max: time_max = null } = {} }, fetchPhenomenaList, setPhenomenonToTag } = this.props
        const nextPage = nextState.page
        const totalPages = phenomenaList.length / PHENOMENA_PAGE_SIZE

        if (nextPage !== page && totalPages <= nextPage) {
            setPhenomenonToTag(false)

            fetchPhenomenaList({ page: nextPage - 1, size: PHENOMENA_PAGE_SIZE, searchableGroup: selectedGroup, searchInput: textSearchValue, languageObj: selectedLanguage, tags: selectedTags, types: selectedTypes, time_max, time_min })
        }
    }


    componentWillReceiveProps(nextProps) {
        const { textSearchValue } = this.state
        const {
            fetchPhenomenaList,
            phenomenaListData: {
                selectedGroup,
                selectedLanguage,
                selectedTimes,
                selectedTypes,
                selectedTags,
            },
            setPhenomenonToTag,
            getPhenomenaTypes
        } = this.props
        const nextGroup = nextProps.phenomenaListData.selectedGroup
        const nextLanguage = nextProps.phenomenaListData.selectedLanguage
        const nextTimes = nextProps.phenomenaListData.selectedTimes
        const nextTypes = nextProps.phenomenaListData.selectedTypes
        const nextTags = nextProps.phenomenaListData.selectedTags

        if (nextGroup && nextGroup !== selectedGroup) {
            getPhenomenaTypes(nextGroup.value)
        }

        if (
            nextLanguage !== selectedLanguage ||
            nextTimes !== selectedTimes ||
            nextTypes !== selectedTypes ||
            nextTags !== selectedTags
        ) {
            setPhenomenonToTag(false)

            const { min: time_min = null, max: time_max = null } = nextTimes || {}

            this.setState({ page: 1 }, () => fetchPhenomenaList({page: 0, size: PHENOMENA_PAGE_SIZE, searchableGroup: nextGroup, searchInput: textSearchValue, languageObj: nextLanguage, tags: nextTags, types: nextTypes, time_min, time_max }))
        }
    }

    handleSearchClear = () => {
        const { fetchPhenomenaList, phenomenaListData: { selectedGroup, selectedLanguage, selectedTypes, selectedTags, selectedTimes: { min: time_min = null, max: time_max = null } = {} } } = this.props

        this.setState({ textSearchValue: '', page: 1 })
        fetchPhenomenaList({ page: 0, size: PHENOMENA_PAGE_SIZE, searchableGroup: selectedGroup, searchInput: false, languageObj: selectedLanguage, tags: selectedTags, types: selectedTypes, time_min, time_max })
    }

    handleSearchChange = ({ target }) => {
        const { fetchPhenomenaList, phenomenaListData: { selectedGroup, selectedLanguage, selectedTypes, selectedTags, selectedTimes: { min: time_min = null, max: time_max = null } = {} }, setPhenomenonToTag } = this.props

        this.setState({ textSearchValue: target.value, page: 1 })

        clearTimeout(this.debounceTimeout)
        this.debounceTimeout = setTimeout(() => {
            setPhenomenonToTag(false)

            // eslint-disable-next-line
            fetchPhenomenaList({ page: 0, size: PHENOMENA_PAGE_SIZE, searchableGroup: selectedGroup, searchInput: target.value, languageObj: selectedLanguage, tags: selectedTags, types: selectedTypes, time_min, time_max })
        }, SEARCH_DEBOUNCE_TIME)
    }

    handleEditClick = phenomenon => this.setState({
        editModal: {
            type: EDIT,
            uuid: phenomenon.id,
            group: phenomenon.group
        }
    })

    handleCloneClick = phenomenon => this.setState({
        editModal: {
            type: CLONE,
            uuid: phenomenon.id,
            group: phenomenon.group
        }
    })

    closePhenomenonModal = () => {
        this.setState({ editModal: null })
        setTimeout(this.handleSearchClear(), 500)
    }

    handleGroupChange = e => {
        const { phenomenaListData: { groups }, changeGroup, resetTags } = this.props
        const selectedOption = _.find(groups, { label: e.target.innerText })

        resetTags()
        changeGroup(selectedOption)
    }

    handleTimeChange = options => {
        const { changeTime } = this.props

        changeTime(options)
    }

    handleTagChange = option => this.props.changeTag(option)

    handleTypeChange = option => {
        const { changeType, phenomenaListData: { selectedTypes } } = this.props

        if (selectedTypes.length === 1 && _.find(selectedTypes, option)) {
            return
        }

        changeType(option)
    }

    handleLanguageChange = e => {
        const { phenomenaListData: { languages }, changeLanguage } = this.props
        const selectedOption = _.find(languages, { label: e.target.innerText })
        changeLanguage(selectedOption)
    }

    handlePageChange = page => this.setState({ page })

    renderPhenomenaType = phenomenaType => {
        const { alias, id } = phenomenaType

        return (
            <div key={id} className='d-flex align-items-center ml-3'>
                <PhenomenonType type={alias} size={16} />
                <div className='ml-1' style={{ fontSize: '12px' }} >{requestTranslation(alias)}</div>
            </div>
        )
    }

    getTagLabel = selectedTags => {
        const { phenomenaListData: { selectedLanguage } } = this.props
        const lang = selectedLanguage.value === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : selectedLanguage.value

        const labels = selectedTags.map(({ label }) => (_.isString(label) ? label : label[lang]))

        return labels.join(', ')
    }

    getTimeLabel = selectedTimes => selectedTimes.map(({ label }) => _.capitalize(label)).join(', ')
    getTypeLabel = selectedTypes => selectedTypes.map(({ label }) => _.capitalize(requestTranslation(label) || label)).join(', ')


    render() {
        const {
            loading,
            phenomenaListData: {
                groups,
                languages,
                selectedGroup,
                selectedLanguage,
                total,
                selectedTimes,
                selectedTypes,
                selectedTags,
                allSelectedTypes
            },
            canEditSomePhenomena,
            storePhenomenon,
            archivePhenomenon,
            phenomenaTypesById,
            resetFilters,
            resetTypeFilters
        } = this.props

        const {
            groupsShown,
            languagesShown,
            page,
            textSearchValue,
            editModal,
            timesShown,
            typesShown,
            tagsShown
        } = this.state

        const TYPE_OPTIONS = allSelectedTypes ? _.map(allSelectedTypes, type => ({
            value: type.value,
            label: type.label,
            style: type.style
        })) : []

        return (
            <div>
                <div className='dashboard-screen-content'>
                    <div className='container'>
                        <div className='row dashboard-header-row”'>
                            <div className='col-3 col-sidebar'>
                                <h1>{requestTranslation('contentExplorer')}</h1>
                            </div>
                            <div className='col-9 col-main' />
                        </div>
                        <div className='row'>
                            <Loading color='white' shown={loading.length} />
                            <div className='col-3 col-sidebar'>
                                <h3 style={{ marginTop: '22px', marginBottom: '27px' }}>
                                    {requestTranslation('searchFilters')}
                                </h3>
                                <div className='mb-3'>
                                    <OptionDropdown
                                        label={requestTranslation('createPhenomenaFormTypeLabel')}
                                        optionsShown={typesShown}
                                        type={'type'}
                                        title={selectedTypes.length === _.size(phenomenaTypesById) ? requestTranslation('all') : this.getTypeLabel(selectedTypes)}
                                        selectedOption={selectedTypes}
                                        handleOptionSelect={this.handleTypeChange}
                                        options={TYPE_OPTIONS}
                                        onTabClick={() => this.setState({ typesShown: !typesShown })}
                                        resetFilters={resetTypeFilters}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <TimelineOptionDropdown
                                        label={requestTranslation('time')}
                                        optionsShown={timesShown}
                                        title={`${selectedTimes.min || ''} - ${selectedTimes.max || ''}`}
                                        selectedOption={selectedTimes}
                                        handleOptionSelect={this.handleTimeChange}
                                        onTabClick={() => this.setState({ timesShown: !timesShown })}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <TagOptionDropdown
                                        label={requestTranslation('tags')}
                                        optionsShown={tagsShown}
                                        title={selectedTags.length === 0 ? requestTranslation('none') : this.getTagLabel(selectedTags)}
                                        selectedOption={selectedTags}
                                        handleOptionSelect={this.handleTagChange}
                                        onTabClick={() => this.setState({ tagsShown: !tagsShown })}
                                        group={selectedGroup.value}
                                        language={selectedLanguage.value}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <OptionDropdown
                                        label={requestTranslation('group')}
                                        title={selectedGroup.label}
                                        onTabClick={() => this.setState({ groupsShown: !groupsShown })}
                                        type={'radio'}
                                        optionsShown={groupsShown}
                                        options={groups}
                                        selectedOption={selectedGroup}
                                        handleOptionSelect={this.handleGroupChange}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <OptionDropdown
                                        label={requestTranslation('language')}
                                        title={selectedLanguage.label}
                                        onTabClick={() => this.setState({ languagesShown: !languagesShown })}
                                        type={'radio'}
                                        optionsShown={languagesShown}
                                        options={languages}
                                        selectedOption={selectedLanguage}
                                        handleOptionSelect={this.handleLanguageChange}
                                    />
                                </div>
                                <button className='btn btn-outline-secondary w-100' onClick={resetFilters}>
                                    {requestTranslation('resetFilters')}
                                </button>
                                { canEditSomePhenomena ? (
                                    <CreateContainer>
                                        <h5>
                                            {requestTranslation('createNewLabel')}
                                        </h5>
                                        <button
                                            className='btn btn-lg btn-primary w-100'
                                            onClick={() => this.setState({ editModal: { type: CREATE } })}
                                        >
                                            {requestTranslation('createNew')}
                                        </button>
                                    </CreateContainer>
                                ) : null}
                            </div>
                            <div className='col-9 col-main'>
                                <FuzeNListContainer>
                                    <SearchContainer className='mb-3'>
                                        <Search
                                            type={'text'}
                                            placeholder={requestTranslation('searchByKeywords')}
                                            value={textSearchValue}
                                            onChange={this.handleSearchChange}
                                        />
                                        <ClearSearch>
                                            <MaterialIcon
                                                fontSize={'20px'}
                                                onClick={this.handleSearchClear}
                                                color='#a8a8a8'
                                            >
                                                close
                                            </MaterialIcon>
                                        </ClearSearch>
                                        <SearchIcon>
                                            <MaterialIcon color='#a8a8a8' fontSize={'20px'}>
                                                search
                                            </MaterialIcon>
                                        </SearchIcon>
                                    </SearchContainer>
                                    <ListContainer className={'fp-table'}>
                                        <Row>
                                            <div className={'fp-table-th-label'}>
                                                {requestTranslation('timestamp')}
                                            </div>
                                            <div className={'fp-table-th-label position-absolute'} style={{ left: '30%'}} >
                                                {requestTranslation('title')}
                                            </div>
                                            <div className='ml-auto d-flex'>
                                                <div className={'fp-table-th-label fp-text-icon'}>
                                                    {requestTranslation('tag')}
                                                </div>
                                                <div className={'fp-table-th-label fp-text-icon'}>
                                                    {requestTranslation('edit')}
                                                </div>
                                                <div className={'fp-table-th-label fp-text-icon'}>
                                                    {requestTranslation('clone')}
                                                </div>
                                            </div>
                                        </Row>
                                        <PhenomenaList
                                            {...this.props}
                                            handleEditClick={this.handleEditClick}
                                            handleCloneClick={this.handleCloneClick}
                                        />
                                        <Row style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            paddingRight: '0'
                                        }}>
                                            <div className='d-flex flex-column'>
                                                <div className='d-flex align-items-center'>
                                                    <CrowdSource
                                                        className='mr-2'
                                                        style={{
                                                            position: 'static',
                                                            backgroundColor: '#00C3FF'
                                                        }}
                                                    />
                                                    <CrowdSourceLabel style={{ color: 'black' }}>
                                                        {requestTranslation('authorTimerange')}
                                                    </CrowdSourceLabel>
                                                </div>
                                                <div className='d-flex align-items-center'>
                                                    <CrowdSource
                                                        className='mr-2'
                                                        style={{
                                                            position: 'static'
                                                        }}
                                                    />
                                                    <CrowdSourceLabel>
                                                        {requestTranslation('crowdTimerange')}
                                                    </CrowdSourceLabel>
                                                </div>
                                            </div>
                                            <Pagination
                                                page={page}
                                                length={total / PHENOMENA_PAGE_SIZE}
                                                onPageChange={this.handlePageChange}
                                            />
                                        </Row>
                                    </ListContainer>
                                </FuzeNListContainer>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    isOpen={!!editModal}
                    contentLabel={'Phenomena form'}
                    style={modalStyles}
                    ariaHideApp={false}
                    onRequestClose={this.closePhenomenonModal}
                >
                    {editModal && (
                        <PhenomenonLoader id={editModal.uuid} group={editModal.group}>
                            {({loading, error, phenomenon}) => {
                                if (loading) {
                                    return <div className="py-5 text-center">Loading...</div>
                                }

                                if (error) {
                                    return <div className="py-5 text-center text-danger">{error.message}</div>
                                }
                                if (phenomenon === null) {
                                  phenomenon = {}
                                }
                                const { id, ...phenomenonWithoutId } = phenomenon

                                const values = editModal.type === CLONE
                                    ? phenomenonWithoutId
                                    : phenomenon

                                return (
                                    <PhenomenonEditForm
                                        phenomenon={values}
                                        onSubmit={async (values, newsFeedChanges) => {
                                            await storePhenomenon(values, newsFeedChanges, this.closePhenomenonModal)
                                        }}
                                        onCancel={this.closePhenomenonModal}
                                        onDelete={async () => {
                                            await archivePhenomenon(phenomenon, this.closePhenomenonModal)
                                        }}
                                    />
                                )
                            }}
                        </PhenomenonLoader>

                    )}
                </Modal>
                <PhenomenaTagSelector />
                <ConfirmDialog />
                <ErrorModal />
            </div>
        )
    }
}

const SearchContainer = styled.div`
    width: 100%;
    height: 45px;
    margin-top: 15px;
    margin-bottom: 30px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.05);
    position: relative;
    border-radius: 50px;

    &:hover, &:active, &:focus {
        box-shadow: 0 0 6px 0 rgba(99,114,130,0.30);
    }
`

const Search = styled.input`
    background: white;
    border: none !important;
    padding: 0 25px 0 42px !important;
    height: 100%;
    border-radius: 50px !important;
`

export const ClearSearch = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 25px;
    top: 0;
`

export const SearchIcon = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 15px;
    top: 0;
`

const CrowdSource = styled.div`
    background-color: #637282;
    height: 8px;
    width: 8px;
    border-radius: 50%;
    position: absolute;
    top: 1px;
`

const CrowdSourceLabel = styled.div`
    font-size: 11px;
    color: #637282;
`

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-bottom: 1px solid #e8ebeb;
    min-height: 60px;
    padding-left: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    box-sizing: border-box;
`

const CreateContainer = styled.div`
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ListContainer = styled.div`
    width: 100%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05);
    background: white;
    display: flex;
    flex: 1;
    position: relative;
    flex-direction: column;
    padding-bottom: 60px;
`

