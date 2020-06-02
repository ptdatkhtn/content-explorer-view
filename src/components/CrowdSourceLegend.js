import React from 'react'
import styled from 'styled-components'
import { requestTranslation } from '@sangre-fp/i18n'

const CrowdSourceLegend = () => (
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
)

export default CrowdSourceLegend

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