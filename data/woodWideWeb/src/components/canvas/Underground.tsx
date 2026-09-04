import type { ComputedNetwork } from '../../types/network'
import { NetworkNodes } from './NetworkNodes'
import { NetworkEdges } from './NetworkEdges'
import { NutrientParticles } from './NutrientParticles'
import { FungalGenets } from './FungalGenets'
import { DefenceSignal } from './DefenceSignal'

interface Props {
  network: ComputedNetwork
}

export function Underground({ network }: Props) {
  return (
    <group>
      <FungalGenets network={network} />
      <NetworkEdges network={network} />
      <NetworkNodes network={network} />
      <NutrientParticles network={network} />
      <DefenceSignal network={network} />
    </group>
  )
}
