import React from 'react'
import _ from 'lodash'
import { Tag } from '@sangre-fp/ui'
import { useSelector } from 'react-redux'
export const PhenomenaTagList = ( {language, phenomena, tagList, editModal}) => {
  // console.log('propsss99', props)
//     let tags ;
//     if ( !props?.phenomena?.tags) {
// tags =[]
//     } else {
//         tags = props?.phenomena?.tags
//     }

console.log('statestate99', editModal)

  
  // if ( !! phenomena && !phenomena?.tags) {
  //   phenomena.tags = []
  // }
// eslint-disable-next-line react-hooks/rules-of-hooks
const tags = (!!editModal && editModal?.type === 'EDIT' && !editModal?.uuid) 
  // eslint-disable-next-line react-hooks/rules-of-hooks
  ? useSelector(state => state?.radarSettings?.storedPhenomenon.tags)
  : phenomena?.tags

console.log('statestate',phenomena, tags, editModal)
  const renderPhenomenaTags = tagList && tagList.length && tags && tags?.length
  const lang = language === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : language
  console.log('propsss998', tags, tagList, phenomena?.tags, renderPhenomenaTags)
  if (!renderPhenomenaTags) {
    return null
  }

  return (
    <div className='d-flex flex-row flex-wrap'>
        { renderPhenomenaTags && tags?.map((tagUri, index) => {
          const tagObj = _.find(tagList[0], ({ uri }) => uri === tagUri) || _.find(tagList[1], ({uri }) => uri === tagUri)
          console.log('tagObjtagObj', tagObj)
          if (!tagObj) {
            return null
          }

          const label = _.isString(tagObj.label) ? tagObj.label : tagObj.label[lang]
          console.log('labellabel', label)

          return (
            <Tag key={index} active onClick={null} label={label} small />
          )
        })}
    </div>
  )
}