import React from 'react'
import './Title.css'
function Title({text1, text2}) {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='inline-flex gap-3 items-center mb-3'> 
        <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] line-color'></p>
            <p className='firstTitleText'>{text1} <span className='font-medium secondTitleText'>{text2}</span></p>
        <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] line-color'></p>
      </div>
    </div>
  )
}

export default Title
