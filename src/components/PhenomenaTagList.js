import React from 'react'
import _ from 'lodash'
import { Tag } from '@sangre-fp/ui'

export const PhenomenaTagList = props => {
    let tags ;
    if ( !props?.phenomena?.tags) {
tags =[]
    } else {
        tags = props?.phenomena?.tags
    }
  const { language, phenomena, tagList } = props
  const renderPhenomenaTags = tagList && tagList.length && tags && tags.length
  const lang = language === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : language

  if (!renderPhenomenaTags) {
    return null
  }

  return (
    <div className='d-flex flex-row flex-wrap'>
        {renderPhenomenaTags && tags.map((tagUri, index) => {
          const tagObj = _.find(tagList[0], ({ uri }) => uri === tagUri) || _.find(tagList[1], ({uri }) => uri === tagUri)

          if (!tagObj) {
            return null
          }

          const label = _.isString(tagObj.label) ? tagObj.label : tagObj.label[lang]

          return (
            <Tag key={index} active onClick={null} label={label} small />
          )
        })}
    </div>
  )
}