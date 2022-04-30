import React from 'react'
import styled from 'styled-components'
// 80A0C0 FP tags
// 3C6A97 group tags
//#00c3ff lightblue
const Tag = ({ label, active, onClick, small, highest_group_role,  disabled, isFPTags=false, isNotFilter=false}) => {

  return (
    <TagDiv
      className='d-flex align-items-center justify-content-center'
      onClick={onClick}
      small={small}
      style={{
        backgroundColor: (active && !!isNotFilter && isFPTags) ? '#80A0C0' //FP Tags edit mode active
        : (active && isNotFilter && !isFPTags) ? '#3C6A97' //group tags edit mode active
        : (active && !isNotFilter && !isFPTags) ? '#00C3FF' //filter mode active
        : (!active && !isNotFilter) ? '#3C6A97' //filter mode inactive
        : 'transparent',
        color: (active && isNotFilter) ? 'white'  //edit mode active
        : (!active && isNotFilter) ? '#8593A1' //edit mode inactive
        : 'white', //filter mode inactive , filter mode active

        border: active ? 'none' : '1px solid #8593A1'
      }}
    >
      {label}
    </TagDiv>
  )
}

export default Tag

const TagDiv = styled.div`
  color: white;
  // text-transform: uppercase;
  font-size: ${({small}) => small ? '10px' : '11px'};
  padding: ${({small}) => small ? '3px 10px' : '4px 12px;'};
  min-height: ${({small}) => small ? '15px' : '20px'};
  font-weight: 500;
  border-radius: 30px;
  width: fit-content;
  flex-shrink: 0;
  margin-right: ${({small}) => small ? '5px' : '0px'};
  margin-top: ${({small}) => small ? '5px' : '0px'};
  &:hover {
    background-color: #00C3FF;
    cursor: pointer;
  }
`