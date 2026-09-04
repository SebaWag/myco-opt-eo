import { Section1_WhatLiesBeneath } from './Section1_WhatLiesBeneath'
import { Section2_ScaleIsInsane } from './Section2_ScaleIsInsane'
import { Section3_UndergroundEconomy } from './Section3_UndergroundEconomy'
import { Section4_MotherTrees } from './Section4_MotherTrees'
import { Section5_KinAndStrangers } from './Section5_KinAndStrangers'
import { Section6_TheFrontier } from './Section6_TheFrontier'
import { Section7_Explore } from './Section7_Explore'

export function ScrollNarrative() {
  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <Section1_WhatLiesBeneath />
        <Section2_ScaleIsInsane />
        <Section3_UndergroundEconomy />
        <Section4_MotherTrees />
        <Section5_KinAndStrangers />
        <Section6_TheFrontier />
        <Section7_Explore />
      </div>
    </div>
  )
}
