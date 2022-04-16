import React, { PureComponent } from 'react'
import styled from 'styled-components'
import {
    Modal,
    Loading,
    Pagination,
    Search,
    PhenomenonType,
    modalStyles,
    FuzeNListContainer
} from '@sangre-fp/ui'
import ErrorModal from '../containers/ErrorModal'
import ConfirmDialog from '../containers/ConfirmDialogContainer'
import PhenomenaTagSelector from '../containers/PhenomenaTagSelector'
import { PhenomenaList } from './PhenomenaList'
import { requestTranslation } from '@sangre-fp/i18n'
import { PhenomenonEditForm } from './PhenomenonEditForm'
import { PhenomenonLoader } from '@sangre-fp/hooks'
import ContentFilters from '@sangre-fp/content-filters'
import CrowdSourceLegend from './CrowdSourceLegend'
import { getUserId } from '@sangre-fp/connectors/session'
import drupalApi from "@sangre-fp/connectors/drupal-api";

const CREATE = 'CREATE'
const EDIT = 'EDIT'
const CLONE = 'CLONE'
const PHENOMENA_PAGE_SIZE = 12

class PhenomenaPage extends PureComponent {
    constructor(props) {
        super(props);
        this.isSearched = React.createRef();
      }
    state = {
        editModal: null,
        page: 1,
        textSearchValue: '',
        group: 0,
        language: document.querySelector('html').getAttribute('lang') || 'en',
        groups: null,
        isGroupsLoading: false,
        tags: null
    }

    async componentWillMount() {
        const { getAuth, getGroups, getPhenomenaTypes } = this.props

        const res = await getAuth()
            .then(() => Promise.all([
                getGroups(),
                getPhenomenaTypes(0),
                drupalApi.getGroupsWithMemberShips()
            ]))
        this.setState({
            groups: res[2],
            isGroupsLoading: !res[2]
        })
    }

    // async componentDidMount() {
    //     const getGroups = await drupalApi.getGroupsWithMemberShips()
    //     this.setState({
    //         groups: getGroups
    //     })
    // }

    handleSearchClear = () => this.setState({ textSearchValue: '', page: 1 })

    handleSearchChange = ({ target }) => {
        this.setState({ 
            textSearchValue: target.value,
            page: 1,
            isFiltered: (this.state.textSearchValue !== '' || !!this.state.textSearchValue.length || !!this.isSearched.current)
        })
        this.isSearched.current = true
    }

    handleFilterChange = ({ types, times, tags, language, group, page, search, filtersActive, isFiltered }) => {
        const {
            fetchPhenomenaList,
            phenomenaListData: { phenomenaList },
            setPhenomenonToTag
        } = this.props
        this.setState
            ({ tags, group, language,
                isFiltered : (!!isFiltered 
                    || !!this.state.textSearchValue.length 
                    || !!this.isSearched.current )  }, () => {
                        const totalPages = phenomenaList.length / PHENOMENA_PAGE_SIZE

                        if (totalPages <= page) {
                            setPhenomenonToTag(false)
                            fetchPhenomenaList({
                                page: page - 1,
                                size: PHENOMENA_PAGE_SIZE,
                                searchableGroup: !this.state.isFiltered ? {
                                    "value": 0
                                }: group,
                                searchInput: search,
                                languageObj: language,
                                tags,
                                types,
                                time_max: times.max,
                                time_min: times.min
                            })
                        }
                    })

        
    }

    handleEditClick = (phenomenon, i) => {
        this.setState({
            editModal: {
                type: EDIT,
                uuid: phenomenon.id,
                group: phenomenon.group
            },
            indexForTagging: i
        })
    }

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

    
    render() {
        const {
            loading,
            phenomenaListData: {
                total
            },
            canEditSomePhenomena,
            storePhenomenon,
            archivePhenomenon,
            storedPhenSelector
        } = this.props

        const {
            page,
            textSearchValue,
            editModal,
            group,
            language,
            indexForTagging
        } = this.state
        console.log('editModaleditModal', editModal, storedPhenSelector)
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
                            {
                                !this.state.groups ? (
                                    <Loading color='white' shown={loading.length} />
                                ) : 
                                (
                                    <>
                                        <div className='col-3 col-sidebar'>
                                            <h3 style={{ marginTop: '22px', marginBottom: '27px' }}>
                                                {requestTranslation('searchFilters')}
                                            </h3>
                                            {getUserId() && (
                                                <ContentFilters
                                                    page={page}
                                                    search={textSearchValue}
                                                    onFilterChange={this.handleFilterChange}
                                                    groupsProp={this.state.groups}
                                                    groupsLoading={this.state.isGroupsLoading}
                                                    highest_group_role={this.props.highest_group_role}
                                                    isFilteredProp={this.state.isFiltered}
                                                />
                                            )}
                                            { canEditSomePhenomena ? (
                                                <CreateContainer>
                                                    <h5>
                                                        {requestTranslation('createNewLabel')}
                                                    </h5>
                                                    <button
                                                        className='btn btn-lg btn-primary w-100'
                                                        onClick={() => this.setState({ editModal: { type: CREATE } })}
                                                        style={{opacity: this.props.highest_group_role ==='free' ? 0.5 : 1}}
                                                        disabled={this.props.highest_group_role ==='free'}
                                                    >
                                                        {requestTranslation('createNew')}
                                                    </button>
                                                </CreateContainer>
                                            ) : null}
                                        </div>
                                        <div className='col-9 col-main' style={{opacity: this.props.highest_group_role ==='free' ? 0.5 : 1, position: 'relative'}}>
                                            {this.props.highest_group_role ==='free' && <div
                                                id="right-side-content-expl"
                                                style={{position:'absolute', height: '100%', width: '100%', zIndex: 999, cursor: 'pointer'}}></div>}
                                            <FuzeNListContainer>
                                                <Search
                                                    value={textSearchValue}
                                                    onChange={this.handleSearchChange}
                                                    onClear={this.handleSearchClear}
                                                    className='mb-3'
                                                />
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
                                                    {
                                                    
                                                        <PhenomenaList
                                                            {...this.props}
                                                            language={language}
                                                            group={!this.state.isFiltered ? 0 : group}
                                                            handleEditClick={this.handleEditClick}
                                                            handleCloneClick={this.handleCloneClick}
                                                            groups={this.state.groups}
                                                            highest_group_role={this.props.highest_group_role}
                                                            isFilteredProps={this.state.isFiltered}
                                                        />
                                                    }
                                                    {
                                                        page > 0 && (
                                                            <Row style={{
                                                                position: 'absolute',
                                                                bottom: '0',
                                                                left: '0',
                                                                width: '100%',
                                                                justifyContent: 'space-between',
                                                                paddingRight: '0'
                                                            }}>
                                                                <CrowdSourceLegend />
                                                                <Pagination
                                                                    page={page}
                                                                    length={total / PHENOMENA_PAGE_SIZE}
                                                                    onPageChange={this.handlePageChange}
                                                                />
                                                            </Row>
                                                        )
                                                    }
                                                </ListContainer>
                                            </FuzeNListContainer>
                                        </div>
                                    </>
                                )
                            }
                            
                            
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

                                console.log('phenomenonphenomenon333', phenomenon)
                                const values = editModal.type === CLONE
                                    ? phenomenonWithoutId
                                    : phenomenon

                                return (
                                    <PhenomenonEditForm
                                        {...this.props}
                                        IsCreateNewContentCard={this.state?.editModal?.type?.toString() === 'CREATE'}
                                        indexForTagging={indexForTagging}
                                        highest_group_role={this.props.highest_group_role}
                                        isFilteredProps={this.state.isFiltered}
                                        group={!this.state.isFiltered ? 0 : group}
                                        language={language}
                                        createOrEditMode={true}
                                        phenomenon={values}
                                        onSubmit={async (values, newsFeedChanges) => {
                                            console.log('valuesvalues', values, newsFeedChanges)
                                            if (this.state.editModal.type === 'CREATE') {
                                                await storePhenomenon(values, newsFeedChanges, () => {
                                                    this.setState({
                                                        editModal: {
                                                            type: EDIT,
                                                            uuid: null,
                                                            group: null
                                                        },
                                                        indexForTagging: indexForTagging
                                                    })
                                                })
                                            } else {
                                                // storedPhenSelector
                                                !!this.state.editModal?.uuid 
                                                    ? await storePhenomenon(values, newsFeedChanges, this.closePhenomenonModal)
                                                    : await storePhenomenon({
                                                        archived: storedPhenSelector?.archived,
                                                        content: storedPhenSelector?.content,
                                                        groups: storedPhenSelector?.groups,
                                                        id: storedPhenSelector?.id,
                                                        language: storedPhenSelector?.language,
                                                        type: storedPhenSelector?.type
                                                    }, newsFeedChanges, this.closePhenomenonModal)
                                            }
                                            
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

                <PhenomenaTagSelector
                    group={group?.value || group || this.state?.groups}
                    language={language.value || language}
                    isInEditMode={!!editModal}
                />
                <ConfirmDialog />
                <ErrorModal />
            </div>
        )
    }
}
const PhenomenaPageMemo = React.memo(PhenomenaPage)
export default PhenomenaPageMemo

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

