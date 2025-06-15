import React from 'react'
import './MainTitle.css'
function MainTitle({mtext1, mtext2}) {
  return (
    <div >
      <div className='MT-main'> 
        <p className='firstMainText'>{mtext1} <span className='secondMainText'>{mtext2}</span></p>
        <p className='w-4 sm:w-12 h-[1px] sm:h-[3px] line-color'></p>
      </div>
    </div>
  )
}

export default MainTitle
