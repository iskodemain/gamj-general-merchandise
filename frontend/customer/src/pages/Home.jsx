import React from 'react'
import Cover from '../components/Cover.jsx'
import BestSeller from '../components/BestSeller.jsx'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
  return (
    <div>
      <Cover/>
      <BestSeller/>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Home
