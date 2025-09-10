import React, { useContext } from 'react'
import Cover from '../components/Cover.jsx'
import BestSeller from '../components/BestSeller.jsx'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import ImportantNote from '../components/Notice/ImportantNote.jsx'
import { ShopContext } from '../context/ShopContext.jsx'

function Home() {
  const {showImportantNote} = useContext(ShopContext);

  return (
    <div>
      {showImportantNote && <ImportantNote />}
      <Cover/>
      <BestSeller/>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Home
