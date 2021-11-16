import _ from 'lodash'
import React, { useRef, createRef } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { mdiTagPlusOutline, mdiTagPlus } from '@mdi/js'
import Icon from '@mdi/react'
import { useTags, usePhenomenonTypes } from '@sangre-fp/hooks'
import { MaterialIcon, PhenomenonType } from '@sangre-fp/ui'
import { getRangeValueFromYear } from '@sangre-fp/content-editor'
import { PhenomenaTagList } from './PhenomenaTagList'
import { getPhenomenonUrl } from '../helpers'

// TODO: create container for this component to offset phenomenapage container
// also: move some of the styled-components into UI

export const PhenomenaList = props => {
  const {
    phenomenaListData: {
        groups,
        canEditPublic,
        phenomenaList,
        phenomenonToTag
    },
    canEditSomePhenomena,
    loading,
    handleEditClick,
    handleCloneClick,
    setPhenomenonToTag,
    group,
    language,
    highest_group_role
  } = props

  const { tags: tagList } = useTags(group?.value || group)
  const { phenomenonTypes, phenomenonTypesById } = usePhenomenonTypes(group?.value || group)
  const itemsRef = useRef([])

  if (itemsRef.current.length !== phenomenaList.length) {
    // add or remove refs
    itemsRef.current = Array(phenomenaList.length).fill().map((_, i) => itemsRef.current[i] || createRef())
  }

  const calculateTimingWidth = timing => {
      const { min, max } = timing

      return `${getRangeValueFromYear(max) - getRangeValueFromYear(min)}%`
  }

  const setPhenomenaSelectorPosition = (e, i, phenomenon) => {
      const position = ReactDOM.findDOMNode(itemsRef.current[i].current).getBoundingClientRect()

      setPhenomenonToTag({...phenomenon, position })
  }

  return (
    <div>
        {phenomenaList.length ? phenomenaList.map((phenomenon, i) => {
            let { content: { title, type, time_range }, group, crowdSourcedValue } = phenomenon
            if (!time_range) {
              time_range = {}
            }
            const { min, max } = time_range
            const phenomenaGroup = _.find(groups, { value: group })
            const canEdit = phenomenaGroup ? phenomenaGroup.canEdit : false
            const phenomenonType = phenomenonTypesById && phenomenonTypesById[type]
              ? phenomenonTypesById[type].alias
              : 'undefined'
            const freePlan = (highest_group_role === 'free') ? (highest_group_role === 'free') :  (group && group.availableResources && group.availableResources.plan === 'free')
            const customTypeObj = _.find(phenomenonTypes, ({ id }) => id === type)
            const customTypeStyle = customTypeObj && customTypeObj.style
            /*
                - Group editors can change group-specific tags both in public phenomena and group specific phenomena
                - Group editor can change fp tags (e.g. "Climate Change") in group specific phenomena (not the public ones)
                - FP Editors (public edit powers) can change fp tags in public phenomena
            */
            const canTag = group ? (canEdit && !freePlan) : canEditPublic

            return (
                <Row key={i}>
                    <div className='d-flex flex-start align-items-center' style={{ width: '70%' }}>
                        <div className='d-flex align-items-center'>
                            <TimingContainer>
                                <TimingRail />
                                <Timing
                                    style={{
                                        width: (time_range.min && time_range.max) ? calculateTimingWidth(time_range) : '0px',
                                        left: (time_range.min && time_range.max) ? `${getRangeValueFromYear(time_range.min)}%` : 0
                                    }}
                                />
                                {crowdSourcedValue && (
                                    <CrowdSource style={{ left: `${getRangeValueFromYear(Number(crowdSourcedValue))}%` }} />
                                )}
                            </TimingContainer>
                            <div className='ml-3'>
                                <div>{min}-{max}</div>
                                <div className='d-flex align-items-center'>
                                    <PhenomenonType size={9} type='crowd' />
                                    {
                                        !freePlan 
                                            && <CrowdSourceLabel className='ml-1'>{crowdSourcedValue ? Math.trunc(crowdSourcedValue) : '-'}</CrowdSourceLabel>
                                    }
                                    {
                                        freePlan 
                                            && <div style={{background:'#4c4949', width:"60%", height:'0.7rem'}} > </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='d-flex left align-items-center hoverable ml-auto' data-href={getPhenomenonUrl(false, phenomenon)} style={{ width: '60%' }}>
                            <State className='d-flex align-items-center'>
                                <PhenomenonType size={16} type={phenomenonType} fill={customTypeStyle && customTypeStyle.color} />
                            </State>
                            <div className='w-100'>
                                <PhenomenaTitle>{title}</PhenomenaTitle>
                                <PhenomenaTagList
                                    phenomena={phenomenon}
                                    language={language.value || language}
                                    tagList={tagList}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='d-flex align-items-center' style={{ width: '30%' }}>
                        <div className='ml-auto fp-text-icon'></div>
                        <Icon
                            ref={itemsRef.current[i]}
                            path={phenomenonToTag && phenomenonToTag.id === phenomenon.id ? mdiTagPlus : mdiTagPlusOutline}
                            className={`fp-text-icon ${canTag ? 'hoverable' : ''}`}
                            size={1}
                            color={!canTag ? 'gray' : '#006998'}
                            style={{ position: 'relative', top: '1px' }}
                            onClick={e => {
                                return (phenomenonToTag && phenomenonToTag.id === phenomenon.id) || !canTag ? setPhenomenonToTag(false) : setPhenomenaSelectorPosition(e, i, phenomenon)
                            }}
                        />
                        { !Number(group === 0) ? (
                            <MaterialIcon
                                onClick={canEdit && !freePlan ?
                                    () => handleEditClick(phenomenon) : null}
                                disabled={!canEdit || freePlan}
                                size='14px'
                                color={canEdit && !freePlan ? '#006998' : 'gray'}
                                className='fp-text-icon'
                            >
                                edit
                            </MaterialIcon>
                        ) : (
                            <MaterialIcon
                                onClick={canEditPublic && !freePlan ?
                                    () => handleEditClick(phenomenon) : null}
                                disabled={!canEditPublic || freePlan}
                                size='14px'
                                color={canEditPublic && !freePlan ? '#006998' : 'gray'}
                                className='fp-text-icon'
                            >
                                edit
                            </MaterialIcon>
                        )}
                        <MaterialIcon
                            className='fp-text-icon'
                            disabled={!canEditSomePhenomena || freePlan}
                            onClick={canEditSomePhenomena && !freePlan ? () => handleCloneClick(phenomenon) : null}
                            size='14px'
                            color={freePlan ? 'gray' : '#006998'}
                        >
                            file_copy
                        </MaterialIcon>
                    </div>
                </Row>
            )
        })
        :
        (<NoResultsContainer>
            <label>{loading.length ? 'Loading...' : 'No results found'}</label>
        </NoResultsContainer>)
    }
    </div>
  )
}

const NoResultsContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
`

const PhenomenaTitle = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
`

const State = styled.div`
    margin-right: 12px;
`

const TimingContainer = styled.div`
    width: 100px;
    position: relative;
    height: 10px;
    display: flex;
    align-items: center;
`

const TimingRail = styled.div`
    width: 100%;
    height: 4px;
    background-color: #D8D8D8;
    position: absolute;
    left: 0;
    border-radius: 2px;
`

const Timing = styled.div`
    height: 100%;
    position: absolute;
    background-color: #00C3FF;
    width: 25%;
    left: 25%;
    border-radius: 5px;
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
