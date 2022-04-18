import _ from 'lodash'
import React from 'react'
import styled from 'styled-components'
import { useTags } from '@sangre-fp/hooks'
import { Tag } from '@sangre-fp/ui'
import { requestTranslation } from '@sangre-fp/i18n'
import { updateStoredPhenonSelector} from '../actions/radarData'
import { useDispatch } from 'react-redux'

const ELEMENT_WIDTH = 280
const FP_TOPBAR_OFFSET = process.env.NODE_ENV === 'development' ? 0 : 112


export const PhenomenaTagSelector = props => {
  const dispatch = useDispatch()
  const { group, language, phenomenon, handlePhenomenaTagMod, isInEditMode, storedPhenSelector, editModal } = props

  if (!phenomenon) {
    return null
  }

  // eslint-disable-next-line
  React.useEffect( () => {
    // storedPhenSelector.tags = phenomenon?.tags
    dispatch({ type: 'STOREDPHENOMENON', payload:  {...storedPhenSelector, tags: phenomenon?.tags}})
    // updateStoredPhenonSelector({...storedPhenSelector, tags: phenomenon?.tags})
  }, [JSON.stringify(phenomenon)])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { loading, tags, error } = useTags( 
    !!editModal && 
    !editModal?.uuid && 
    editModal?.type === 'EDIT'  && !!storedPhenSelector? storedPhenSelector?.groups[0]:
    // group)
    phenomenon?.group)
  const [ fpTags, groupTags ] = tags
  const { position: { x, y }, tags: phenomenonTags } = phenomenon
  const lang = language === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : language

  const checkTagStatus = tag => {
    const { tags } = phenomenon

    let found = false

    if (!tags || !tags.length) {
      return found
    }

    tags.map(t => {
      if (_.isEqual(t, tag.uri)) {
        found = true
      }
    })

    return found
  }
  
  if ( !phenomenon.id ) {
    phenomenon.id = storedPhenSelector?.id
  }

  return (
    <div style={{ zIndex: !!isInEditMode ? 999999 : '' }}>
      {
        !isInEditMode && (
          <Thumb style={{ left: x - 22 + 'px', top: y - FP_TOPBAR_OFFSET + window.scrollY + 'px' }} />
        )
      }
      <Padding 
          style={{ 
            zIndex: !!isInEditMode ? 999999 : '', 
            // eslint-disable-next-line no-restricted-globals
            left: (!isInEditMode ? x : (screen.width /1.7)) - ELEMENT_WIDTH - 25 + 'px', 
            // eslint-disable-next-line no-restricted-globals
            top: (!isInEditMode ? y : (screen.height / 4.1)) - FP_TOPBAR_OFFSET - 40 + window.scrollY + 'px' 
      }}>
        <ListContainer>
          {loading && (<div className='pl-2'>{requestTranslation('loading')}</div>)}
          {error && (<div className='pl-2'>{requestTranslation('tagLoadingError')}</div>)}
          {!loading && (
            <div>
              {!!(groupTags && groupTags.length) && <TagLabel className='mb-0 ml-2'>{requestTranslation('groupTags')}</TagLabel>}
              <div className={`d-flex flex-wrap flex-row ${groupTags && groupTags.length ? 'mb-4' : ''}`}>
                {groupTags && groupTags.length ? groupTags.map((tag, index) => {
                  const isActive = checkTagStatus(tag)

                  return (
                        <OptionsListItem key={index}>
                          <Tag
                            label={tag.label}
                            active={isActive}
                            onClick={() => {
                              // dispatch({ type: 'STOREDPHENOMENON', payload:  {...storedPhenSelector, tags: phenomenon?.tags}})
                              handlePhenomenaTagMod(tag, phenomenon, group)
                              
                            }}
                          />
                        </OptionsListItem>
                  )
                }) : null}
              </div>
              <TagLabel className='mb-0 mt-2 ml-2'>{requestTranslation('fpTags')}</TagLabel>
              <div className='d-flex flex-wrap flex-row'>
                {fpTags && fpTags.length && fpTags.map((tag, index) => {
                  const isActive = checkTagStatus(tag)

                  return (
                    <OptionsListItem key={index}>
                        <Tag
                          label={tag.label[lang]}
                          active={isActive}
                          onClick={() => {
                            // dispatch({ type: 'STOREDPHENOMENON', payload:  {...storedPhenSelector, tags: phenomenon?.tags}})
                            handlePhenomenaTagMod(tag, phenomenon, group)
                            
                          }}
                        />
                    </OptionsListItem>
                  )}
                )}
              </div>
            </div>
          )}
        </ListContainer>
      </Padding>
    </div>
  )
}

const ListContainer = styled.div`
  width: ${ELEMENT_WIDTH}px;
  max-height: 300px;
  height: 300px;
  overflow: auto;
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: #ECECEC;
    border-radius: 20px;
  }

  ::-webkit-scrollbar-track {
    background: white;
    border-radius: 20px;
  }
`

const Thumb = styled.div`
  background: #F6F4F7;
  width: 25px;
  height: 25px;
  transform: rotate(45deg);
  /*box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.05);*/
  position: absolute;
  z-index: 9;
`

const Padding = styled.div`
  /*box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.05);*/
  padding: 15px 8px;
  position: absolute;
  background: #F6F4F7;
  border-radius: 2px;
  z-index: 10;
`

const TagLabel = styled.div`
    font-size: 12px;
    color: #667585;
`

const OptionsListItem = styled.div`
    padding: 0 5px;
    display: flex;
    align-items: center;
    margin-top: 8px;
`
