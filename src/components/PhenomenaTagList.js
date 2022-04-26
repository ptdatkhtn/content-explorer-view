import React from 'react'
import _ from 'lodash'
// import { Tag } from '@sangre-fp/ui'
import Tag from './Tag_sangre_ui'

import { useSelector } from 'react-redux'
export const PhenomenaTagList = ( {language, phenomena, tagList, editModal}) => {
// eslint-disable-next-line react-hooks/rules-of-hooks
const tags = (!!editModal && editModal?.type === 'EDIT' && !editModal?.uuid) 
  // eslint-disable-next-line react-hooks/rules-of-hooks
  ? useSelector(state => state?.radarSettings?.storedPhenomenon.tags)
  : phenomena?.tags

  const tags2 = (!!editModal && editModal?.type === 'EDIT' && !editModal?.uuid) 
  // eslint-disable-next-line react-hooks/rules-of-hooks
  ? useSelector(state => state?.radarSettings?.storedPhenomenon)
  : phenomena?.tags

  const renderPhenomenaTags = tagList && tagList.length && tags && tags?.length
  const lang = language === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : language

  if (!renderPhenomenaTags) {
    return null
  }

  console.log('editModaleditModal', editModal)
  return (
    <div className='d-flex flex-row flex-wrap'>
        { renderPhenomenaTags && tags?.map((tagUri, index) => {
          const tagObj = _.find(tagList[0], ({ uri }) => uri === tagUri) || _.find(tagList[1], ({uri }) => uri === tagUri)
          if (!tagObj) {
            return null
          }
          console.log('tagg', tagUri, tagObj)
          const label = _.isString(tagObj.label) ? tagObj.label : tagObj.label[lang]
          const tagUriSplit = tagUri?.split("/")
          const isFPTags= tagUriSplit[1] === "theme" ? true : false
          // console.log('isFpTags', tagUri, isFPTags, tagUriSplit)
          return (
            <Tag key={index} active onClick={null} label={label} small isFPTags={isFPTags} isNotFilter={true} />
          )
        })}
    </div>
  )
}